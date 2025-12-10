import type { User } from 'better-auth';
import type { FeatureFlag } from '~/types/posthog';
import { Button } from '../actions/Button';
import { ExternalLinkIcon, XIcon } from 'lucide-react';
import { TabContent, TabRadio, Tabs } from '../navigation/Tabs';
import { FlagsList } from './FlagsList';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Link } from 'react-router';
import { Paths } from '~/constants';

interface AdminPanelProps {
    allFlags: FeatureFlag[];
    drawerActions: {
        closeDrawer: () => void;
    };
    theme: string;
    user: User | null;
}

export function AdminPanel({
    allFlags,
    drawerActions,
    theme,
    user,
}: AdminPanelProps) {
    return (
        <>
            <div className="flex justify-end">
                <Button circle onClick={drawerActions.closeDrawer}>
                    <XIcon />
                </Button>
            </div>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold ">Admin Panel</h2>
                <p>
                    Logged in as{' '}
                    <strong>{user?.email || 'Unknown User'}</strong>
                </p>
                <h3 className="text-lg font-semibold ">Features</h3>
                <p>Toggle feature flags and customize application settings.</p>
                <Tabs variant="lift">
                    <TabRadio
                        name="my_tabs"
                        label="Feature flags"
                        defaultChecked
                    />
                    <TabContent className="bg-base-100 border-base-300 p-6">
                        <FlagsList flags={allFlags} />
                    </TabContent>

                    <TabRadio name="my_tabs" label="Theme" />
                    <TabContent className="bg-base-100 border-base-300 p-6">
                        <p className="mb-4">
                            Select the theme to temporarily apply to the
                            application interface.
                        </p>
                        <ThemeSwitcher selectedTheme={theme} />
                    </TabContent>
                </Tabs>
                <h3 className="text-lg font-semibold ">Polar</h3>
                <p>
                    <a className="link" href="https://polar.sh/">
                        View the Polar.sh dashboard for more info
                        <ExternalLinkIcon className="inline-block w-4 h-4 ml-1" />
                    </a>
                </p>
                <h3 className="text-lg font-semibold ">Forms</h3>
                <p>
                    <Link className="link" to={Paths.FORMS}>
                        View the Forms page to see user experience
                    </Link>
                </p>
                <h3 className="text-lg font-semibold ">Components</h3>
                <p>
                    <Link className="link" to={Paths.DESIGN}>
                        View more components on the design page
                    </Link>
                </p>
            </div>
        </>
    );
}
