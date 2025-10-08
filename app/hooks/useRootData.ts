import { useRouteLoaderData } from 'react-router';
import type { Role, User } from '~/generated/prisma/client';

interface RootDataResponse {
    user: User | null;
    role: Role | null;
}

export function useRootData() {
    return useRouteLoaderData<RootDataResponse>('root');
}
