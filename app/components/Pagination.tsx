import { Link, useSearchParams } from 'react-router';

type Props = {
    page: number;
    totalPages: number;
    className?: string;
};

export function Pagination({ page, totalPages, className }: Props) {
    const [searchParams] = useSearchParams();

    if (totalPages <= 1) return null;

    const linkTo = (target: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(target));
        return `?${params.toString()}`;
    };

    return (
        <nav aria-label="Pagination" className={className}>
            <div className="join">
                {page > 1 ? (
                    <Link
                        to={linkTo(page - 1)}
                        className="join-item btn"
                        aria-label="Previous page"
                    >
                        «
                    </Link>
                ) : (
                    <button className="join-item btn" disabled>
                        «
                    </button>
                )}
                <span className="join-item btn pointer-events-none">
                    Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                    <Link
                        to={linkTo(page + 1)}
                        className="join-item btn"
                        aria-label="Next page"
                    >
                        »
                    </Link>
                ) : (
                    <button className="join-item btn" disabled>
                        »
                    </button>
                )}
            </div>
        </nav>
    );
}
