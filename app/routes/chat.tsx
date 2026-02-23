import { SendHorizonalIcon } from 'lucide-react';
import { ChatBubble } from '~/components/ChatBubble';
import { Container } from '~/components/Container';
import { authMiddleware } from '~/middleware/auth';
import { listItemClassName } from '~/shared';
import type { Route } from './+types/chat';
import { createThread, getAllThreadsByUserId } from '~/models/thread.server';
import { getUserFromSession } from '~/models/session.server';
import invariant from 'tiny-invariant';
import { Form, NavLink, Outlet, redirect } from 'react-router';

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
    }

    return null;
}

export default function ChatRoute({ loaderData }: Route.ComponentProps) {
    return (
        <>
            <title>Chat | Iridium</title>
            <meta name="description" content="This is the chat page" />
            <Container className="flex h-full flex-col gap-4 p-4">
                <h1 className="mb-4 text-4xl font-bold">Chat</h1>
                <div className="grid grow grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <Form method="POST">
                            <input
                                type="hidden"
                                name="intent"
                                value="new-thread"
                            />
                            <button className="btn btn-accent mb-4">
                                + New Thread
                            </button>
                        </Form>
                        <ul className="flex flex-col gap-4">
                            {loaderData.threads &&
                            loaderData.threads.length > 0 ? (
                                loaderData.threads.map((thread) => (
                                    <li
                                        key={thread.id}
                                        className={listItemClassName}
                                    >
                                        <NavLink
                                            to={thread.id}
                                            className="flex gap-2"
                                        >
                                            {thread.messages[0]?.content.slice(
                                                0,
                                                30,
                                            ) || 'New Thread'}
                                        </NavLink>
                                    </li>
                                ))
                            ) : (
                                <li className={listItemClassName}>
                                    No threads found
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="col-span-8 flex flex-col gap-4">
                        <Outlet />
                    </div>
                </div>
            </Container>
        </>
    );
}
