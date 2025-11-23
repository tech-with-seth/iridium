import { MessageCircleDashedIcon } from 'lucide-react';

export default function ChatIndexRoute() {
    return (
        <div className="flex flex-col h-full w-full items-center justify-center gap-8">
            <MessageCircleDashedIcon className="w-16 h-16 stroke-base-content" />
            <p className="text-base-content">Select a thread to get started</p>
        </div>
    );
}
