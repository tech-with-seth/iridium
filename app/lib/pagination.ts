const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;

/**
 * Parse `?page=` from search params into Prisma-ready skip/take values.
 * Invalid or out-of-range values fall back to page 1.
 */
export function parsePage(
    searchParams: URLSearchParams,
    { defaultPageSize = DEFAULT_PAGE_SIZE }: { defaultPageSize?: number } = {},
) {
    const pageSize = Math.min(Math.max(1, defaultPageSize), MAX_PAGE_SIZE);
    const rawPage = Number(searchParams.get('page'));
    const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

    return {
        page,
        pageSize,
        skip: (page - 1) * pageSize,
        take: pageSize,
    };
}

/**
 * Derive display metadata for a paginated list. `totalPages` is always at
 * least 1 so empty lists still render a sane pager state.
 */
export function pageMeta(totalCount: number, page: number, pageSize: number) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
    };
}
