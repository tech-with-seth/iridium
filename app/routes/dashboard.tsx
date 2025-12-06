import {
    data,
    redirect,
    useFetcher,
    useNavigate,
    useNavigation,
} from 'react-router';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { usePostHog } from 'posthog-js/react';

import { Container } from '~/components/Container';
import { Paths, PostHogEventNames } from '~/constants';
import { getPostHogClient } from '~/lib/posthog';
import { getUserFromSession } from '~/lib/session.server';
import {
    createThread,
    deleteThread,
    getAllThreadsByUserId,
    getThreadById,
    updateThreadTitle,
} from '~/models/thread.server';
import type { Route } from './+types/dashboard';
import { Button } from '~/components/Button';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    EllipsisIcon,
    MessageCircle,
    MessageCircleDashedIcon,
    MessageCircleQuestionMarkIcon,
    PencilIcon,
    PlusIcon,
    SendHorizontalIcon,
    SpoolIcon,
    StopCircleIcon,
    XIcon,
} from 'lucide-react';
import { Select } from '~/components/Select';
import { Spinner } from '~/components/Spinner';
import { cx } from '~/cva.config';
import { TextInput } from '~/components/TextInput';
import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
} from '~/components/ChatBubble';
import invariant from 'tiny-invariant';
import { RFCDate } from '@polar-sh/sdk/types/rfcdate.js';
import { polarClient } from '~/lib/polar';
import { DefaultChatTransport } from 'ai';
import { pickRandom } from '~/lib/common';

enum Intents {
    GET_THREAD = 'get-thread',
    CREATE_THREAD = 'create-thread',
    DELETE_THREAD = 'delete-thread',
    RENAME_THREAD = 'rename-thread',
}

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    const postHogClient = getPostHogClient();

    const metrics = await polarClient.metrics.get({
        startDate: new RFCDate('2025-01-01'),
        endDate: new RFCDate('2025-12-31'),
        interval: 'year',
        organizationId: null,
    });

    if (!user) {
        throw new Response('Unauthorized', { status: 401 });
    }

    try {
        const threads = await getAllThreadsByUserId(user.id);

        postHogClient?.capture({
            distinctId: user.id,
            event: PostHogEventNames.CHAT_THREADS_LOADED,
            properties: {
                threadCount: threads.length,
            },
        });

        return { metrics, threads };
    } catch (error) {
        postHogClient?.captureException(error as Error, user.id, {
            context: PostHogEventNames.CHAT_THREADS_LOADING_ERROR,
        });
    }

    return { metrics, threads: [] };
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

        if (intent === Intents.GET_THREAD) {
            const threadId = String(form.get('threadId'));

            try {
                const thread = await getThreadById(threadId);
                invariant(thread, 'Thread not found');

                postHogClient?.capture({
                    distinctId: user.id,
                    event: PostHogEventNames.CHAT_THREAD_LOADED,
                    properties: {
                        threadId,
                    },
                });

                const uiMessages: UIMessage[] = thread?.messages.map((msg) => ({
                    id: msg.id,
                    role: msg.role.toLowerCase() as
                        | 'user'
                        | 'assistant'
                        | 'system',
                    parts: JSON.parse(msg.content),
                }));

                return data({
                    threadId: thread?.id,
                    messages: uiMessages,
                });
            } catch (error) {
                postHogClient?.captureException(error as Error, user.id, {
                    context: PostHogEventNames.CHAT_THREAD_CREATE_ERROR,
                    timestamp: new Date().toISOString(),
                });
            }
        }

        if (intent === Intents.CREATE_THREAD) {
            try {
                const thread = await createThread(user.id);

                postHogClient?.capture({
                    distinctId: user.id,
                    event: PostHogEventNames.CHAT_THREAD_CREATED,
                    properties: {
                        threadId: thread.id,
                    },
                });

                return data({
                    threadId: thread?.id,
                });
            } catch (error) {
                postHogClient?.captureException(error as Error, user.id, {
                    context: PostHogEventNames.CHAT_THREAD_CREATE_ERROR,
                    timestamp: new Date().toISOString(),
                });
            }
        }

        if (intent === Intents.DELETE_THREAD) {
            const threadId = String(form.get('threadId'));
            try {
                await deleteThread(threadId);

                postHogClient?.capture({
                    distinctId: user.id,
                    event: PostHogEventNames.CHAT_THREAD_DELETED,
                    properties: {
                        threadId,
                    },
                });

                return redirect(Paths.DASHBOARD);
            } catch (error) {
                postHogClient?.captureException(error as Error, user.id, {
                    context: PostHogEventNames.CHAT_THREAD_DELETE_ERROR,
                });
            }
        }

        if (intent === Intents.RENAME_THREAD) {
            const threadId = String(form.get('threadId'));
            const updatedThreadTitle = String(form.get('title'));

            try {
                postHogClient?.capture({
                    distinctId: user.id,
                    event: PostHogEventNames.CHAT_THREAD_RENAME,
                    properties: {
                        threadId,
                    },
                });

                await updateThreadTitle(threadId, updatedThreadTitle);

                return null;
            } catch (error) {
                postHogClient?.captureException(error as Error, user.id, {
                    context: PostHogEventNames.CHAT_THREAD_RENAME_ERROR,
                });
            }
        }
    }

    return null;
}

export default function DashboardRoute({ loaderData }: Route.ComponentProps) {
    const chatFetcher = useFetcher();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isNavigating = Boolean(navigation.location);

    const [currentThread, setCurrentThread] = useState<string | null>(null);
    const [openThreadPanel, setOpenThreadPanel] = useState<string | null>(null);

    const isCreatingNewThread =
        chatFetcher.state !== 'idle' &&
        chatFetcher.formData?.get('intent') === Intents.CREATE_THREAD;

    const isRenaming =
        chatFetcher.state !== 'idle' &&
        chatFetcher.formData?.get('intent') === Intents.RENAME_THREAD;

    const isLoadingMessages =
        chatFetcher.state !== 'idle' &&
        chatFetcher.formData?.get('intent') === Intents.GET_THREAD;

    const [input, setInput] = useState('');
    const messageRef = useRef<HTMLDivElement>(null);
    const postHog = usePostHog();

    const { messages, sendMessage, error, status, stop } = useChat({
        id: chatFetcher.data?.threadId,
        messages: chatFetcher.data?.messages,
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
        onData: (payload) => {
            postHog.capture(PostHogEventNames.CHAT_MESSAGE_STREAM_DATA, {
                threadId: chatFetcher.data?.threadId,
                data: payload.data,
            });
        },
        onError: (error) => {
            postHog.captureException(error, {
                context: PostHogEventNames.CHAT_MESSAGE_STREAM_ERROR,
                threadId: chatFetcher.data?.threadId,
            });
        },
        onFinish: (payload) => {
            postHog.capture(PostHogEventNames.CHAT_MESSAGE_STREAM_FINISHED, {
                threadId: chatFetcher.data?.threadId,
                messageId: payload.message?.id,
                messageText: payload.message?.parts.find(
                    (part) => part.type === 'text',
                )?.text,
            });
        },
    });

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollTop = messageRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (chatFetcher.data?.threadId) {
            setCurrentThread(chatFetcher.data.threadId);
        }
    }, [chatFetcher.data?.threadId]);

    const isStreaming = status === 'streaming';

    const PresetButton = ({ text }: { text: string }) => {
        return (
            <Button
                onClick={() => {
                    sendMessage({
                        text,
                    });
                }}
            >
                {text}
            </Button>
        );
    };

    const hasNoMessages = messages.length === 0;
    const threadChosenZeroMessages =
        currentThread && !isLoadingMessages && hasNoMessages;

    const textInputPlaceholder = useMemo(() => {
        return pickRandom([
            'What would you like to know?',
            'Ask me about your store metrics...',
            'How can I assist you today?',
            'Type your question here...',
            'Feel free to ask anything...',
        ]);
    }, [chatFetcher.data?.threadId]);

    return (
        <>
            <title>Dashboard | Iridium</title>
            <meta
                name="description"
                content="Dashboard overview of key metrics"
            />
            <Container className="px-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 mb-4 gap-4">
                    <div className="bg-base-200 rounded-box p-4">
                        <h4 className="text-lg font-bold mb-2">Orders</h4>
                        <span className="text-xl">
                            {loaderData.metrics.totals.orders}
                        </span>
                    </div>
                    <div className="bg-base-200 rounded-box p-4">
                        <h4 className="text-lg font-bold mb-2">Revenue</h4>
                        <span className="text-xl">
                            $
                            {(loaderData.metrics.totals.revenue / 100).toFixed(
                                2,
                            )}
                        </span>
                    </div>
                    <div className="bg-base-200 rounded-box p-4">
                        <h4 className="text-lg font-bold mb-2">
                            Avg Order Value
                        </h4>
                        <span className="text-xl">
                            $
                            {(
                                loaderData.metrics.totals.averageOrderValue /
                                100
                            ).toFixed(2)}
                        </span>
                    </div>
                    <div className="bg-base-200 rounded-box p-4">
                        <h4 className="text-lg font-bold mb-2">
                            Checkout Conversion
                        </h4>
                        <span className="text-xl">
                            {(
                                loaderData.metrics.totals.checkoutsConversion *
                                100
                            ).toFixed(1)}
                            %
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:min-h-[500px] md:max-h-[800px]">
                    <div className="bg-base-200 p-4 rounded-box">
                        <chatFetcher.Form method="POST">
                            <Button
                                type="submit"
                                name="intent"
                                value="create-thread"
                                disabled={isNavigating || isCreatingNewThread}
                                className="mb-4 w-full md:w-auto"
                                status="primary"
                            >
                                {isCreatingNewThread ? (
                                    <Spinner />
                                ) : (
                                    <PlusIcon />
                                )}{' '}
                                New Thread
                            </Button>
                        </chatFetcher.Form>
                        <Select
                            className="w-full md:hidden"
                            placeholder="Choose a thread"
                            onChange={(event) => {
                                const threadId = event.target.value;
                                setCurrentThread(threadId);
                                chatFetcher.submit(
                                    {
                                        intent: Intents.GET_THREAD,
                                        threadId,
                                    },
                                    { method: 'POST' },
                                );
                            }}
                            options={[
                                ...loaderData.threads.map(({ id, title }) => ({
                                    label: title!,
                                    value: id,
                                })),
                            ]}
                        />
                        <ul className="hidden md:block space-y-2">
                            {loaderData.threads.length === 0 ? (
                                <div className="bg-base-100 p-4 rounded-box flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-base-300 p-2 flex items-center justify-center mb-4">
                                        <SpoolIcon className="w-6 h-6 stroke-base-content" />
                                    </div>
                                    <p className="text-base-content text-center">
                                        No threads yet. Create a new thread to
                                        get started!
                                    </p>
                                </div>
                            ) : (
                                loaderData.threads.map(({ id, title }) => (
                                    <li key={id}>
                                        <div className="flex gap-2">
                                            <chatFetcher.Form
                                                className="grow"
                                                method="POST"
                                                onSubmit={() => {
                                                    setCurrentThread(id);
                                                }}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="threadId"
                                                    value={id}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    className="w-full text-left justify-start"
                                                    type="submit"
                                                    name="intent"
                                                    value="get-thread"
                                                    status={
                                                        currentThread === id
                                                            ? 'secondary'
                                                            : undefined
                                                    }
                                                >
                                                    {`${title?.substring(0, 20)}...`}
                                                </Button>
                                            </chatFetcher.Form>
                                            <Button
                                                onClick={() => {
                                                    if (
                                                        openThreadPanel === id
                                                    ) {
                                                        setOpenThreadPanel(
                                                            null,
                                                        );
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
                                                <chatFetcher.Form
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
                                                </chatFetcher.Form>
                                                <chatFetcher.Form
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
                                                </chatFetcher.Form>
                                            </div>
                                        )}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                    <div className="bg-base-300 p-4 rounded-box grid grid-rows-[1fr_auto] gap-2">
                        {error && (
                            <div className="alert alert-error">
                                <span>Error: {error.message}</span>
                            </div>
                        )}
                        {/* TODO: Fix heights to feel more "fit" to the viewport */}
                        <div
                            ref={messageRef}
                            className="flex-1 flex flex-col gap-2 bg-base-100 rounded-box p-8 min-h-[300px] max-h-[500px] overflow-y-scroll"
                        >
                            {!currentThread && (
                                <div className="flex flex-col gap-8 justify-center items-center h-full">
                                    <MessageCircleQuestionMarkIcon className="w-16 h-16 stroke-base-content" />
                                    <p className="text-base-content">
                                        Select a thread to start chatting!
                                    </p>
                                </div>
                            )}
                            {threadChosenZeroMessages && (
                                <div className="flex flex-col gap-8 justify-center items-center h-full">
                                    <MessageCircleDashedIcon className="w-16 h-16 stroke-base-content" />
                                    <p className="text-base-content">
                                        No messages yet. Start a conversation!
                                    </p>
                                </div>
                            )}
                            {isLoadingMessages ? (
                                <div className="flex flex-col gap-8 justify-center items-center h-full">
                                    <Spinner size="lg" />
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isUser = message.role === 'user';
                                    const placement = isUser ? 'end' : 'start';
                                    const color = isUser
                                        ? 'primary'
                                        : 'secondary';
                                    const filteredParts = message.parts.filter(
                                        (part) => part.type === 'text',
                                    );

                                    return (
                                        <ChatBubble
                                            key={message.id}
                                            placement={placement}
                                        >
                                            <ChatBubbleAvatar className="avatar">
                                                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                                    <img
                                                        src={
                                                            isUser
                                                                ? 'https://res.cloudinary.com/setholito/image/upload/v1763851065/iridium/sonic.png'
                                                                : 'https://res.cloudinary.com/setholito/image/upload/v1763851065/iridium/knuckles.png'
                                                        }
                                                        alt={
                                                            isUser
                                                                ? 'User'
                                                                : 'Assistant'
                                                        }
                                                        className={cx(
                                                            !isUser &&
                                                                'scale-x-[-1]',
                                                        )}
                                                    />
                                                </div>
                                            </ChatBubbleAvatar>
                                            <ChatBubbleMessage color={color}>
                                                {filteredParts.length === 0 ? (
                                                    <Spinner />
                                                ) : (
                                                    filteredParts.map(
                                                        (part, idx) => (
                                                            <div key={idx}>
                                                                {'text' in part
                                                                    ? part.text
                                                                    : ''}
                                                            </div>
                                                        ),
                                                    )
                                                )}
                                            </ChatBubbleMessage>
                                        </ChatBubble>
                                    );
                                })
                            )}
                            {isStreaming && (
                                <div className="text-base-content italic">
                                    Assistant is typing...
                                </div>
                            )}
                        </div>
                        {currentThread && (
                            <div className="bg-base-100 p-2 rounded-box">
                                <div className="mb-2 overflow-x-scroll flex gap-2">
                                    <PresetButton
                                        text={`How are active subscriptions and MRR trending the last 90 days?`}
                                    />
                                    <PresetButton
                                        text={`Break down subscription churn by reason this month.`}
                                    />
                                    <PresetButton
                                        text={`Compare one-time sales revenue vs subscription revenue this quarter.`}
                                    />
                                    <PresetButton
                                        text={`Are gross margin % and cashflow improving this quarter?`}
                                    />
                                </div>
                                <form
                                    className="flex items-center gap-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        sendMessage({ text: input });
                                        setInput('');
                                    }}
                                >
                                    <TextInput
                                        className="w-full"
                                        value={input}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                        disabled={isStreaming}
                                        placeholder={textInputPlaceholder}
                                    />
                                    {isStreaming ? (
                                        <Button
                                            type="button"
                                            status="primary"
                                            onClick={stop}
                                        >
                                            <span className="flex items-center gap-2">
                                                <StopCircleIcon />
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={!input.trim()}
                                            status="primary"
                                        >
                                            <span className="flex items-center gap-2">
                                                Send <SendHorizontalIcon />
                                            </span>
                                        </Button>
                                    )}
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </>
    );
}
