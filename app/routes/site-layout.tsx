import { CogIcon } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router';

import { Button } from '~/components/actions/Button';
import { Drawer } from '~/components/layout/Drawer';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { AdminPanel } from '~/components/utilities/AdminPanel';
import { Turnstile } from '~/components/utilities/Turnstile';
import { useDrawer } from '~/hooks/useDrawer';
import { useRootData } from '~/hooks/useRootData';

export default function SiteLayoutRoute() {
    const data = useRootData();
    const navigate = useNavigate();

    const [isAppDrawerOpen, appDrawerActions] = useDrawer();
    const hasAccessPermissions =
        data?.role === 'ADMIN' || data?.role === 'EDITOR';

    return (
        <>
            <Drawer
                id="appDrawer"
                isOpen={isAppDrawerOpen}
                handleClose={appDrawerActions.closeDrawer}
                drawerContentClassName="min-h-screen flex flex-col"
                contents={
                    data?.user?.id ? (
                        <AdminPanel
                            drawerActions={appDrawerActions}
                            allFlags={data.allFlags}
                            theme={
                                data.theme ||
                                process.env.DEFAULT_THEME ||
                                'light'
                            }
                            user={data.user}
                        />
                    ) : (
                        <Turnstile
                            onSuccessfulLogin={() => {
                                appDrawerActions.closeDrawer();
                                navigate('/');
                            }}
                        />
                    )
                }
            >
                <section className="bg-linear-to-br from-primary/50 to-secondary/50 h-98">
                    <Header handleOpenDrawer={appDrawerActions.openDrawer} />
                </section>
                <main className="flex grow flex-col -mt-72">
                    <Outlet />
                </main>
                <Footer />
                {hasAccessPermissions && (
                    <div className="fixed bottom-4 right-4">
                        <Button
                            circle
                            onClick={appDrawerActions.openDrawer}
                            status="primary"
                        >
                            <CogIcon />
                        </Button>
                    </div>
                )}
            </Drawer>
        </>
    );
}
