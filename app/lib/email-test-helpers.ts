import { vi } from 'vitest';

/**
 * Email Testing Helpers
 *
 * Utilities for testing email functionality with mocked Resend SDK.
 * All tests use mocks - NO real API calls to avoid using credits!
 *
 * Location: app/lib/ (shared across test files)
 */

/**
 * Creates a mock Resend success response
 */
export function createMockResendSuccess(id = 'email-123') {
	return {
		data: { id },
		error: null
	};
}

/**
 * Creates a mock Resend error response
 */
export function createMockResendError(message = 'Failed to send email') {
	return {
		data: null,
		error: { message }
	};
}

/**
 * Factory for creating valid email test data
 */
export function createTestEmailData(overrides: Record<string, any> = {}) {
	return {
		to: 'test@example.com',
		subject: 'Test Email',
		html: '<p>Test email content</p>',
		...overrides
	};
}

/**
 * Factory for creating test email template props
 */
export function createTestTemplateProps(
	templateName: string,
	props: Record<string, any> = {}
) {
	const defaultProps = {
		verification: {
			verificationUrl: 'https://example.com/verify?token=abc123'
		},
		'password-reset': {
			resetUrl: 'https://example.com/reset?token=abc123'
		},
		welcome: {
			userName: 'Test User',
			dashboardUrl: 'https://example.com/dashboard'
		},
		transactional: {
			heading: 'Test Heading',
			previewText: 'Test Preview',
			message: 'Test message content'
		}
	};

	return {
		templateName,
		to: 'test@example.com',
		props: {
			...defaultProps[templateName as keyof typeof defaultProps],
			...props
		}
	};
}

/**
 * Creates a mock FormData for testing email API endpoint
 */
export function createEmailFormData(data: Record<string, any>) {
	const formData = new FormData();

	Object.entries(data).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			formData.append(
				key,
				typeof value === 'object' ? JSON.stringify(value) : String(value)
			);
		}
	});

	return formData;
}

/**
 * Mock implementation for React Email render function
 */
export function mockReactEmailRender(html = '<html>Mocked Email</html>') {
	return vi.fn().mockResolvedValue(html);
}

/**
 * Mock implementation for PostHog tracking
 */
export function mockPostHogCapture() {
	return {
		capture: vi.fn(),
		captureException: vi.fn()
	};
}
