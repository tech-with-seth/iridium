/**
 * Template: Route Loader/Action Unit Test
 *
 * Replace placeholders:
 * - feature → Your route/feature name
 * - Feature → Your route/feature name (PascalCase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '~/test/utils';

// ============================================
// Mock dependencies BEFORE imports
// ============================================
vi.mock('~/lib/session.server');
vi.mock('~/models/feature.server');

// Import AFTER mocking
import { requireUser } from '~/lib/session.server';
import { getFeature, updateFeature, deleteFeature } from '~/models/feature.server';
import { loader, action } from './feature';

describe('Feature Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ============================================
    // Loader Tests
    // ============================================

    describe('loader', () => {
        it('returns feature data for authenticated user', async () => {
            const mockUser = { id: 'user-123', email: 'test@example.com' };
            const mockFeature = { id: 'feature-123', name: 'Test Feature' };

            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(getFeature).mockResolvedValue(mockFeature as any);

            const request = createMockRequest({
                url: 'http://localhost:5173/feature/feature-123',
            });

            const response = await loader({
                request,
                params: { id: 'feature-123' },
                context: {},
            });

            const data = await response.json();
            expect(data.feature).toEqual(mockFeature);
        });

        it('requires authentication', async () => {
            vi.mocked(requireUser).mockRejectedValue(
                new Response('Unauthorized', { status: 401 }),
            );

            const request = createMockRequest({
                url: 'http://localhost:5173/feature',
            });

            await expect(
                loader({ request, params: {}, context: {} }),
            ).rejects.toEqual(expect.any(Response));
        });
    });

    // ============================================
    // Action Tests - PUT (Update)
    // ============================================

    describe('action - PUT', () => {
        it('updates feature successfully', async () => {
            const mockUser = { id: 'user-123' };
            const updatedFeature = { id: 'feature-123', name: 'Updated Name' };

            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(updateFeature).mockResolvedValue(updatedFeature as any);

            const request = createMockRequest({
                method: 'PUT',
                url: 'http://localhost:5173/feature/feature-123',
                body: { name: 'Updated Name' },
            });

            const response = await action({
                request,
                params: { id: 'feature-123' },
                context: {},
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(updateFeature).toHaveBeenCalledWith('feature-123', {
                name: 'Updated Name',
            });
        });

        it('returns validation errors for invalid data', async () => {
            const mockUser = { id: 'user-123' };
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);

            const request = createMockRequest({
                method: 'PUT',
                url: 'http://localhost:5173/feature/feature-123',
                body: { name: '' }, // Invalid: empty name
            });

            const response = await action({
                request,
                params: { id: 'feature-123' },
                context: {},
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.errors).toBeDefined();
        });
    });

    // ============================================
    // Action Tests - DELETE
    // ============================================

    describe('action - DELETE', () => {
        it('deletes feature successfully', async () => {
            const mockUser = { id: 'user-123' };
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(deleteFeature).mockResolvedValue({ id: 'feature-123' } as any);

            const request = createMockRequest({
                method: 'DELETE',
                url: 'http://localhost:5173/feature/feature-123',
            });

            const response = await action({
                request,
                params: { id: 'feature-123' },
                context: {},
            });

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(deleteFeature).toHaveBeenCalledWith('feature-123');
        });
    });

    // ============================================
    // Authorization Tests
    // ============================================

    describe('authorization', () => {
        it('returns 403 for non-owner', async () => {
            const mockUser = { id: 'user-123' };
            const mockFeature = { id: 'feature-123', userId: 'other-user' };

            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(getFeature).mockResolvedValue(mockFeature as any);

            const request = createMockRequest({
                method: 'DELETE',
                url: 'http://localhost:5173/feature/feature-123',
            });

            const response = await action({
                request,
                params: { id: 'feature-123' },
                context: {},
            });

            expect(response.status).toBe(403);
        });
    });

    // ============================================
    // Error Handling
    // ============================================

    describe('error handling', () => {
        beforeEach(() => {
            vi.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('handles database errors gracefully', async () => {
            const mockUser = { id: 'user-123' };
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(getFeature).mockRejectedValue(new Error('DB error'));

            const request = createMockRequest({
                url: 'http://localhost:5173/feature/feature-123',
            });

            await expect(
                loader({ request, params: { id: 'feature-123' }, context: {} }),
            ).rejects.toThrow('DB error');
        });
    });
});
