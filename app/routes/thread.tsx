import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import {
    CircleXIcon,
    LoaderCircleIcon,
    RefreshCwIcon,
    SendHorizonalIcon,
    StopCircleIcon,
    WrenchIcon,
    XIcon,
} from 'lucide-react';
import { ChatBubble } from '~/components/ChatBubble';
import { Markdown } from '~/components/Markdown';
import { NoteToolPart } from '~/components/NoteToolPart';
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

interface ToolPart {
    toolCallId: string;
    toolName: string;
    state: string;
}

function isToolPart(part: { type: string }): part is ToolPart & { type: string } {
    return part.type.startsWith('tool-') || part.type === 'dynamic-tool';
}

const NOTE_TOOLS = new Set(['create_note', 'list_notes', 'search_notes']);
function ToolPartFallback({ part }: { part: ToolPart }) {
    return (
        <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
            <WrenchIcon aria-hidden="true" className="h-3 w-3" />
            <span>
                {part.toolName}
                {part.state === 'output-available' && ' \u2713'}
                {(part.state === 'input-available' ||
                    part.state === 'input-streaming') &&
                    ' \u2026'}
            </span>
        </div>
    );
}

export default function ThreadRoute({
    loaderData,
    params,
}: Route.ComponentProps) {
    const [chatInput, setChatInput] = useState('');
    const messageRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        sendMessage,
        error,
        clearError,
        regenerate,
        status,
        stop,
    } = useChat({
        id: params.threadId,
        messages: loaderData?.thread.messages,
        transport,
        onError: (error) => {
            console.error('Chat error:', error);
        },
    });

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollTop = messageRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!chatInput.trim()) return;
        sendMessage({ text: chatInput });
        setChatInput('');
    };

    return (
        <>
            {error && (
                <div role="alert" className="alert alert-error">
                    <CircleXIcon aria-hidden="true" className="h-6 w-6" />
                    <span>Something went wrong.</span>
                    <div className="flex gap-1">
                        <button
                            className="btn btn-sm"
                            onClick={() => regenerate()}
                        >
                            <RefreshCwIcon
                                aria-hidden="true"
                                className="h-4 w-4"
                            />
                            Retry
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => clearError()}
                        >
                            <XIcon aria-hidden="true" className="h-4 w-4" />
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
            <div
                ref={messageRef}
                aria-live="polite"
                aria-busy={status === 'streaming'}
                className="rounded-box bg-base-100 flex min-h-0 grow flex-col gap-4 overflow-y-auto p-4"
            >
                {/* Spacer pushes messages to the bottom. Using justify-end with
                   overflow-y-auto causes upward overflow that is unreachable
                   by scrolling, so we use a grow spacer instead. */}
                <div className="grow" />
                {messages.length > 0 ? (
                    messages.map((message) => {
                        const isUser = message.role === 'user';

                        const textContent = message.parts
                            .filter(
                                (part) =>
                                    part.type === 'text' && 'text' in part,
                            )
                            .map((part) => part.text)
                            .join('');

                        const toolParts = message.parts.filter(
                            (part) => isToolPart(part),
                        ) as unknown as ToolPart[];

                        const content = (
                            <>
                                {textContent && (
                                    <Markdown>{textContent}</Markdown>
                                )}
                                {toolParts.map((part) =>
                                    NOTE_TOOLS.has(part.toolName) ? (
                                        <NoteToolPart
                                            key={part.toolCallId}
                                            toolName={part.toolName}
                                            state={part.state}
                                            output={
                                                part.state ===
                                                'output-available'
                                                    ? (part as unknown as { output: Record<string, unknown> }).output
                                                    : undefined
                                            }
                                        />
                                    ) : (
                                        <ToolPartFallback
                                            key={part.toolCallId}
                                            part={part}
                                        />
                                    ),
                                )}
                                {!textContent &&
                                    toolParts.length === 0 &&
                                    !isUser && (
                                        <span
                                            role="status"
                                            aria-label="Loading response"
                                        >
                                            <LoaderCircleIcon
                                                aria-hidden="true"
                                                className="h-5 w-5 animate-spin"
                                            />
                                        </span>
                                    )}
                            </>
                        );

                        return (
                            <ChatBubble
                                key={message.id}
                                variant={isUser ? 'primary' : 'default'}
                                placement={isUser ? 'end' : 'start'}
                            >
                                {content}
                            </ChatBubble>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500">
                        No messages yet
                    </div>
                )}
            </div>
            <div className="rounded-box border-base-300 bg-base-100 flex items-center gap-2 border p-2">
                <input
                    id="chat-message-input"
                    type="text"
                    aria-label="Message"
                    className="input rounded-field grow"
                    placeholder="Your message here..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={status !== 'ready'}
                />
                <button
                    className="btn btn-default"
                    onClick={stop}
                    disabled={
                        status !== 'streaming' && status !== 'submitted'
                    }
                >
                    <StopCircleIcon aria-hidden="true" className="h-6 w-6" />{' '}
                    Stop
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={handleSend}
                    disabled={status !== 'ready'}
                >
                    <SendHorizonalIcon aria-hidden="true" className="h-6 w-6" />{' '}
                    Send
                </button>
            </div>
        </>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <div role="alert" className="alert alert-error">
                <CircleXIcon aria-hidden="true" className="h-6 w-6" />
                <span>
                    {error.status} {error.statusText}
                </span>
            </div>
        );
    }

    return (
        <div role="alert" className="alert alert-error">
            <CircleXIcon aria-hidden="true" className="h-6 w-6" />
            <span>
                Experiencing technical difficulties. Please try again later.
            </span>
        </div>
    );
}
