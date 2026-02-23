import { createContext } from 'react-router';
import type { User } from '~/generated/prisma/client';

export const userContext = createContext<User | null>(null);
