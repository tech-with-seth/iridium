import { useNavigation, useOutletContext } from 'react-router';
import type { Route } from './+types/file-browser-index';
import { Alert } from '~/components/feedback/Alert';

export default function FileBrowserIndexRoute(_: Route.ComponentProps) {
    const navigation = useNavigation();
    const isNavigating = navigation.state !== 'idle';

    return (
        <div className="flex h-full flex-col">
            {isNavigating && (
                <div className="mb-3 flex items-center gap-2 text-sm text-base-content/60">
                    <span className="loading loading-spinner loading-sm" />
                    Loading asset preview…
                </div>
            )}
            <Alert status="info">Select an object to preview it here.</Alert>
        </div>
    );
}
