import { useRouteLoaderData } from 'react-router';
import type { loader } from '~/root';

export function useRootData() {
    return useRouteLoaderData<typeof loader>('root');
}
