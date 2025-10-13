import { useRouteLoaderData } from 'react-router';
import type { Role, User } from '~/generated/prisma/client';
import type { FeatureFlag } from '~/types/posthog';

interface RootDataResponse {
    user: User | null;
    role: Role | null;
    activeFlags: Record<string, boolean>;
    featureFlags: FeatureFlag[];
}

export function useRootData() {
    return useRouteLoaderData<RootDataResponse>('root');
}
