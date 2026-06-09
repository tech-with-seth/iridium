import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useFetcher, useRouteLoaderData } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import type { Theme } from '~/lib/theme';
import type { loader as rootLoader } from '~/root';

const OPTIONS: { value: Theme; label: string; icon: LucideIcon }[] = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: MonitorIcon },
];

export function ThemeToggle() {
    const fetcher = useFetcher();
    const data = useRouteLoaderData<typeof rootLoader>('root');

    // Optimistic: show the submitted theme before the cookie round-trips.
    const theme =
        (fetcher.formData?.get('theme') as Theme | undefined) ??
        data?.theme ??
        'system';
    const ActiveIcon =
        OPTIONS.find((option) => option.value === theme)?.icon ?? MonitorIcon;

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                aria-label="Change theme"
                className="btn btn-square btn-ghost"
            >
                <ActiveIcon aria-hidden="true" className="h-5 w-5" />
            </div>
            <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-200 rounded-box z-50 w-36 p-2 shadow"
            >
                {OPTIONS.map(({ value, label, icon: Icon }) => (
                    <li key={value}>
                        <button
                            type="button"
                            className={value === theme ? 'menu-active' : ''}
                            onClick={() =>
                                fetcher.submit(
                                    { theme: value },
                                    { method: 'POST', action: '/api/theme' },
                                )
                            }
                        >
                            <Icon aria-hidden="true" className="h-4 w-4" />
                            {label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
