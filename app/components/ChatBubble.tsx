import type {
    HTMLAttributes,
    PropsWithChildren,
    TimeHTMLAttributes,
} from 'react';
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const chatVariants = cva({
    base: 'chat',
    variants: {
        placement: {
            start: 'chat-start',
            end: 'chat-end',
        },
    },
    defaultVariants: {
        placement: 'start',
    },
});

export const chatBubbleMessageVariants = cva({
    base: 'chat-bubble',
    variants: {
        color: {
            neutral: 'chat-bubble-neutral',
            primary: 'chat-bubble-primary',
            secondary: 'chat-bubble-secondary',
            accent: 'chat-bubble-accent',
            info: 'chat-bubble-info',
            success: 'chat-bubble-success',
            warning: 'chat-bubble-warning',
            error: 'chat-bubble-error',
        },
    },
    defaultVariants: {
        color: 'primary',
    },
});

interface ChatBubbleProps
    extends HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof chatVariants> {}

export function ChatBubble({
    placement,
    className,
    children,
    ...props
}: PropsWithChildren<ChatBubbleProps>) {
    return (
        <div className={cx(chatVariants({ placement }), className)} {...props}>
            {children}
        </div>
    );
}

interface ChatBubbleMessageProps
    extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
        VariantProps<typeof chatBubbleMessageVariants> {}

export function ChatBubbleMessage({
    color = 'neutral',
    className,
    children,
    ...props
}: PropsWithChildren<ChatBubbleMessageProps>) {
    return (
        <div
            className={cx(chatBubbleMessageVariants({ color }), className)}
            {...props}
        >
            {children}
        </div>
    );
}

export type ChatBubbleAvatarProps = HTMLAttributes<HTMLDivElement>;

export function ChatBubbleAvatar({
    className,
    children,
    ...props
}: PropsWithChildren<ChatBubbleAvatarProps>) {
    return (
        <div className={cx('chat-image avatar', className)} {...props}>
            {children}
        </div>
    );
}

export type ChatBubbleHeaderProps = HTMLAttributes<HTMLDivElement>;

export function ChatBubbleHeader({
    className,
    children,
    ...props
}: PropsWithChildren<ChatBubbleHeaderProps>) {
    return (
        <div className={cx('chat-header', className)} {...props}>
            {children}
        </div>
    );
}

export type ChatBubbleFooterProps = HTMLAttributes<HTMLDivElement>;

export function ChatBubbleFooter({
    className,
    children,
    ...props
}: PropsWithChildren<ChatBubbleFooterProps>) {
    return (
        <div className={cx('chat-footer', className)} {...props}>
            {children}
        </div>
    );
}

export type ChatBubbleTimeProps = TimeHTMLAttributes<HTMLTimeElement>;

export function ChatBubbleTime({
    className,
    children,
    ...props
}: PropsWithChildren<ChatBubbleTimeProps>) {
    return (
        <time className={cx('text-xs opacity-50', className)} {...props}>
            {children}
        </time>
    );
}
