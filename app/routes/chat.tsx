import { Container } from '~/components/Container';
import { authMiddleware } from '~/middleware/auth';
import { listItemClassName, navLinkClassName } from '~/shared';
import type { Route } from './+types/chat';
import {
    createThread,
    deleteThread,
    getAllThreadsByUserId,
    getThreadById,
} from '~/models/thread.server';
import { getUserFromSession } from '~/models/session.server';
import invariant from 'tiny-invariant';
import { Form, NavLink, Outlet, redirect } from 'react-router';
import { PlusCircleIcon, Trash2Icon } from 'lucide-react';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const threads = await getAllThreadsByUserId(user.id);
    invariant(threads, 'Threads could not be found for user');

    return {
        threads,
    };
}

export async function action({ request }: Route.ActionArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const form = await request.formData();
    const intent = String(form.get('intent'));

    if (request.method === 'POST') {
        if (intent === 'new-thread') {
            try {
                const thread = await createThread(user.id);

                return redirect(thread?.id);
            } catch (error) {
                throw new Response('Failed to create thread', { status: 500 });
            }
        }

        if (intent === 'delete-thread') {
            const threadId = String(form.get('threadId'));
            const thread = await getThreadById(threadId);

            invariant(thread, 'Thread not found');
            invariant(thread.createdById === user.id, 'Unauthorized');

            await deleteThread(threadId);

            return redirect('/chat');
        }
    }

    return null;
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

        return text.slice(0, 30) || 'New Thread';
    } catch {
        return 'New Thread';
    }
}

export default function ChatRoute({ loaderData }: Route.ComponentProps) {
    return (
        <>
            <title>Chat | Iridium</title>
            <meta name="description" content="This is the chat page" />
            <Container className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-4xl font-bold">Chat</h1>
                    </div>
                    <Form method="POST">
                        <input type="hidden" name="intent" value="new-thread" />
                        <button className="btn btn-accent" type="submit">
                            <PlusCircleIcon
                                aria-hidden="true"
                                className="mr-2 h-6 w-6"
                            />
                            New Thread
                        </button>
                    </Form>
                </div>
                <div className="grid min-h-0 grow grid-cols-1 gap-4 md:grid-cols-12">
                    <div className="col-span-1 overflow-y-auto md:col-span-5 lg:col-span-4">
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
                                            <Form
                                                method="POST"
                                                className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="intent"
                                                    value="delete-thread"
                                                />
                                                <input
                                                    type="hidden"
                                                    name="threadId"
                                                    value={thread.id}
                                                />
                                                <button
                                                    type="submit"
                                                    aria-label="Delete thread"
                                                    className="btn btn-ghost btn-xs text-error"
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </button>
                                            </Form>
                                        </li>
                                    ))
                                ) : (
                                    <li className={listItemClassName}>
                                        No threads found
                                    </li>
                                )}
                            </ul>
                        </nav>
                    </div>
                    <div className="col-span-1 flex min-h-0 flex-col gap-4 overflow-hidden md:col-span-7 lg:col-span-8">
                        <Outlet />
                    </div>
                </div>
            </Container>
        </>
    );
}
