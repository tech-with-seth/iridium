import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextInput } from '~/components/TextInput';
import { ChatBubble, ChatBubbleMessage } from '~/components/ChatBubble';
import { Container } from '~/components/Container';
import { posthog } from 'posthog-js';
import { logEvent } from '~/lib/posthog';

export default function ChatRoute() {
    const [input, setInput] = useState('');
    const { messages, sendMessage } = useChat();

    return (
        <Container>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage({ text: input });
                    setInput('');

                    logEvent('chat_message_sent', {
                        message: input,
                    });
                }}
            >
                <TextInput
                    value={input}
                    placeholder="Say something..."
                    onChange={(e) => setInput(e.currentTarget.value)}
                />
            </form>
            {messages.map((message) => (
                <div key={message.id} className="whitespace-pre-wrap">
                    {message.role === 'user' ? 'User: ' : 'AI: '}
                    {message.parts.map((part, i) => {
                        switch (part.type) {
                            case 'text':
                                return (
                                    <ChatBubble
                                        key={`${message.id}-${i}`}
                                        placement={
                                            message.role === 'user'
                                                ? 'end'
                                                : 'start'
                                        }
                                    >
                                        <ChatBubbleMessage
                                            color={
                                                message.role === 'user'
                                                    ? 'primary'
                                                    : 'secondary'
                                            }
                                        >
                                            {part.text}
                                        </ChatBubbleMessage>
                                    </ChatBubble>
                                );
                            case 'tool-weather':
                            case 'tool-convertFahrenheitToCelsius':
                                return (
                                    <pre key={`${message.id}-${i}`}>
                                        {JSON.stringify(part, null, 2)}
                                    </pre>
                                );
                        }
                    })}
                </div>
            ))}
        </Container>
    );
}
