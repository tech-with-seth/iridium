import { SpoolIcon } from 'lucide-react';

export default function ChatIndexRoute() {
    return (
        <div className="bg-base-300 rounded-box flex grow items-center justify-center">
            <div>
                <SpoolIcon className="text-base-content mx-auto mb-4 h-12 w-12" />
                <p className="text-base-content text-lg">Pick a thread!</p>
            </div>
        </div>
    );
}
