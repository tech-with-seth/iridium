import { SendHorizonalIcon } from 'lucide-react';
import { ChatBubble } from '~/components/ChatBubble';
import { Container } from '~/components/Container';
import { listItemClassName } from '~/shared';

export async function loader() {
    return null;
}

export async function action() {
    return null;
}

export default function ChatRoute() {
    return (
        <>
            <title>Chat | Iridium</title>
            <meta name="description" content="This is the chat page" />
            <Container className="flex h-full flex-col gap-4 p-4">
                <h1 className="mb-4 text-4xl font-bold">Chat</h1>
                <div className="grid grow grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <ul className="flex flex-col gap-4">
                            <li className={listItemClassName}>
                                <strong>General</strong>
                            </li>
                            <li className={listItemClassName}>
                                <strong>Random</strong>
                            </li>
                            <li className={listItemClassName}>
                                <strong>Help</strong>
                            </li>
                        </ul>
                    </div>
                    <div className="col-span-8 flex flex-col gap-4">
                        <div className="flex justify-end grow flex-col gap-4 rounded-box bg-base-100 p-4">
                            <ChatBubble variant="accent">asdf</ChatBubble>
                            <ChatBubble variant="accent">asdf</ChatBubble>
                            <ChatBubble placement='end'>asdf</ChatBubble>
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
                    </div>
                </div>
            </Container>
        </>
    );
}
