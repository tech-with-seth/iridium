import { describe, it, expect } from 'vitest';
import { sendEmailSchema, emailTemplateSchema } from './validations';

/**
 * Email Validation Tests
 *
 * Tests Zod validation schemas for email sending.
 * No mocking needed - these are pure validation tests.
 */

describe('Email Validation Schemas', () => {
    describe('sendEmailSchema', () => {
        describe('valid email data', () => {
            it('validates email with html content', () => {
                const validData = {
                    to: 'user@example.com',
                    subject: 'Test Subject',
                    html: '<p>Test HTML content</p>',
                };

                const result = sendEmailSchema.safeParse(validData);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual(validData);
                }
            });

            it('validates email with text content', () => {
                const validData = {
                    to: 'user@example.com',
                    subject: 'Test Subject',
                    text: 'Test plain text content',
                };

                const result = sendEmailSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates email with both html and text', () => {
                const validData = {
                    to: 'user@example.com',
                    subject: 'Test Subject',
                    html: '<p>HTML version</p>',
                    text: 'Text version',
                };

                const result = sendEmailSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates email with multiple recipients', () => {
                const validData = {
                    to: ['user1@example.com', 'user2@example.com'],
                    subject: 'Test Subject',
                    html: '<p>Test</p>',
                };

                const result = sendEmailSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates email with optional from address', () => {
                const validData = {
                    to: 'user@example.com',
                    from: 'sender@example.com',
                    subject: 'Test Subject',
                    html: '<p>Test</p>',
                };

                const result = sendEmailSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates email with replyTo', () => {
                const validData = {
                    to: 'user@example.com',
                    subject: 'Test Subject',
                    html: '<p>Test</p>',
                    replyTo: 'reply@example.com',
                };

                const result = sendEmailSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates email with CC recipients', () => {
                const validData = {
                    to: 'user@example.com',
                    subject: 'Test Subject',
                    html: '<p>Test</p>',
                    cc: 'cc@example.com',
                };

                const result = sendEmailSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates email with multiple CC recipients', () => {
                const validData = {
                    to: 'user@example.com',
                    subject: 'Test Subject',
                    html: '<p>Test</p>',
                    cc: ['cc1@example.com', 'cc2@example.com'],
                };

                const result = sendEmailSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates email with BCC recipients', () => {
                const validData = {
                    to: 'user@example.com',
                    subject: 'Test Subject',
                    html: '<p>Test</p>',
                    bcc: 'bcc@example.com',
                };

                const result = sendEmailSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });
        });

        describe('invalid email data', () => {
            it('rejects invalid recipient email', () => {
                const invalidData = {
                    to: 'invalid-email',
                    subject: 'Test',
                    html: '<p>Test</p>',
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects invalid from email', () => {
                const invalidData = {
                    to: 'user@example.com',
                    from: 'invalid-email',
                    subject: 'Test',
                    html: '<p>Test</p>',
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects missing subject', () => {
                const invalidData = {
                    to: 'user@example.com',
                    html: '<p>Test</p>',
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects empty subject', () => {
                const invalidData = {
                    to: 'user@example.com',
                    subject: '',
                    html: '<p>Test</p>',
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects subject too long', () => {
                const invalidData = {
                    to: 'user@example.com',
                    subject: 'a'.repeat(201),
                    html: '<p>Test</p>',
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects email without html or text', () => {
                const invalidData = {
                    to: 'user@example.com',
                    subject: 'Test Subject',
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe(
                        "Either 'html' or 'text' must be provided",
                    );
                }
            });

            it('rejects invalid replyTo email', () => {
                const invalidData = {
                    to: 'user@example.com',
                    subject: 'Test',
                    html: '<p>Test</p>',
                    replyTo: 'invalid-email',
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects invalid CC email', () => {
                const invalidData = {
                    to: 'user@example.com',
                    subject: 'Test',
                    html: '<p>Test</p>',
                    cc: 'invalid-email',
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects invalid email in CC array', () => {
                const invalidData = {
                    to: 'user@example.com',
                    subject: 'Test',
                    html: '<p>Test</p>',
                    cc: ['valid@example.com', 'invalid-email'],
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects invalid BCC email', () => {
                const invalidData = {
                    to: 'user@example.com',
                    subject: 'Test',
                    html: '<p>Test</p>',
                    bcc: 'invalid-email',
                };

                const result = sendEmailSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });
        });
    });

    describe('emailTemplateSchema', () => {
        describe('valid template data', () => {
            it('validates verification template', () => {
                const validData = {
                    templateName: 'verification',
                    to: 'user@example.com',
                    props: {
                        verificationUrl: 'https://example.com/verify',
                    },
                };

                const result = emailTemplateSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates password-reset template', () => {
                const validData = {
                    templateName: 'password-reset',
                    to: 'user@example.com',
                    props: {
                        resetUrl: 'https://example.com/reset',
                    },
                };

                const result = emailTemplateSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates welcome template', () => {
                const validData = {
                    templateName: 'welcome',
                    to: 'user@example.com',
                    props: {
                        userName: 'John Doe',
                        dashboardUrl: 'https://example.com/dashboard',
                    },
                };

                const result = emailTemplateSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates transactional template', () => {
                const validData = {
                    templateName: 'transactional',
                    to: 'user@example.com',
                    props: {
                        heading: 'Test Heading',
                        previewText: 'Test Preview',
                        message: 'Test Message',
                    },
                };

                const result = emailTemplateSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });

            it('validates template without props', () => {
                const validData = {
                    templateName: 'welcome',
                    to: 'user@example.com',
                };

                const result = emailTemplateSchema.safeParse(validData);

                expect(result.success).toBe(true);
            });
        });

        describe('invalid template data', () => {
            it('rejects invalid template name', () => {
                const invalidData = {
                    templateName: 'invalid-template',
                    to: 'user@example.com',
                };

                const result = emailTemplateSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects invalid recipient email', () => {
                const invalidData = {
                    templateName: 'welcome',
                    to: 'invalid-email',
                };

                const result = emailTemplateSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects missing templateName', () => {
                const invalidData = {
                    to: 'user@example.com',
                };

                const result = emailTemplateSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });

            it('rejects missing recipient', () => {
                const invalidData = {
                    templateName: 'welcome',
                };

                const result = emailTemplateSchema.safeParse(invalidData);

                expect(result.success).toBe(false);
            });
        });
    });
});
