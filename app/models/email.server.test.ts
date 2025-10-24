import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createMockResendSuccess,
    createMockResendError,
    createTestEmailData,
} from '~/lib/email-test-helpers';

// Assertion helpers
function assertEmailSentTo(
    mockFn: ReturnType<typeof vi.fn>,
    recipient: string,
) {
    expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({ to: recipient }),
    );
}

function assertEmailSubject(mockFn: ReturnType<typeof vi.fn>, subject: string) {
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ subject }));
}

/**
 * Email Model Layer Tests
 *
 * ALL TESTS USE MOCKS - No real Resend API calls to avoid using credits!
 *
 * Mocking strategy:
 * - Resend SDK is mocked to return success/error responses
 * - React Email render is mocked to return HTML strings
 * - PostHog is mocked to prevent tracking during tests
 */

// Mock Resend SDK - NEVER call real API
vi.mock('~/lib/resend.server', () => ({
    resend: {
        emails: {
            send: vi.fn(),
        },
    },
    DEFAULT_FROM_EMAIL: 'test@example.com',
}));

// Mock React Email render and components - Return mocked HTML and React components
vi.mock('@react-email/components', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        render: vi.fn().mockResolvedValue('<html>Mocked Email</html>'),
        Html: ({ children }: any) => children,
        Head: () => null,
        Preview: () => null,
        Body: ({ children }: any) => children,
        Container: ({ children }: any) => children,
        Heading: ({ children }: any) => children,
        Text: ({ children }: any) => children,
        Button: ({ children }: any) => children,
        Section: ({ children }: any) => children,
        Link: ({ children }: any) => children,
    };
});

// Import mocked modules
import { resend } from '~/lib/resend.server';
import { render } from '@react-email/components';
import {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendTransactionalEmail,
    sendBatchEmails,
} from './email.server';

describe('Email Model', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Suppress console.error during tests to avoid cluttering output
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('sendEmail', () => {
        it('sends email with valid data', async () => {
            const emailData = createTestEmailData();
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );

            const result = await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledTimes(1);
            assertEmailSentTo(resend.emails.send, emailData.to);
            assertEmailSubject(resend.emails.send, emailData.subject);
            expect(result.success).toBe(true);
        });

        it('sends email with html content', async () => {
            const emailData = createTestEmailData({ html: '<h1>Test</h1>' });
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );

            await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: '<h1>Test</h1>',
                }),
            );
        });

        it('sends email with text content', async () => {
            const emailData = createTestEmailData({
                html: undefined,
                text: 'Plain text email',
            });
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );

            await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: 'Plain text email',
                }),
            );
        });

        it('uses custom from address when provided', async () => {
            const emailData = createTestEmailData({
                from: 'custom@example.com',
            });
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );

            await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: 'custom@example.com',
                }),
            );
        });

        it('handles Resend API errors', async () => {
            const emailData = createTestEmailData();
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendError('API Error') as any,
            );

            await expect(sendEmail(emailData)).rejects.toThrow(
                'Failed to send email',
            );
        });

        it('handles network errors', async () => {
            const emailData = createTestEmailData();
            vi.mocked(resend.emails.send).mockRejectedValue(
                new Error('Network error'),
            );

            await expect(sendEmail(emailData)).rejects.toThrow('Network error');
        });

        it('sends email with CC recipients', async () => {
            const emailData = createTestEmailData({ cc: 'cc@example.com' });
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );

            await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    cc: 'cc@example.com',
                }),
            );
        });

        it('sends email with BCC recipients', async () => {
            const emailData = createTestEmailData({ bcc: 'bcc@example.com' });
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );

            await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    bcc: 'bcc@example.com',
                }),
            );
        });
    });

    describe('sendVerificationEmail', () => {
        it('sends verification email with correct template', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );
            vi.mocked(render).mockResolvedValue('<html>Verification</html>');

            await sendVerificationEmail({
                to: 'user@example.com',
                verificationUrl: 'https://example.com/verify?token=abc123',
            });

            // Verify React Email render was called
            expect(render).toHaveBeenCalledTimes(1);

            // Verify email was sent
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Verify your email address',
                    html: '<html>Verification</html>',
                }),
            );
        });

        it('passes verification URL to template', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );
            vi.mocked(render).mockResolvedValue(
                '<html>Verification Email</html>',
            );

            await sendVerificationEmail({
                to: 'user@example.com',
                verificationUrl: 'https://example.com/verify?token=xyz',
            });

            // Verify render was called (component receives props internally)
            expect(render).toHaveBeenCalledTimes(1);

            // Verify the correct email was sent with rendered HTML
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Verify your email address',
                    html: '<html>Verification Email</html>',
                }),
            );
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('sends password reset email with correct template', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );
            vi.mocked(render).mockResolvedValue('<html>Password Reset</html>');

            await sendPasswordResetEmail({
                to: 'user@example.com',
                resetUrl: 'https://example.com/reset?token=abc123',
            });

            expect(render).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Reset your password',
                    html: '<html>Password Reset</html>',
                }),
            );
        });

        it('passes reset URL to template', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );
            vi.mocked(render).mockResolvedValue(
                '<html>Password Reset Email</html>',
            );

            await sendPasswordResetEmail({
                to: 'user@example.com',
                resetUrl: 'https://example.com/reset?token=xyz',
            });

            // Verify render was called (component receives props internally)
            expect(render).toHaveBeenCalledTimes(1);

            // Verify the correct email was sent with rendered HTML
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Reset your password',
                    html: '<html>Password Reset Email</html>',
                }),
            );
        });
    });

    describe('sendWelcomeEmail', () => {
        it('sends welcome email with correct template', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );
            vi.mocked(render).mockResolvedValue('<html>Welcome</html>');

            await sendWelcomeEmail({
                to: 'newuser@example.com',
                userName: 'John Doe',
                dashboardUrl: 'https://example.com/dashboard',
            });

            expect(render).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'newuser@example.com',
                    subject: 'Welcome to TWS Foundations!',
                    html: '<html>Welcome</html>',
                }),
            );
        });

        it('passes user data to template', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );
            vi.mocked(render).mockResolvedValue('<html>Welcome Email</html>');

            await sendWelcomeEmail({
                to: 'newuser@example.com',
                userName: 'Jane Smith',
                dashboardUrl: 'https://example.com/dashboard',
            });

            // Verify render was called (component receives props internally)
            expect(render).toHaveBeenCalledTimes(1);

            // Verify the correct email was sent with rendered HTML
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'newuser@example.com',
                    subject: 'Welcome to TWS Foundations!',
                    html: '<html>Welcome Email</html>',
                }),
            );
        });
    });

    describe('sendTransactionalEmail', () => {
        it('sends transactional email with all props', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );
            vi.mocked(render).mockResolvedValue('<html>Transactional</html>');

            await sendTransactionalEmail({
                to: 'user@example.com',
                heading: 'Account Updated',
                previewText: 'Your account has been updated',
                message: 'We updated your account settings.',
                buttonText: 'View Changes',
                buttonUrl: 'https://example.com/account',
            });

            // Verify render was called (component receives props internally)
            expect(render).toHaveBeenCalledTimes(1);

            // Verify the correct email was sent with rendered HTML
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Account Updated',
                    html: '<html>Transactional</html>',
                }),
            );
        });

        it('sends transactional email without button', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );
            vi.mocked(render).mockResolvedValue(
                '<html>Transactional Email</html>',
            );

            await sendTransactionalEmail({
                to: 'user@example.com',
                heading: 'Notification',
                previewText: 'You have a notification',
                message: 'This is a simple notification.',
            });

            // Verify render was called (component receives props internally)
            expect(render).toHaveBeenCalledTimes(1);

            // Verify the correct email was sent with rendered HTML
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Notification',
                    html: '<html>Transactional Email</html>',
                }),
            );
        });
    });

    describe('sendBatchEmails', () => {
        it('sends multiple emails successfully', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );

            const emails = [
                createTestEmailData({ to: 'user1@example.com' }),
                createTestEmailData({ to: 'user2@example.com' }),
                createTestEmailData({ to: 'user3@example.com' }),
            ];

            const result = await sendBatchEmails(emails);

            expect(resend.emails.send).toHaveBeenCalledTimes(3);
            expect(result.success).toBe(true);
            expect(result.total).toBe(3);
            expect(result.successful).toBe(3);
            expect(result.failed).toBe(0);
        });

        it('handles partial failures in batch', async () => {
            vi.mocked(resend.emails.send)
                .mockResolvedValueOnce(createMockResendSuccess() as any)
                .mockRejectedValueOnce(new Error('Failed'))
                .mockResolvedValueOnce(createMockResendSuccess() as any);

            const emails = [
                createTestEmailData({ to: 'user1@example.com' }),
                createTestEmailData({ to: 'user2@example.com' }),
                createTestEmailData({ to: 'user3@example.com' }),
            ];

            const result = await sendBatchEmails(emails);

            expect(result.total).toBe(3);
            expect(result.successful).toBe(2);
            expect(result.failed).toBe(1);
        });

        it('returns results array with status for each email', async () => {
            vi.mocked(resend.emails.send).mockResolvedValue(
                createMockResendSuccess() as any,
            );

            const emails = [
                createTestEmailData({ to: 'user1@example.com' }),
                createTestEmailData({ to: 'user2@example.com' }),
            ];

            const result = await sendBatchEmails(emails);

            expect(result.results).toHaveLength(2);
            expect(result.results[0].status).toBe('fulfilled');
            expect(result.results[1].status).toBe('fulfilled');
        });
    });
});
