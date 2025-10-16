import { describe, it, expect } from 'vitest';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { validateFormData } from './form-validation.server';

// Test schemas
const testSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email'),
	age: z.coerce.number().min(18, 'Must be 18 or older')
});

const multiValueSchema = z.object({
	tags: z.array(z.string()).min(1, 'At least one tag is required')
});

describe('validateFormData', () => {
	it('validates correct form data', async () => {
		const formData = new FormData();
		formData.append('name', 'John Doe');
		formData.append('email', 'john@example.com');
		formData.append('age', '25');

		const result = await validateFormData(formData, zodResolver(testSchema));

		expect(result.data).toEqual({
			name: 'John Doe',
			email: 'john@example.com',
			age: 25
		});
		expect(result.errors).toBeUndefined();
		expect(result.receivedValues).toEqual({
			name: 'John Doe',
			email: 'john@example.com',
			age: '25'
		});
	});

	it('returns errors for invalid data', async () => {
		const formData = new FormData();
		formData.append('name', '');
		formData.append('email', 'invalid-email');
		formData.append('age', '15');

		const result = await validateFormData(formData, zodResolver(testSchema));

		expect(result.data).toBeUndefined();
		expect(result.errors).toBeDefined();
		expect(result.errors?.name).toEqual({
			type: 'too_small',
			message: 'Name is required'
		});
		expect(result.errors?.email).toEqual({
			type: 'invalid_string',
			message: 'Invalid email'
		});
		expect(result.errors?.age).toEqual({
			type: 'too_small',
			message: 'Must be 18 or older'
		});
	});

	it('handles missing required fields', async () => {
		const formData = new FormData();

		const result = await validateFormData(formData, zodResolver(testSchema));

		expect(result.data).toBeUndefined();
		expect(result.errors).toBeDefined();
		expect(result.errors?.name).toBeDefined();
		expect(result.errors?.email).toBeDefined();
		expect(result.errors?.age).toBeDefined();
	});

	it('handles multiple values for the same key', async () => {
		const formData = new FormData();
		formData.append('tags', 'javascript');
		formData.append('tags', 'typescript');
		formData.append('tags', 'react');

		const result = await validateFormData(
			formData,
			zodResolver(multiValueSchema)
		);

		expect(result.data).toEqual({
			tags: ['javascript', 'typescript', 'react']
		});
		expect(result.errors).toBeUndefined();
	});

	it('handles empty FormData', async () => {
		const formData = new FormData();

		const result = await validateFormData(formData, zodResolver(testSchema));

		expect(result.data).toBeUndefined();
		expect(result.errors).toBeDefined();
		expect(result.receivedValues).toEqual({});
	});

	it('preserves received values even when validation fails', async () => {
		const formData = new FormData();
		formData.append('name', 'John');
		formData.append('email', 'invalid');
		formData.append('age', '10');

		const result = await validateFormData(formData, zodResolver(testSchema));

		expect(result.receivedValues).toEqual({
			name: 'John',
			email: 'invalid',
			age: '10'
		});
		expect(result.errors).toBeDefined();
	});

	it('validates optional fields correctly', async () => {
		const schemaWithOptional = z.object({
			name: z.string().min(1),
			nickname: z.string().optional()
		});

		const formData = new FormData();
		formData.append('name', 'John');

		const result = await validateFormData(
			formData,
			zodResolver(schemaWithOptional)
		);

		expect(result.data).toEqual({
			name: 'John'
		});
		expect(result.errors).toBeUndefined();
	});

	it('handles numeric coercion from string inputs', async () => {
		const formData = new FormData();
		formData.append('name', 'John');
		formData.append('email', 'john@example.com');
		formData.append('age', '30');

		const result = await validateFormData(formData, zodResolver(testSchema));

		expect(result.data?.age).toBe(30);
		expect(typeof result.data?.age).toBe('number');
	});
});
