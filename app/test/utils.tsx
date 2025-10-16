import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement } from 'react';

/**
 * Custom render function for testing components
 * Wraps components with necessary providers
 */
export function renderWithProviders(
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
) {
	return render(ui, { ...options });
}

/**
 * Create a mock user object for testing
 */
export function createMockUser(overrides = {}) {
	return {
		id: 'test-user-id',
		email: 'test@example.com',
		name: 'Test User',
		role: 'USER',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
		emailVerified: true,
		...overrides
	};
}

/**
 * Create a mock request object for testing loaders/actions
 */
export function createMockRequest({
	method = 'GET',
	url = 'http://localhost:5173',
	headers = {},
	body = null
}: {
	method?: string;
	url?: string;
	headers?: Record<string, string>;
	body?: any;
} = {}) {
	const request = new Request(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		body: body ? JSON.stringify(body) : null
	});

	return request;
}

/**
 * Create a mock FormData for testing form submissions
 */
export function createMockFormData(data: Record<string, string | Blob>) {
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		formData.append(key, value);
	});
	return formData;
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
