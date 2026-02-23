import { CircleXIcon, SendHorizonalIcon } from 'lucide-react';
import { ChatBubble } from '~/components/ChatBubble';
import type { Route } from './+types/thread';
import { getThreadById } from '~/models/thread.server';
import invariant from 'tiny-invariant';
import { isRouteErrorResponse, useRouteError } from 'react-router';

export async function loader({ params }: Route.LoaderArgs) {
    const thread = await getThreadById(params.threadId);
    // invariant(thread, 'Thread could not be found');

    return {
        thread,
    };
}

export default function ThreadRoute({ loaderData }: Route.ComponentProps) {
    return (
        <>
            <div className="rounded-box bg-base-100 flex grow flex-col justify-end gap-4 p-4">
                {loaderData.thread.messages.map((message) => (
                    <ChatBubble key={message.id}>{message.content}</ChatBubble>
                ))}
            </div>
            <div className="rounded-box border-base-300 bg-base-100 flex items-center gap-2 border p-2">
                <input
                    type="text"
                    className="input rounded-field grow"
                    placeholder="Your message here..."
                />
                <button className="btn btn-secondary">
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
