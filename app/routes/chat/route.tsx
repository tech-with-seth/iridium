import {
    isRouteErrorResponse,
    NavLink,
    Outlet,
    redirect,
    useFetcher,
    useNavigation,
} from 'react-router';
import {
    EllipsisIcon,
    MessageCircle,
    PencilIcon,
    PlusIcon,
    SpoolIcon,
    XIcon,
} from 'lucide-react';

import { Container } from '~/components/Container';
import type { Route } from './+types/route';
import {
    createThread,
    getAllThreadsByUserId,
    deleteThread,
    updateThreadTitle,
} from '~/models/thread.server';
import { getUserFromSession } from '~/lib/session.server';
import { Button } from '~/components/Button';
import { getPostHogClient } from '~/lib/posthog';
import { cx } from '~/cva.config';
import { Alert } from '~/components/Alert';
import { Card } from '~/components/Card';
import { Spinner } from '~/components/Spinner';
import { useState } from 'react';
import { TextInput } from '~/components/TextInput';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    const postHogClient = getPostHogClient();

    if (!user) {
        throw new Response('Unauthorized', { status: 401 });
    }

    try {
        const threads = await getAllThreadsByUserId(user.id);

        postHogClient?.capture({
            distinctId: user.id,
            event: 'threads_loaded',
            properties: {
                threadCount: threads.length,
            },
        });

        return { threads };
    } catch (error) {
        postHogClient?.captureException(error as Error, user.id, {
            context: 'loading_threads',
        });
    }

    return { threads: [] };
}

export async function action({ request }: Route.ActionArgs) {
    const user = await getUserFromSession(request);
    const postHogClient = getPostHogClient();
    const form = await request.formData();

    if (!user) {
        throw new Response('Unauthorized', { status: 401 });
    }

    if (request.method === 'POST') {
        const intent = String(form.get('intent'));

        if (intent === 'create-thread') {
            try {
                const thread = await createThread(user.id);

                postHogClient?.capture({
                    distinctId: user.id,
                    event: 'thread_created',
                    properties: {
                        threadId: thread.id,
                    },
                });

                return redirect(`/chat/${thread.id}`);
            } catch (error) {
                postHogClient?.captureException(error as Error, user.id, {
                    context: 'thread_creation',
                    timestamp: new Date().toISOString(),
                });
            }
        }

        if (intent === 'delete-thread') {
            const threadId = String(form.get('threadId'));
            try {
                await deleteThread(threadId);

                postHogClient?.capture({
                    distinctId: user.id,
                    event: 'thread_deleted',
                    properties: {
                        threadId,
                    },
                });

                return redirect('/chat');
            } catch (error) {
                postHogClient?.captureException(error as Error, user.id, {
                    context: 'thread_deletion',
                });
            }
        }

        if (intent === 'rename-thread') {
            const threadId = String(form.get('threadId'));
            const updatedThreadTitle = String(form.get('title'));

            try {
                postHogClient?.capture({
                    distinctId: user.id,
                    event: 'thread_renamed',
                    properties: {
                        threadId,
                    },
                });

                await updateThreadTitle(threadId, updatedThreadTitle);

                return null;
            } catch (error) {
                postHogClient?.captureException(error as Error, user.id, {
                    context: 'thread_renaming',
                });
            }
        }
    }

    return null;
}

export default function ChatRouteLayout({ loaderData }: Route.ComponentProps) {
    const threadFetcher = useFetcher();
    const navigation = useNavigation();
    const isNavigating = Boolean(navigation.location);

    const [openThreadPanel, setOpenThreadPanel] = useState<string | null>(null);

    const isRenaming =
        threadFetcher.state !== 'idle' &&
        threadFetcher.formData?.get('intent') === 'rename-thread';

    return (
        <Container className="p-4">
            {/* TODO: Fix heights to feel more "fit" to the viewport */}
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 min-h-[500px] max-h-[800px]">
                <div className="bg-base-300 p-4 rounded-xl">
                    <threadFetcher.Form method="POST">
                        <Button
                            type="submit"
                            name="intent"
                            value="create-thread"
                            disabled={isNavigating}
                            className="mb-4"
                            status="primary"
                        >
                            <PlusIcon /> New Thread
                        </Button>
                    </threadFetcher.Form>
                    <ul className="space-y-2">
                        {loaderData.threads.length === 0 ? (
                            <div className="bg-base-100 p-4 rounded-box flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-base-300 p-2 flex items-center justify-center mb-4">
                                    <SpoolIcon className="w-6 h-6 stroke-base-content" />
                                </div>
                                <p className="text-base-content text-center">
                                    No threads yet. Create a new thread to get
                                    started!
                                </p>
                            </div>
                        ) : (
                            loaderData.threads.map(({ id, title }) => (
                                <li key={id}>
                                    <div className="flex gap-2">
                                        <NavLink
                                            to={`/chat/${id}`}
                                            className={({ isActive }) =>
                                                cx(
                                                    `bg-base-100 flex-1 rounded-box cursor-pointer px-3 py-2`,
                                                    isNavigating &&
                                                        `pointer-events-none`,
                                                    isActive &&
                                                        'bg-secondary text-secondary-content',
                                                )
                                            }
                                        >
                                            {({ isPending }) => (
                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-2 items-center">
                                                        <MessageCircle className="w-5 h-5" />
                                                        <span className="inline-block">
                                                            {title}
                                                        </span>
                                                    </div>
                                                    {isPending && <Spinner />}
                                                </div>
                                            )}
                                        </NavLink>
                                        <Button
                                            onClick={() => {
                                                if (openThreadPanel === id) {
                                                    setOpenThreadPanel(null);
                                                } else {
                                                    setOpenThreadPanel(id);
                                                }
                                            }}
                                        >
                                            <EllipsisIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {openThreadPanel === id && (
                                        <div className="flex flex-col gap-2 mt-2 bg-base-100 rounded-box p-4">
                                            <threadFetcher.Form
                                                method="POST"
                                                className="flex gap-2"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="threadId"
                                                    value={id}
                                                />
                                                <fieldset className="flex-1 flex flex-col gap-1">
                                                    <label
                                                        className="block font-bold"
                                                        htmlFor={`rename-title-${id}`}
                                                    >
                                                        New title
                                                    </label>
                                                    <TextInput
                                                        id={`rename-title-${id}`}
                                                        name="title"
                                                        type="text"
                                                        defaultValue={
                                                            title as string
                                                        }
                                                    />
                                                </fieldset>
                                                <Button
                                                    className="px-3 self-end"
                                                    type="submit"
                                                    name="intent"
                                                    value="rename-thread"
                                                    status="warning"
                                                    disabled={
                                                        isNavigating ||
                                                        isRenaming
                                                    }
                                                >
                                                    {isRenaming ? (
                                                        <Spinner />
                                                    ) : (
                                                        <PencilIcon className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </threadFetcher.Form>
                                            <threadFetcher.Form
                                                method="POST"
                                                className="flex gap-2 justify-between items-center"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="threadId"
                                                    value={id}
                                                />
                                                <div className="flex-1 py-2 px-4 bg-error/10 rounded-box">
                                                    Delete?
                                                </div>
                                                <Button
                                                    className="px-3"
                                                    type="submit"
                                                    name="intent"
                                                    value="delete-thread"
                                                    status="error"
                                                    disabled={isNavigating}
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </Button>
                                            </threadFetcher.Form>
                                        </div>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                <div className="bg-base-300 p-4 rounded-xl grid grid-rows-[1fr_auto] gap-2">
                    <Outlet />
                </div>
            </div>
        </Container>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Chat has encountered an error';
    let details = 'An unexpected error occurred';

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
    }

    return (
        <Container className="flex flex-col gap-4 p-4">
            <Alert status="warning">
                <h1 className="text-4xl font-bold">{message}</h1>
            </Alert>
            <Card className="bg-white">
                <p>{details}</p>
            </Card>
        </Container>
    );
}
