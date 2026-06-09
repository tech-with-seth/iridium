import { Outlet } from 'react-router';
import { SiteFooter } from '~/components/SiteFooter';
import { SiteHeader } from '~/components/SiteHeader';

export default function AppLayout() {
    return (
        <div className="grid h-dvh grid-rows-[auto_1fr_auto]">
            <SiteHeader />
            <main
                id="main-content"
                className="flex min-h-0 flex-col overflow-y-auto"
            >
                <Outlet />
            </main>
            <SiteFooter />
        </div>
    );
}
