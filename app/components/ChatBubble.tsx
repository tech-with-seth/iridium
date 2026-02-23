import type { PropsWithChildren } from 'react';
import type { VariantProps } from 'cva';
import { cva, cx } from 'cva.config';

export const chatBubbleContainerVariants = cva({
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

export const chatBubbleVariants = cva({
    base: 'chat-bubble',
    variants: {
        variant: {
            primary: 'chat-bubble-primary',
            secondary: 'chat-bubble-secondary',
            accent: 'chat-bubble-accent',
            default: '',
        },
    },
    defaultVariants: {
        variant: 'primary',
    },
});

interface ChatBubbleProps
    extends
        VariantProps<typeof chatBubbleContainerVariants>,
        VariantProps<typeof chatBubbleVariants> {}

export function ChatBubble({
    children,
    placement,
    variant,
}: PropsWithChildren<ChatBubbleProps>) {
    return (
        <div className={cx(chatBubbleContainerVariants({ placement }))}>
            <div
                className={cx(
                    chatBubbleVariants({
                        variant,
                    }),
                )}
            >
                {children}
            </div>
        </div>
    );
}
