import { useRef, useState } from 'react';
import { Container } from '~/components/Container';
import { EmptyState } from '~/components/EmptyState';
import { authMiddleware } from '~/middleware/auth';
import { rateLimit } from '~/lib/rate-limit.server';
import { navLinkClassName } from '~/shared';
import type { Route } from './+types/chat';
import {
    createThread,
    deleteThread,
    getAllThreadsByUserId,
    getThreadById,
} from '~/models/thread.server';
import { requireUserFromContext } from '~/context';
import { Form, NavLink, Outlet, redirect, useNavigation } from 'react-router';
import {
    LoaderCircleIcon,
    MessagesSquareIcon,
    PlusCircleIcon,
    Trash2Icon,
} from 'lucide-react';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
    const user = requireUserFromContext(context);
    const threads = await getAllThreadsByUserId(user.id);

    return { threads };
}

export async function action({ request, context }: Route.ActionArgs) {
    if (request.method !== 'POST') {
        throw new Response('Method not allowed', { status: 405 });
    }

    const user = requireUserFromContext(context);
    const form = await request.formData();
    const intent = String(form.get('intent'));

    if (intent === 'new-thread') {
        const { success } = rateLimit({
            key: `thread-create:${user.id}`,
            maxRequests: 30,
            windowMs: 60_000,
        });

        if (!success) {
            throw new Response(
                'Too many threads created. Please wait a moment.',
                { status: 429 },
            );
        }

        try {
            const thread = await createThread(user.id);
            return redirect(thread.id);
        } catch {
            throw new Response('Failed to create thread', { status: 500 });
        }
    }

    if (intent === 'delete-thread') {
        const { success } = rateLimit({
            key: `thread-delete:${user.id}`,
            maxRequests: 60,
            windowMs: 60_000,
        });

        if (!success) {
            throw new Response('Too many requests. Please wait a moment.', {
                status: 429,
            });
        }

        const threadId = String(form.get('threadId'));
        const thread = await getThreadById(threadId);

        if (!thread) {
            throw new Response('Thread not found', { status: 404 });
        }
        if (thread.createdById !== user.id) {
            throw new Response('Forbidden', { status: 403 });
        }

        await deleteThread(threadId);

        return redirect('/chat');
    }

    throw new Response('Unknown intent', { status: 400 });
}

function getThreadLabel(thread: {
    title?: string | null;
    messages: { content: string }[];
}): string {
    if (thread.title && thread.title !== 'Untitled') return thread.title;

    try {
        const parts = JSON.parse(thread.messages[0]?.content ?? '[]');
        const text = parts
            .filter((p: { type: string }) => p.type === 'text')
            .map((p: { text: string }) => p.text)
            .join('');

        return text.length > 30
            ? `${text.slice(0, 30)}...`
            : text || 'New Thread';
    } catch {
        return 'New Thread';
    }
}

export default function ChatRoute({ loaderData }: Route.ComponentProps) {
    const navigation = useNavigation();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const formData = navigation.formData;
    const intent = formData?.get('intent');
    const isCreating = navigation.state !== 'idle' && intent === 'new-thread';
    const deletingThreadId =
        navigation.state !== 'idle' && intent === 'delete-thread'
            ? String(formData?.get('threadId'))
            : null;

    function openDeleteDialog(threadId: string) {
        setPendingDeleteId(threadId);
        dialogRef.current?.showModal();
    }

    function closeDeleteDialog() {
        dialogRef.current?.close();
        setPendingDeleteId(null);
    }

    return (
        <>
            <title>Chat | Iridium</title>
            <meta name="description" content="This is the chat page" />
            <Container className="flex min-h-0 grow flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold">Chat</h1>
                    <Form method="POST">
                        <input type="hidden" name="intent" value="new-thread" />
                        <button
                            className="btn btn-accent"
                            type="submit"
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <LoaderCircleIcon
                                    aria-hidden="true"
                                    className="mr-2 h-6 w-6 animate-spin"
                                />
                            ) : (
                                <PlusCircleIcon
                                    aria-hidden="true"
                                    className="mr-2 h-6 w-6"
                                />
                            )}
                            New Thread
                        </button>
                    </Form>
                </div>
                <div className="grid min-h-0 grow grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-4 md:grid-cols-12 md:grid-rows-1">
                    <div className="col-span-1 max-h-48 overflow-y-auto md:col-span-5 md:max-h-none lg:col-span-3">
                        <nav aria-label="Conversations">
                            <ul className="flex flex-col gap-4">
                                {loaderData.threads &&
                                loaderData.threads.length > 0 ? (
                                    loaderData.threads.map((thread) => (
                                        <li
                                            key={thread.id}
                                            className="group relative"
                                        >
                                            <NavLink
                                                to={thread.id}
                                                className={navLinkClassName}
                                            >
                                                <span className="truncate pr-6">
                                                    {getThreadLabel(thread)}
                                                </span>
                                            </NavLink>
                                            <button
                                                type="button"
                                                aria-label="Delete thread"
                                                className="btn btn-ghost btn-xs text-error absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                                                disabled={
                                                    deletingThreadId ===
                                                    thread.id
                                                }
                                                onClick={() =>
                                                    openDeleteDialog(thread.id)
                                                }
                                            >
                                                {deletingThreadId ===
                                                thread.id ? (
                                                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2Icon className="h-4 w-4" />
                                                )}
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <li>
                                        <EmptyState
                                            icon={MessagesSquareIcon}
                                            title="No conversations yet"
                                            description='Start one with "New Thread".'
                                            className="p-4"
                                        />
                                    </li>
                                )}
                            </ul>
                        </nav>
                    </div>
                    <div className="col-span-1 flex min-h-0 flex-col gap-4 overflow-hidden md:col-span-7 lg:col-span-9">
                        <Outlet />
                    </div>
                </div>
            </Container>

            <dialog
                ref={dialogRef}
                className="modal"
                onClose={() => setPendingDeleteId(null)}
            >
                <div className="modal-box">
                    <h3 className="text-lg font-bold">Delete thread</h3>
                    <p className="py-4">
                        This will delete this conversation and all its messages.
                    </p>
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={closeDeleteDialog}
                        >
                            Cancel
                        </button>
                        <Form method="POST" onSubmit={closeDeleteDialog}>
                            <input
                                type="hidden"
                                name="intent"
                                value="delete-thread"
                            />
                            <input
                                type="hidden"
                                name="threadId"
                                value={pendingDeleteId ?? ''}
                            />
                            <button type="submit" className="btn btn-error">
                                Delete
                            </button>
                        </Form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="submit">close</button>
                </form>
            </dialog>
        </>
    );
}
