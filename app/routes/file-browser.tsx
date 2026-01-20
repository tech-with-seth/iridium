import {
    data,
    NavLink,
    Outlet,
    useLocation,
    type NavLinkProps,
    type NavLinkRenderProps,
} from 'react-router';
import invariant from 'tiny-invariant';
import type { Route } from './+types/file-browser';
import { Alert } from '~/components/feedback/Alert';
import { Badge } from '~/components/data-display/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from '~/components/data-display/Table';
import { Container } from '~/components/layout/Container';
import { listObjects } from '~/lib/s3.server';
import { EyeIcon } from 'lucide-react';

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

const GRID_GAP = 'gap-4 md:gap-8';

function ContentSection({
    children,
    heading,
}: {
    children: React.ReactNode;
    heading: string;
}) {
    return (
        <Container className="px-4">
            <div
                className={`grid grid-cols-12 ${GRID_GAP} rounded-box overflow-hidden mb-8 bg-base-100 p-8`}
            >
                <div className="col-span-12">
                    <h2 className="text-3xl font-semibold text-base-content">
                        {heading}
                    </h2>
                </div>
                {children}
            </div>
        </Container>
    );
}

export async function loader() {
    const items = await listObjects({ maxKeys: 500 });
    invariant(items, 'Failed to list S3 objects');

    return data({
        items,
        env: { AWS_ENDPOINT_URL: process.env.AWS_ENDPOINT_URL },
    });
}

const FileLink = ({ to }: { to: string }) => {
    const navLinkClassName = ({ isActive, isPending }: NavLinkRenderProps) =>
        isActive
            ? 'link link-primary font-semibold'
            : isPending
              ? 'link link-primary'
              : undefined;

    return (
        <NavLink to={to} className={navLinkClassName}>
            {({ isActive, isPending }) =>
                isActive ? (
                    <>
                        <EyeIcon className="inline h-4 w-4" />
                        <span>Viewing</span>
                    </>
                ) : isPending ? (
                    'Loading...'
                ) : (
                    'View'
                )
            }
        </NavLink>
    );
};

export default function FileBrowserRoute({ loaderData }: Route.ComponentProps) {
    const location = useLocation();

    return (
        <>
            <title>File Browser | Iridium</title>
            <meta
                name="description"
                content="Browse Railway S3 bucket objects with presigned links."
            />
            <ContentSection heading="File Browser">
                <div className="col-span-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-5 flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge color="neutral">
                                {loaderData?.items.length} object
                                {loaderData?.items.length === 1 ? '' : 's'}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="col-span-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-8 h-full">
                        {loaderData?.items.length === 0 ? (
                            <Alert status="info">
                                No objects found yet. Upload something from the
                                design page to see it listed here.
                            </Alert>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table scrollable>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>
                                                Key
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Size
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Last modified
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Link
                                            </TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loaderData?.items.map((item) => {
                                            const viewPath = `/files/view/${encodeURIComponent(
                                                item.key,
                                            )}`;
                                            const isActiveRow =
                                                location.pathname === viewPath;

                                            return (
                                                <TableRow
                                                    key={item.key}
                                                    hover
                                                    className={
                                                        isActiveRow
                                                            ? 'bg-primary/10'
                                                            : undefined
                                                    }
                                                >
                                                    <TableCell className="font-mono text-xs align-top">
                                                        {item.key}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        {formatBytes(item.size)}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        {item.lastModified
                                                            ? new Date(
                                                                  item.lastModified,
                                                              ).toLocaleString()
                                                            : '—'}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <FileLink
                                                            to={viewPath}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-4 h-full">
                        <div className="flex h-full flex-col">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </ContentSection>
        </>
    );
}
