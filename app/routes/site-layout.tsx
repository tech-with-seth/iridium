import { CogIcon } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { AdminPanel } from '~/components/utilities/AdminPanel';
import { Button } from '~/components/actions/Button';
import { cx } from '~/cva.config';
import { Drawer } from '~/components/layout/Drawer';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { Paths } from '~/constants';
import { Turnstile } from '~/components/utilities/Turnstile';
import { useDrawer } from '~/hooks/useDrawer';
import { useRootData } from '~/hooks/useRootData';

export default function SiteLayoutRoute() {
    const data = useRootData();
    const navigate = useNavigate();
    const location = useLocation();

    const [isAppDrawerOpen, appDrawerActions] = useDrawer();
    const hasAccessPermissions =
        data?.role === 'ADMIN' || data?.role === 'EDITOR';
    const isDashboardAppShell = location.pathname.startsWith(Paths.DASHBOARD);

    const mainClassName = cx(
        'flex flex-col',
        isDashboardAppShell ? 'min-h-0 overflow-hidden' : 'grow',
    );

    const drawerContentClassName = cx(
        isDashboardAppShell
            ? 'h-screen overflow-hidden grid grid-rows-[auto_minmax(0,1fr)]'
            : 'min-h-screen flex flex-col',
    );

    const drawerContents = data?.user?.id ? (
        <AdminPanel
            drawerActions={appDrawerActions}
            allFlags={data.allFlags}
            theme={data.theme || process.env.DEFAULT_THEME || 'light'}
            user={data.user}
        />
    ) : (
        <Turnstile
            onSuccessfulLogin={() => {
                appDrawerActions.closeDrawer();
                navigate('/');
            }}
        />
    );

    const adminButton = hasAccessPermissions ? (
        <div className="fixed bottom-4 right-4">
            <Button
                circle
                onClick={appDrawerActions.openDrawer}
                status="primary"
            >
                <CogIcon />
            </Button>
        </div>
    ) : null;

    return (
        <>
            <Drawer
                id="appDrawer"
                isOpen={isAppDrawerOpen}
                handleClose={appDrawerActions.closeDrawer}
                drawerContentClassName={drawerContentClassName}
                contents={drawerContents}
            >
                <Header handleOpenDrawer={appDrawerActions.openDrawer} />
                <main className={mainClassName}>
                    <Outlet />
                </main>
                <Footer />
                {adminButton}
            </Drawer>
        </>
    );
}
