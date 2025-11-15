import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ResendMock } from '~/lib/email-test-helpers';
import {
    ensureResendMock,
    resetResendMock,
    createMockResendSuccess,
    createMockResendError,
    createTestEmailData,
} from '~/lib/email-test-helpers';

// Create the hoisted stub inline so the hoisted callback does not reference
// imported helper functions (which may not be initialized yet due to
// Vitest's hoisting). This avoids the "Cannot access '__vi_import_0__'"
// reference error.
const resendStub = vi.hoisted(() => ({
    emails: {
        send: vi.fn(),
    },
})) as ResendMock;

vi.mock('~/lib/resend.server', () => {
    return {
        resend: resendStub,
        DEFAULT_FROM_EMAIL: 'test@example.com',
    };
});

vi.mock('@react-email/components', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@react-email/components')>();

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

import { resend as resendClient } from '~/lib/resend';
import { render } from '@react-email/components';
import {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendTransactionalEmail,
    sendBatchEmails,
} from './email.server';

const renderMock = vi.mocked(render);

function getResendMock(): ResendMock {
    return ensureResendMock(resendClient);
}

function expectEmailSentTo(mock: ResendMock, recipient: string) {
    expect(mock.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: recipient }),
    );
}

function expectEmailSubject(mock: ResendMock, subject: string) {
    expect(mock.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({ subject }),
    );
}

let resend: ResendMock;

describe('email model', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resend = getResendMock();
        resetResendMock(resend);
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('sendEmail', () => {
        it('sends email with valid data', async () => {
            const emailData = createTestEmailData();
            resend.emails.send.mockResolvedValue(createMockResendSuccess());

            const result = await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledTimes(1);
            expectEmailSentTo(resend, emailData.to as string);
            expectEmailSubject(resend, emailData.subject);
            expect(result.success).toBe(true);
        });

        it('includes html content when provided', async () => {
            const emailData = createTestEmailData({ html: '<h1>HTML</h1>' });
            resend.emails.send.mockResolvedValue(createMockResendSuccess());

            await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({ html: '<h1>HTML</h1>' }),
            );
        });

        it('includes text content when provided', async () => {
            const emailData = createTestEmailData({
                html: undefined,
                text: 'Plain text email',
            });
            resend.emails.send.mockResolvedValue(createMockResendSuccess());

            await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Plain text email' }),
            );
        });

        it('uses custom from address', async () => {
            const emailData = createTestEmailData({
                from: 'custom@example.com',
            });
            resend.emails.send.mockResolvedValue(createMockResendSuccess());

            await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({ from: 'custom@example.com' }),
            );
        });

        it('includes cc and bcc fields', async () => {
            const emailData = createTestEmailData({
                cc: 'cc@example.com',
                bcc: 'bcc@example.com',
            });
            resend.emails.send.mockResolvedValue(createMockResendSuccess());

            await sendEmail(emailData);

            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({ cc: 'cc@example.com' }),
            );
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({ bcc: 'bcc@example.com' }),
            );
        });

        it('throws when Resend returns an error response', async () => {
            resend.emails.send.mockResolvedValue(
                createMockResendError('API Error'),
            );

            await expect(sendEmail(createTestEmailData())).rejects.toThrow(
                'Failed to send email: API Error',
            );
        });

        it('rethrows network errors', async () => {
            resend.emails.send.mockRejectedValue(new Error('Network error'));

            await expect(sendEmail(createTestEmailData())).rejects.toThrow(
                'Network error',
            );
        });
    });

    describe('sendVerificationEmail', () => {
        it('renders template and sends email', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());
            renderMock.mockResolvedValueOnce('<html>Verification</html>');

            await sendVerificationEmail({
                to: 'user@example.com',
                verificationUrl: 'https://example.com/verify?token=abc123',
            });

            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Verify your email address',
                    html: '<html>Verification</html>',
                }),
            );
        });

        it('passes verification data to template', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());
            renderMock.mockResolvedValueOnce('<html>Verification Email</html>');

            await sendVerificationEmail({
                to: 'user@example.com',
                verificationUrl: 'https://example.com/verify?token=xyz',
            });

            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: '<html>Verification Email</html>',
                }),
            );
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('renders template and sends email', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());
            renderMock.mockResolvedValueOnce('<html>Password Reset</html>');

            await sendPasswordResetEmail({
                to: 'user@example.com',
                resetUrl: 'https://example.com/reset?token=abc123',
            });

            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Reset your password',
                    html: '<html>Password Reset</html>',
                }),
            );
        });

        it('passes reset URL to template', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());
            renderMock.mockResolvedValueOnce(
                '<html>Password Reset Email</html>',
            );

            await sendPasswordResetEmail({
                to: 'user@example.com',
                resetUrl: 'https://example.com/reset?token=xyz',
            });

            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: '<html>Password Reset Email</html>',
                }),
            );
        });
    });

    describe('sendWelcomeEmail', () => {
        it('renders template and sends email', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());
            renderMock.mockResolvedValueOnce('<html>Welcome</html>');

            await sendWelcomeEmail({
                to: 'newuser@example.com',
                userName: 'John Doe',
                dashboardUrl: 'https://example.com/dashboard',
            });

            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'newuser@example.com',
                    subject: 'Welcome to Iridium!',
                    html: '<html>Welcome</html>',
                }),
            );
        });

        it('passes user data to template', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());
            renderMock.mockResolvedValueOnce('<html>Welcome Email</html>');

            await sendWelcomeEmail({
                to: 'newuser@example.com',
                userName: 'Jane Smith',
                dashboardUrl: 'https://example.com/dashboard',
            });

            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({ html: '<html>Welcome Email</html>' }),
            );
        });
    });

    describe('sendTransactionalEmail', () => {
        it('renders template with button', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());
            renderMock.mockResolvedValueOnce('<html>Transactional</html>');

            await sendTransactionalEmail({
                to: 'user@example.com',
                heading: 'Account Updated',
                previewText: 'Preview',
                message: 'Body text',
                buttonText: 'View Changes',
                buttonUrl: 'https://example.com/account',
            });

            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Account Updated',
                    html: '<html>Transactional</html>',
                }),
            );
        });

        it('renders template without button', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());
            renderMock.mockResolvedValueOnce(
                '<html>Transactional Email</html>',
            );

            await sendTransactionalEmail({
                to: 'user@example.com',
                heading: 'Notification',
                previewText: 'Preview',
                message: 'Simple message',
            });

            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(resend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: '<html>Transactional Email</html>',
                }),
            );
        });
    });

    describe('sendBatchEmails', () => {
        it('sends each email in the batch', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());

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

        it('tracks partial failures', async () => {
            resend.emails.send
                .mockResolvedValueOnce(createMockResendSuccess())
                .mockRejectedValueOnce(new Error('Failed'))
                .mockResolvedValueOnce(createMockResendSuccess());

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

        it('returns detailed results for each email', async () => {
            resend.emails.send.mockResolvedValue(createMockResendSuccess());

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
