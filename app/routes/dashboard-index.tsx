import { MessageCircleQuestionMarkIcon } from 'lucide-react';
import { Outlet } from 'react-router';

export default function DashboardIndexRoute() {
    return (
        <>
            <div className="bg-base-100 rounded-box flex flex-col gap-8 justify-center items-center h-full">
                <MessageCircleQuestionMarkIcon className="w-16 h-16 stroke-base-300" />
                <p className="text-base-content">
                    Select a thread to start chatting!
                </p>
            </div>
            <Outlet />
        </>
    );
}
