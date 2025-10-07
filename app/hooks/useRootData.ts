import { useRouteLoaderData } from 'react-router';
import type { User } from '~/generated/prisma/client';

export function useRootData() {
    return useRouteLoaderData<{ user: User | null }>('root');
}
