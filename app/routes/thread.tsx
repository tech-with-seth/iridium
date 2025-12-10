import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import {
    BotIcon,
    MessageCircleDashedIcon,
    SendHorizontalIcon,
    StopCircleIcon,
    UserIcon,
} from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { data, useNavigation } from 'react-router';
import { Button } from '~/components/actions/Button';
import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
} from '~/components/data-display/ChatBubble';
import { TextInput } from '~/components/data-input/TextInput';
import { Loading } from '~/components/feedback/Loading';
import { PostHogEventNames } from '~/constants';
import { cx } from '~/cva.config';
import type { Route } from './+types/thread';
import { getPostHogClient } from '~/lib/posthog';
import { getUserFromSession } from '~/lib/session.server';
import { getThreadById } from '~/models/thread.server';
import invariant from 'tiny-invariant';

export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    const postHogClient = getPostHogClient();

    if (!user) {
        throw new Response('Unauthorized', { status: 401 });
    }

    try {
        const thread = await getThreadById(params.threadId);
        invariant(thread, 'Thread not found');

        postHogClient?.capture({
            distinctId: user.id,
            event: PostHogEventNames.CHAT_THREAD_LOADED,
            properties: {
                threadId: params.threadId,
            },
        });

        const uiMessages: UIMessage[] = thread?.messages.map((msg) => ({
            id: msg.id,
            role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
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

export default function ThreadRoute({
    loaderData,
    params,
}: Route.ComponentProps) {
    const navigation = useNavigation();
    const [chatInput, setChatInput] = useState('');
    const messageRef = useRef<HTMLDivElement>(null);
    const postHog = usePostHog();

    const transport = useMemo(() => {
        return new DefaultChatTransport({
            api: '/api/chat',
        });
    }, []);

    const { messages, sendMessage, error, status, stop } = useChat({
        id: params.threadId,
        messages: loaderData?.messages,
        transport,
        onData: (payload) => {
            postHog.capture(PostHogEventNames.CHAT_MESSAGE_STREAM_DATA, {
                threadId: params.threadId,
                data: payload.data,
            });
        },
        onError: (error) => {
            postHog.captureException(error, {
                context: PostHogEventNames.CHAT_MESSAGE_STREAM_ERROR,
                threadId: params.threadId,
            });
        },
        onFinish: (payload) => {
            postHog.capture(PostHogEventNames.CHAT_MESSAGE_STREAM_FINISHED, {
                threadId: params.threadId,
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
        if (params.threadId) {
            stop();
        }
    }, [params.threadId]);

    const isStreaming = status === 'streaming';

    const hasNoMessages = messages.length === 0;
    const isLoadingMessages = navigation.state === 'loading';
    const threadChosenZeroMessages = !isLoadingMessages && hasNoMessages;

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

    const presentQuestions = [
        'How are my sales this month?',
        'What are my top selling digital downloads?',
        'Show me digital download revenue trends',
        'How many downloads did I have this week?',
    ];

    return (
        <>
            <title>Thread | Iridium</title>
            <meta
                name="description"
                content="Chat with your data using Iridium's AI-powered assistant."
            />
            <div className="grid grid-rows-[1fr_auto] gap-2">
                {error && (
                    <div className="alert alert-error">
                        <span>Error: {error.message}</span>
                    </div>
                )}
                {/* TODO: Fix heights to feel more "fit" to the viewport */}
                <div
                    ref={messageRef}
                    className="flex-1 flex flex-col gap-2 bg-base-100 rounded-box p-8 min-h-[500px] max-h-[750px] overflow-y-scroll"
                >
                    {threadChosenZeroMessages && (
                        <div className="flex flex-col gap-8 justify-center items-center h-full">
                            <MessageCircleDashedIcon className="w-16 h-16 stroke-base-300" />
                            <p className="text-base-content">
                                No messages yet. Start a conversation!
                            </p>
                        </div>
                    )}
                    {isLoadingMessages ? (
                        <div className="flex flex-col gap-8 justify-center items-center h-full">
                            <Loading size="lg" />
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isUser = message.role === 'user';
                            const placement = isUser ? 'end' : 'start';
                            const color = isUser ? 'secondary' : undefined;
                            const filteredParts = message.parts.filter(
                                (part) => part.type === 'text',
                            );

                            return (
                                <ChatBubble
                                    key={message.id}
                                    placement={placement}
                                >
                                    <ChatBubbleAvatar className="avatar">
                                        <div
                                            className={cx(
                                                `w-10 rounded-full ring ring-base-content ring-offset-base-100 ring-offset-2 flex items-center justify-center bg-base-300`,
                                            )}
                                        >
                                            {isUser ? (
                                                <UserIcon className="w-6 h-6 stroke-base-content" />
                                            ) : (
                                                <BotIcon className="w-6 h-6 stroke-base-content" />
                                            )}
                                        </div>
                                    </ChatBubbleAvatar>
                                    <ChatBubbleMessage color={color}>
                                        {filteredParts.length === 0 ? (
                                            <Loading />
                                        ) : (
                                            filteredParts.map((part, idx) => (
                                                <div key={idx}>
                                                    {'text' in part
                                                        ? part.text
                                                        : ''}
                                                </div>
                                            ))
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
                <div className="bg-base-100 p-2 rounded-box">
                    <div className="mb-2 overflow-x-auto flex gap-2">
                        {presentQuestions.map((question, index) => (
                            <PresetButton key={index} text={question} />
                        ))}
                    </div>
                    <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage({ text: chatInput });
                            setChatInput('');
                        }}
                    >
                        <TextInput
                            className="w-full"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            disabled={isStreaming}
                            placeholder="Type your message..."
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
                                disabled={!chatInput.trim()}
                                status="primary"
                            >
                                <span className="flex items-center gap-2">
                                    Send <SendHorizontalIcon />
                                </span>
                            </Button>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}
