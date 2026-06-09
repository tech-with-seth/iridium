import { describe, expect, it } from 'vitest';
import { pageMeta, parsePage } from './pagination';

describe('parsePage', () => {
    it('defaults to page 1 when the param is missing', () => {
        const result = parsePage(new URLSearchParams());

        expect(result.page).toBe(1);
        expect(result.skip).toBe(0);
        expect(result.take).toBe(result.pageSize);
    });

    it('computes skip from the page number', () => {
        const result = parsePage(new URLSearchParams('page=3'), {
            defaultPageSize: 10,
        });

        expect(result.page).toBe(3);
        expect(result.skip).toBe(20);
        expect(result.take).toBe(10);
    });

    it.each(['0', '-2', 'abc', '1.5'])(
        'falls back to page 1 for invalid value %s',
        (value) => {
            const result = parsePage(new URLSearchParams(`page=${value}`));

            expect(result.page).toBe(1);
            expect(result.skip).toBe(0);
        },
    );

    it('caps the page size at 100', () => {
        const result = parsePage(new URLSearchParams(), {
            defaultPageSize: 500,
        });

        expect(result.pageSize).toBe(100);
    });
});

describe('pageMeta', () => {
    it('reports a single page for empty lists', () => {
        expect(pageMeta(0, 1, 10)).toEqual({
            totalPages: 1,
            hasPrev: false,
            hasNext: false,
        });
    });

    it('rounds total pages up', () => {
        expect(pageMeta(21, 1, 10).totalPages).toBe(3);
    });

    it('flags prev/next based on position', () => {
        expect(pageMeta(30, 2, 10)).toEqual({
            totalPages: 3,
            hasPrev: true,
            hasNext: true,
        });
        expect(pageMeta(30, 3, 10).hasNext).toBe(false);
    });
});
