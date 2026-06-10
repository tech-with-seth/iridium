import { useEffect, useRef, useState } from 'react';
import {
    data,
    Form,
    isRouteErrorResponse,
    useFetcher,
    useRouteError,
} from 'react-router';
import { CircleXIcon, SearchIcon, ShieldIcon } from 'lucide-react';
import { z } from 'zod';
import { APIError } from 'better-auth';
import { auth } from '~/lib/auth.server';
import { pageMeta, parsePage } from '~/lib/pagination';
import { rateLimit } from '~/lib/rate-limit.server';
import { redirectWithToast } from '~/lib/toast.server';
import { authMiddleware } from '~/middleware/auth';
import { requireAdmin } from '~/models/session.server';
import { countUsers, listUsers, updateUserRole } from '~/models/user.server';
import { Container } from '~/components/Container';
import { EmptyState } from '~/components/EmptyState';
import { Pagination } from '~/components/Pagination';
import { Field } from '~/components/forms/Field';
import { FormAlert } from '~/components/forms/FormAlert';
import { Input } from '~/components/forms/Input';
import { Select } from '~/components/forms/Select';
import type { Route } from './+types/admin';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

const PAGE_SIZE = 20;

// Literal strings, not the Prisma Role enum: this array renders in the
// component, and importing the generated client into browser code pulls
// Prisma's Node runtime into the bundle and breaks hydration.
const ROLES = ['USER', 'EDITOR', 'ADMIN'] as const;

const setRoleSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(ROLES),
});

const banSchema = z.object({
    userId: z.string().min(1),
    banReason: z
        .string()
        .trim()
        .min(1, { message: 'A ban reason is required' })
        .max(500, { message: 'Reason must be 500 characters or fewer' }),
});

const userIdSchema = z.object({
    userId: z.string().min(1),
});

export async function loader({ request }: Route.LoaderArgs) {
    const admin = await requireAdmin(request);

    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.trim() ?? '';
    const { page, pageSize, skip, take } = parsePage(url.searchParams, {
        defaultPageSize: PAGE_SIZE,
    });

    const [users, totalCount] = await Promise.all([
        listUsers({ query: query || undefined, skip, take }),
        countUsers(query || undefined),
    ]);

    return {
        adminId: admin.id,
        users,
        query,
        page,
        totalCount,
        ...pageMeta(totalCount, page, pageSize),
    };
}

export async function action({ request }: Route.ActionArgs) {
    const admin = await requireAdmin(request);

    const { success } = rateLimit({
        key: `admin:${admin.id}`,
        maxRequests: 30,
        windowMs: 60_000,
    });

    if (!success) {
        throw new Response('Too many requests. Please wait a moment.', {
            status: 429,
        });
    }

    const form = await request.formData();
    const intent = String(form.get('intent'));
    const isSelf = String(form.get('userId')) === admin.id;

    if (intent === 'set-role') {
        const parsed = setRoleSchema.safeParse(Object.fromEntries(form));

        if (!parsed.success) {
            throw new Response('Invalid role change', { status: 400 });
        }
        if (isSelf) {
            return data(
                { formError: 'You cannot change your own role.' },
                { status: 400 },
            );
        }

        await updateUserRole(parsed.data.userId, parsed.data.role);

        return redirectWithToast('/admin', {
            type: 'success',
            message: `Role updated to ${parsed.data.role}.`,
        });
    }

    if (intent === 'ban-user') {
        const parsed = banSchema.safeParse(Object.fromEntries(form));

        if (!parsed.success) {
            return data(
                {
                    formError:
                        z.flattenError(parsed.error).fieldErrors
                            .banReason?.[0] ?? 'Invalid ban request',
                },
                { status: 400 },
            );
        }
        if (isSelf) {
            return data(
                { formError: 'You cannot ban yourself.' },
                { status: 400 },
            );
        }

        // Better Auth's banUser also revokes the user's sessions.
        await auth.api.banUser({
            body: {
                userId: parsed.data.userId,
                banReason: parsed.data.banReason,
            },
            headers: request.headers,
        });

        return redirectWithToast('/admin', {
            type: 'success',
            message: 'User banned.',
        });
    }

    if (intent === 'unban-user') {
        const parsed = userIdSchema.safeParse(Object.fromEntries(form));

        if (!parsed.success) {
            throw new Response('Invalid request', { status: 400 });
        }

        await auth.api.unbanUser({
            body: { userId: parsed.data.userId },
            headers: request.headers,
        });

        return redirectWithToast('/admin', {
            type: 'success',
            message: 'User unbanned.',
        });
    }

    if (intent === 'impersonate-user') {
        const parsed = userIdSchema.safeParse(Object.fromEntries(form));

        if (!parsed.success) {
            throw new Response('Invalid request', { status: 400 });
        }
        if (isSelf) {
            return data(
                { formError: 'You cannot impersonate yourself.' },
                { status: 400 },
            );
        }

        try {
            // returnHeaders forwards the impersonation session cookie.
            const { headers } = await auth.api.impersonateUser({
                body: { userId: parsed.data.userId },
                headers: request.headers,
                returnHeaders: true,
            });

            headers.set('Location', '/dashboard');

            return new Response(null, { status: 302, headers });
        } catch (error) {
            const message =
                error instanceof APIError
                    ? `Impersonation failed: ${error.message}`
                    : 'Impersonation failed.';

            return data({ formError: message }, { status: 400 });
        }
    }

    throw new Response('Unknown intent', { status: 400 });
}

export default function AdminRoute({
    loaderData,
    actionData,
}: Route.ComponentProps) {
    const { adminId, users, query, page, totalPages, totalCount } = loaderData;
    const roleFetcher = useFetcher();
    const banDialogRef = useRef<HTMLDialogElement>(null);
    const [banTarget, setBanTarget] = useState<{
        id: string;
        email: string;
    } | null>(null);

    const formError = actionData?.formError ?? null;

    // Reopen the ban dialog when the server rejected the ban form.
    useEffect(() => {
        if (formError && banDialogRef.current && banTarget) {
            banDialogRef.current.showModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formError]);

    function openBanDialog(user: { id: string; email: string }) {
        setBanTarget(user);
        banDialogRef.current?.showModal();
    }

    return (
        <>
            <title>Admin | Iridium</title>
            <meta name="description" content="Manage users and roles." />
            <Container className="flex flex-col gap-4 p-4">
                <h1 className="text-4xl font-bold">Admin</h1>
                <FormAlert message={formError} />

                <Form method="GET" role="search" className="join max-w-md">
                    <label className="input join-item flex grow items-center gap-2">
                        <SearchIcon
                            aria-hidden="true"
                            className="h-4 w-4 opacity-60"
                        />
                        <input
                            type="search"
                            name="q"
                            placeholder="Search by name or email"
                            defaultValue={query}
                            aria-label="Search users"
                        />
                    </label>
                    <button type="submit" className="btn join-item">
                        Search
                    </button>
                </Form>

                <p className="text-base-content/60 text-sm">
                    {totalCount} user{totalCount === 1 ? '' : 's'}
                    {query ? ` matching "${query}"` : ''}
                </p>

                {users.length === 0 ? (
                    <EmptyState
                        icon={ShieldIcon}
                        title="No users found"
                        description={
                            query ? `Nothing found for "${query}".` : undefined
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => {
                                    const isSelf = user.id === adminId;

                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="font-semibold">
                                                    {user.name}
                                                    {isSelf && (
                                                        <span className="badge badge-ghost badge-sm ml-2">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-base-content/60 text-sm">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td>
                                                {isSelf ? (
                                                    <span className="badge">
                                                        {user.role}
                                                    </span>
                                                ) : (
                                                    <roleFetcher.Form method="POST">
                                                        <input
                                                            type="hidden"
                                                            name="intent"
                                                            value="set-role"
                                                        />
                                                        <input
                                                            type="hidden"
                                                            name="userId"
                                                            value={user.id}
                                                        />
                                                        <Select
                                                            name="role"
                                                            selectSize="sm"
                                                            aria-label={`Role for ${user.email}`}
                                                            defaultValue={
                                                                user.role ??
                                                                'USER'
                                                            }
                                                            onChange={(event) =>
                                                                roleFetcher.submit(
                                                                    event
                                                                        .currentTarget
                                                                        .form,
                                                                )
                                                            }
                                                        >
                                                            {ROLES.map(
                                                                (role) => (
                                                                    <option
                                                                        key={
                                                                            role
                                                                        }
                                                                        value={
                                                                            role
                                                                        }
                                                                    >
                                                                        {role}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </Select>
                                                    </roleFetcher.Form>
                                                )}
                                            </td>
                                            <td>
                                                {user.banned ? (
                                                    <span
                                                        className="badge badge-error"
                                                        title={
                                                            user.banReason ??
                                                            undefined
                                                        }
                                                    >
                                                        Banned
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-success badge-outline">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-base-content/60 text-sm">
                                                {new Date(
                                                    user.createdAt,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {!isSelf && (
                                                    <div className="flex justify-end gap-1">
                                                        <Form method="POST">
                                                            <input
                                                                type="hidden"
                                                                name="intent"
                                                                value="impersonate-user"
                                                            />
                                                            <input
                                                                type="hidden"
                                                                name="userId"
                                                                value={user.id}
                                                            />
                                                            <button
                                                                type="submit"
                                                                className="btn btn-ghost btn-xs"
                                                            >
                                                                Impersonate
                                                            </button>
                                                        </Form>
                                                        {user.banned ? (
                                                            <Form method="POST">
                                                                <input
                                                                    type="hidden"
                                                                    name="intent"
                                                                    value="unban-user"
                                                                />
                                                                <input
                                                                    type="hidden"
                                                                    name="userId"
                                                                    value={
                                                                        user.id
                                                                    }
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-ghost btn-xs"
                                                                >
                                                                    Unban
                                                                </button>
                                                            </Form>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn btn-ghost btn-xs text-error"
                                                                onClick={() =>
                                                                    openBanDialog(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                Ban
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    className="self-center"
                />
            </Container>

            <dialog
                ref={banDialogRef}
                className="modal"
                onClose={() => setBanTarget(null)}
            >
                <div className="modal-box">
                    <h3 className="text-lg font-bold">
                        Ban {banTarget?.email}
                    </h3>
                    <p className="py-2">
                        Banning revokes the user&apos;s sessions and blocks
                        sign-in until they are unbanned.
                    </p>
                    <Form
                        method="POST"
                        className="space-y-4"
                        onSubmit={() => banDialogRef.current?.close()}
                    >
                        <input type="hidden" name="intent" value="ban-user" />
                        <input
                            type="hidden"
                            name="userId"
                            value={banTarget?.id ?? ''}
                        />
                        <Field label="Reason" name="banReason">
                            {(controlProps) => (
                                <Input
                                    type="text"
                                    name="banReason"
                                    placeholder="Why is this user being banned?"
                                    required
                                    className="w-full"
                                    {...controlProps}
                                />
                            )}
                        </Field>
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => banDialogRef.current?.close()}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-error">
                                Ban user
                            </button>
                        </div>
                    </Form>
                </div>
            </dialog>
        </>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    const message = isRouteErrorResponse(error)
        ? `${error.status} ${
              typeof error.data === 'string' ? error.data : error.statusText
          }`
        : 'Something went wrong loading the admin panel.';

    return (
        <Container className="p-4">
            <div role="alert" className="alert alert-error">
                <CircleXIcon aria-hidden="true" className="h-6 w-6" />
                <span>{message}</span>
            </div>
        </Container>
    );
}
