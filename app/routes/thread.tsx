import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import {
    CircleXIcon,
    LoaderCircleIcon,
    SendHorizonalIcon,
    StopCircleIcon,
} from 'lucide-react';
import { ChatBubble } from '~/components/ChatBubble';
import type { Route } from './+types/thread';
import { getThreadById } from '~/models/thread.server';
import invariant from 'tiny-invariant';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { useEffect, useRef, useState } from 'react';

const transport = new DefaultChatTransport({
    api: '/api/chat',
    credentials: 'include',
});

export async function loader({ params }: Route.LoaderArgs) {
    const thread = await getThreadById(params.threadId);
    invariant(thread, 'Thread could not be found');

    const messages: UIMessage[] = thread.messages.map((msg) => ({
        id: msg.id,
        role: msg.role === 'USER' ? ('user' as const) : ('assistant' as const),
        content: '',
        parts: JSON.parse(msg.content),
        createdAt: msg.createdAt,
    }));

    return {
        thread: { ...thread, messages },
    };
}

export default function ThreadRoute({
    loaderData,
    params,
}: Route.ComponentProps) {
    const [chatInput, setChatInput] = useState('');
    const messageRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, error, status, stop } = useChat({
        id: params.threadId,
        messages: loaderData?.thread.messages,
        transport,
    });

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollTop = messageRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            {error && (
                <div role="alert" className="alert alert-error">
                    <CircleXIcon className="h-6 w-6" />
                    <span>{error.message}</span>
                </div>
            )}
            <div
                ref={messageRef}
                className="rounded-box bg-base-100 flex grow flex-col justify-end gap-4 p-4"
            >
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <ChatBubble
                            key={message.id}
                            variant={
                                message.role === 'user' ? 'primary' : 'default'
                            }
                            placement={
                                message.role === 'user' ? 'end' : 'start'
                            }
                        >
                            {(() => {
                                const text = message.parts
                                    .filter((part) => part.type === 'text')
                                    .map((part) =>
                                        'text' in part ? part.text : '',
                                    )
                                    .join('');
                                return (
                                    text ||
                                    (message.role === 'assistant' ? (
                                        <LoaderCircleIcon className="h-5 w-5 animate-spin" />
                                    ) : null)
                                );
                            })()}
                        </ChatBubble>
                    ))
                ) : (
                    <div className="text-center text-gray-500">
                        No messages yet
                    </div>
                )}
            </div>
            <div className="rounded-box border-base-300 bg-base-100 flex items-center gap-2 border p-2">
                <input
                    type="text"
                    className="input rounded-field grow"
                    placeholder="Your message here..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage({ text: chatInput });
                            setChatInput('');
                        }
                    }}
                />
                <button
                    className="btn btn-default"
                    onClick={stop}
                    disabled={status !== 'streaming'}
                >
                    <StopCircleIcon className="h-6 w-6" /> Stop
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        sendMessage({ text: chatInput });
                        setChatInput('');
                    }}
                    disabled={status === 'streaming'}
                >
                    <SendHorizonalIcon className="h-6 w-6" /> Send
                </button>
            </div>
        </>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <>
                <div role="alert" className="alert alert-error">
                    <CircleXIcon className="h-6 w-6" />
                    <span>
                        {error.status} {error.statusText}
                    </span>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div role="alert" className="alert alert-error">
                    <CircleXIcon className="h-6 w-6" />
                    <span>
                        Experiencing technical difficulties. Please try again
                        later.
                    </span>
                </div>
            </>
        );
    }
}
