import { vi } from 'vitest';

export type ResendSendMock = ReturnType<typeof vi.fn>;

export interface ResendMock {
    emails: {
        send: ResendSendMock;
    };
}

export function createResendMock(): ResendMock {
    return {
        emails: {
            send: vi.fn(),
        },
    };
}

export function ensureResendMock(client: unknown): ResendMock {
    if (!client || typeof client !== 'object') {
        throw new Error('Resend mock is not available.');
    }

    const maybe = client as Partial<ResendMock>;

    if (!maybe.emails || typeof maybe.emails.send !== 'function') {
        throw new Error('Resend mock is missing the emails.send function.');
    }

    return maybe as ResendMock;
}

export function resetResendMock(mock: ResendMock) {
    mock.emails.send.mockReset();
}

export function createMockResendSuccess(id = 'email-123') {
    return {
        data: { id },
        error: null,
    };
}

export function createMockResendError(message = 'Failed to send email') {
    return {
        data: null,
        error: { message },
    };
}

export interface TestEmailData {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
}

export function createTestEmailData(overrides: Partial<TestEmailData> = {}) {
    return {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test email content</p>',
        ...overrides,
    } as TestEmailData;
}

export type TemplateName =
    | 'verification'
    | 'password-reset'
    | 'welcome'
    | 'transactional';

export function createTestTemplateProps(
    templateName: TemplateName,
    props: Record<string, unknown> = {},
) {
    const defaults: Record<TemplateName, Record<string, unknown>> = {
        verification: {
            verificationUrl: 'https://example.com/verify?token=abc123',
        },
        'password-reset': {
            resetUrl: 'https://example.com/reset?token=abc123',
        },
        welcome: {
            userName: 'Test User',
            dashboardUrl: 'https://example.com/dashboard',
        },
        transactional: {
            heading: 'Test Heading',
            previewText: 'Test Preview',
            message: 'Test message content',
        },
    };

    return {
        templateName,
        to: 'test@example.com',
        props: {
            ...defaults[templateName],
            ...props,
        },
    };
}

export function createEmailFormData(data: Record<string, unknown>) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
            return;
        }

        formData.append(key, String(value));
    });

    return formData;
}

export function mockReactEmailRender(html = '<html>Mocked Email</html>') {
    return vi.fn().mockResolvedValue(html);
}

export function mockPostHogCapture() {
    return {
        capture: vi.fn(),
        captureException: vi.fn(),
    };
}
