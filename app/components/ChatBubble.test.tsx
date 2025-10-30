import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '~/test/utils';
import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleFooter,
    ChatBubbleHeader,
    ChatBubbleMessage,
    ChatBubbleTime,
} from './ChatBubble';

describe('ChatBubble components', () => {
    it('renders with default placement and neutral message color', () => {
        const { container } = renderWithProviders(
            <ChatBubble>
                <ChatBubbleMessage>Hello there</ChatBubbleMessage>
            </ChatBubble>,
        );

        const bubble = container.firstElementChild as HTMLElement;
        expect(bubble).toHaveClass('chat', 'chat-start');

        const message = screen.getByText('Hello there');
        expect(message).toHaveClass('chat-bubble', 'chat-bubble-neutral');
    });

    it('supports placement and color variants', () => {
        const { container } = renderWithProviders(
            <ChatBubble placement="end">
                <ChatBubbleMessage color="success">
                    General Kenobi
                </ChatBubbleMessage>
            </ChatBubble>,
        );

        const bubble = container.firstElementChild as HTMLElement;
        expect(bubble).toHaveClass('chat-end');

        const message = screen.getByText('General Kenobi');
        expect(message).toHaveClass('chat-bubble-success');
    });

    it('renders helper components with expected classes and forwards props', () => {
        renderWithProviders(
            <ChatBubble className="custom-chat">
                <ChatBubbleAvatar
                    data-testid="avatar"
                    className="custom-avatar"
                >
                    <img alt="Obi-Wan" src="/obi-wan.png" />
                </ChatBubbleAvatar>
                <ChatBubbleHeader data-testid="header">
                    Master Obi-Wan
                </ChatBubbleHeader>
                <ChatBubbleMessage className="custom-message">
                    You are a bold one.
                </ChatBubbleMessage>
                <ChatBubbleFooter data-testid="footer">
                    Delivered
                </ChatBubbleFooter>
                <ChatBubbleTime data-testid="time" dateTime="12:45">
                    12:45 PM
                </ChatBubbleTime>
            </ChatBubble>,
        );

        const avatar = screen.getByTestId('avatar');
        expect(avatar).toHaveClass('chat-image', 'avatar', 'custom-avatar');

        const header = screen.getByTestId('header');
        expect(header).toHaveClass('chat-header');

        const footer = screen.getByTestId('footer');
        expect(footer).toHaveClass('chat-footer');

        const time = screen.getByTestId('time');
        expect(time.tagName).toBe('TIME');
        expect(time).toHaveClass('text-xs', 'opacity-50');
        expect(time).toHaveAttribute('dateTime', '12:45');

        const message = screen.getByText('You are a bold one.');
        expect(message).toHaveClass(
            'chat-bubble',
            'chat-bubble-neutral',
            'custom-message',
        );
    });
});
