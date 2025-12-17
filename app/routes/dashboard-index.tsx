import { MessageCircleQuestionMarkIcon } from 'lucide-react';

export default function DashboardIndexRoute() {
    return (
        <div className="bg-base-100 rounded-box grid h-full min-h-0 place-items-center p-4">
            <div className="flex flex-col gap-8 justify-center items-center">
                <MessageCircleQuestionMarkIcon className="w-16 h-16 stroke-base-300" />
                <p className="text-base-content">
                    Select a thread to start chatting!
                </p>
            </div>
        </div>
    );
}
