import { useOutletContext } from 'react-router';
import type { User } from 'better-auth';

export function useAuthenticatedContext() {
    return useOutletContext<{ user: User }>();
}
