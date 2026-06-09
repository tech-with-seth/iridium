import { Outlet } from 'react-router';
import { SiteFooter } from '~/components/SiteFooter';
import { SiteHeader } from '~/components/SiteHeader';

export default function MarketingLayout() {
    return (
        <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1">
                <Outlet />
            </main>
            <SiteFooter />
        </div>
    );
}
