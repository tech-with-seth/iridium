import type { User } from 'better-auth';
import { useOutletContext } from 'react-router';

export function useAuthenticatedContext() {
    return useOutletContext<{ user: User }>();
}
