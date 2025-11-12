import { useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { TextInput } from '~/components/TextInput';
import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
} from '~/components/ChatBubble';
import { Container } from '~/components/Container';
import { logEvent } from '~/lib/posthog';
import type { UIDataTypes, UITools } from 'ai';
import { cx } from '~/cva.config';

// Mock thread data
const MOCK_THREADS = [
    {
        id: '1',
        title: 'Weather Assistant',
        lastMessage: 'What is the weather in San Francisco?',
        timestamp: '2m ago',
        unread: 2,
    },
    {
        id: '2',
        title: 'Temperature Converter',
        lastMessage: 'Convert 72F to Celsius',
        timestamp: '1h ago',
        unread: 0,
    },
    {
        id: '3',
        title: 'General Chat',
        lastMessage: 'Hello! How can you help me?',
        timestamp: '3h ago',
        unread: 0,
    },
    {
        id: '4',
        title: 'Code Review',
        lastMessage: 'Can you review this React component?',
        timestamp: 'Yesterday',
        unread: 1,
    },
];

const MOCK_MESSAGES: UIMessage[] = [
    {
        id: 'mock-1',
        role: 'user',
        parts: [
            {
                type: 'text',
                text: 'Hey assistant, can you help me get ready for my trip?',
            },
        ],
    },
    {
        id: 'mock-2',
        role: 'assistant',
        parts: [
            {
                type: 'text',
                text: 'Absolutely! Where are you heading and what kind of support do you need?',
            },
        ],
    },
    {
        id: 'mock-3',
        role: 'user',
        parts: [
            {
                type: 'text',
                text: 'I am going to San Francisco. Start with the weather and give me packing tips.',
            },
        ],
    },
    {
        id: 'mock-4',
        role: 'assistant',
        parts: [
            {
                type: 'text',
                text: "Here is a quick rundown: it's typically 60-70°F this week with coastal fog in the mornings. Pack layers, a light rain jacket, and comfortable walking shoes.",
            },
        ],
    },
];

const AVATARS: Record<UIMessage['role'], { alt: string; src: string }> = {
    user: {
        alt: 'Traveler avatar',
        src: 'https://picsum.photos/seed/chat-user/64/64',
    },
    assistant: {
        alt: 'Assistant avatar',
        src: 'https://picsum.photos/seed/chat-assistant/64/64',
    },
    system: {
        alt: 'System notification avatar',
        src: 'https://picsum.photos/seed/chat-system/64/64',
    },
};

interface ChatMessageProps {
    className?: string;
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
}

export function ChatMessages({ className, messages }: ChatMessageProps) {
    return (
        <div className={cx('flex flex-col gap-3', className)}>
            {messages.flatMap((message) => {
                if (message.role === 'system') {
                    return [];
                }

                const avatar = AVATARS[message.role] ?? AVATARS.system;
                const placement = message.role === 'user' ? 'end' : 'start';
                const bubbleColor =
                    message.role === 'user' ? 'primary' : 'secondary';

                return message.parts.map((part, index) => {
                    if (
                        part.type !== 'text' &&
                        part.type !== 'tool-weather' &&
                        part.type !== 'tool-convertFahrenheitToCelsius'
                    ) {
                        return null;
                    }

                    const content =
                        part.type === 'text'
                            ? part.text
                            : JSON.stringify(part, null, 2);

                    return (
                        <ChatBubble
                            key={`${message.id}-${index}`}
                            placement={placement}
                            className="items-end gap-3"
                        >
                            <ChatBubbleAvatar>
                                <div className="w-10 rounded-full">
                                    <img src={avatar.src} alt={avatar.alt} />
                                </div>
                            </ChatBubbleAvatar>
                            <ChatBubbleMessage
                                color={bubbleColor}
                                className="whitespace-pre-wrap"
                            >
                                {content}
                            </ChatBubbleMessage>
                        </ChatBubble>
                    );
                });
            })}
        </div>
    );
}

export default function ChatRoute() {
    const [input, setInput] = useState('');
    const [selectedThreadId, setSelectedThreadId] = useState<string>(
        MOCK_THREADS[0]?.id ?? '1',
    );
    const { messages, sendMessage } = useChat();
    const displayedMessages = [...MOCK_MESSAGES, ...messages];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = input.trim();

        if (!trimmed) {
            return;
        }

        sendMessage({ text: trimmed });
        logEvent('chat_message_sent', {
            message: trimmed,
        });

        setInput('');
    };

    return (
        <Container className="flex h-full flex-col px-4 mb-8">
            <div className="flex flex-1 flex-col gap-4 min-h-0 lg:grid lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-6">
                <aside className="flex flex-col gap-3 rounded-box border border-base-200 p-4 shadow-sm lg:h-full lg:min-h-0">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
                        Threads
                    </h2>
                    <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
                        {MOCK_THREADS.map((thread) => {
                            const isActive = thread.id === selectedThreadId;

                            return (
                                <li key={thread.id}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedThreadId(thread.id)
                                        }
                                        className={cx(
                                            'w-full rounded-lg border border-transparent p-3 text-left transition-colors',
                                            isActive
                                                ? 'border-primary/40 bg-base-300'
                                                : 'hover:bg-base-200',
                                        )}
                                    >
                                        <div className="mb-1 flex items-start justify-between">
                                            <h3 className="text-sm font-semibold">
                                                {thread.title}
                                            </h3>
                                            {thread.unread > 0 && (
                                                <span className="badge badge-primary badge-xs">
                                                    {thread.unread}
                                                </span>
                                            )}
                                        </div>
                                        <p className="truncate text-xs text-base-content/60">
                                            {thread.lastMessage}
                                        </p>
                                        <p className="mt-1 text-xs text-base-content/40">
                                            {thread.timestamp}
                                        </p>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </aside>
                <section className="flex min-h-0 flex-1 flex-col rounded-box border border-base-200 p-4 shadow-sm">
                    <ChatMessages
                        className="flex-1 overflow-y-auto pr-2"
                        messages={displayedMessages}
                    />
                    <form
                        onSubmit={handleSubmit}
                        className="mt-4 flex items-end gap-3"
                    >
                        <TextInput
                            value={input}
                            placeholder="Say something..."
                            onChange={(event) =>
                                setInput(event.currentTarget.value)
                            }
                            className="w-full"
                        />
                    </form>
                </section>
            </div>
        </Container>
    );
}
