import { useEffect, useRef, useState } from 'react';
import { isRouteErrorResponse, redirect } from 'react-router';
import { useChat, type UIMessage } from '@ai-sdk/react';
import invariant from 'tiny-invariant';
import { MessageCircleDashedIcon, SendHorizontalIcon } from 'lucide-react';

import { addMessageToThread } from '~/models/message.server';
import { Button } from '~/components/Button';
import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
} from '~/components/ChatBubble';
import { getPostHogClient } from '~/lib/posthog';
import { getThreadById } from '~/models/thread.server';
import { getUserFromSession } from '~/lib/session.server';
import { Paths } from '~/constants';
import { TextInput } from '~/components/TextInput';
import type { Route } from './+types/thread';
import { Container } from '~/components/Container';
import { Alert } from '~/components/Alert';
import { Card } from '~/components/Card';
import { Spinner } from '~/components/Spinner';
import { usePostHog } from 'posthog-js/react';

export async function loader({ params }: Route.LoaderArgs) {
    const threadId = params.threadId;
    invariant(threadId, 'threadId is required');

    const thread = await getThreadById(threadId);

    if (!thread) {
        throw redirect(Paths.CHAT);
    }

    const uiMessages: UIMessage[] = thread?.messages.map((msg) => ({
        id: msg.id,
        role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
        parts: JSON.parse(msg.content),
    }));

    return {
        messages: uiMessages,
    };
}

export async function action({ request, params }: Route.ActionArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User is required');
    const threadId = params.threadId;
    invariant(threadId, 'threadId is required');

    const postHogClient = getPostHogClient();

    try {
        await addMessageToThread({
            userId: user.id,
            threadId,
            role: 'USER',
            content: JSON.stringify([
                { type: 'text', text: 'User sent a message' },
            ]),
        });

        postHogClient?.capture({
            distinctId: user.id,
            event: 'message_added',
            properties: {
                threadId,
            },
        });

        return null;
    } catch (error) {
        postHogClient?.captureException(error, user.id, {
            threadId,
        });

        throw error;
    }
}

export default function ChatThreadRoute({
    loaderData,
    params,
}: Route.ComponentProps) {
    const [input, setInput] = useState('');
    const messageRef = useRef<HTMLDivElement>(null);
    const postHog = usePostHog();

    const { messages, sendMessage, error, status } = useChat({
        id: params.threadId,
        messages: loaderData.messages,
        onError: (error) => {
            postHog.captureException(error, {
                context: 'chat_thread',
                threadId: params.threadId,
            });
        },
        // onFinish: (message) => {}
    });

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <>
            {error && (
                <div className="alert alert-error">
                    <span>Error: {error.message}</span>
                </div>
            )}
            {/* TODO: Fix heights to feel more "fit" to the viewport */}
            <div className="flex-1 flex flex-col gap-2 bg-base-100 rounded-box p-8 min-h-[500px] max-h-[700px] overflow-y-scroll">
                {/* Chat messages go here */}
                {messages.length === 0 && (
                    <div className="flex flex-col gap-8 justify-center items-center h-full">
                        <MessageCircleDashedIcon className="w-16 h-16 stroke-base-content" />
                        <p className="text-base-content">
                            No messages yet. Start a conversation!
                        </p>
                    </div>
                )}
                {messages.map((message) => (
                    <ChatBubble
                        key={message.id}
                        placement={message.role === 'user' ? 'end' : 'start'}
                    >
                        <ChatBubbleAvatar className="avatar">
                            <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img
                                    src={
                                        message.role === 'user'
                                            ? 'https://res.cloudinary.com/setholito/image/upload/v1763851065/iridium/sonic.png'
                                            : 'https://res.cloudinary.com/setholito/image/upload/v1763851065/iridium/knuckles.png'
                                    }
                                    alt={
                                        message.role === 'user'
                                            ? 'User'
                                            : 'Assistant'
                                    }
                                />
                            </div>
                        </ChatBubbleAvatar>
                        <ChatBubbleMessage
                            color={
                                message.role === 'user' ? 'primary' : undefined
                            }
                        >
                            {message.parts.filter(
                                (part) => part.type === 'text',
                            ).length === 0 ? (
                                <Spinner />
                            ) : (
                                message.parts
                                    .filter((part) => part.type === 'text')
                                    .map((part, idx) => (
                                        <div key={idx}>
                                            {'text' in part ? part.text : ''}
                                        </div>
                                    ))
                            )}
                        </ChatBubbleMessage>
                    </ChatBubble>
                ))}
                {status === 'streaming' && (
                    <div className="text-gray-500 italic">
                        Assistant is typing...
                    </div>
                )}
            </div>
            <div className="bg-base-100 p-2 rounded-box">
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
                        onChange={(e) => setInput(e.target.value)}
                        disabled={status === 'streaming'}
                    />
                    <Button
                        type="submit"
                        disabled={status === 'streaming' || !input.trim()}
                        status="primary"
                    >
                        {status === 'streaming' ? (
                            <span>Sending...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Send <SendHorizontalIcon />
                            </span>
                        )}
                    </Button>
                </form>
            </div>
        </>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Loading thread error';
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
