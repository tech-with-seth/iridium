import { Outlet } from 'react-router';

export default function AuthLayout() {
    return (
        <div className="h-dvh">
            <Outlet />
        </div>
    );
}
