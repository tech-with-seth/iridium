import { createContext } from 'react-router';
import type { User } from './generated/prisma/client';

export type ContextType = User | null;

export const userContext = createContext<ContextType>(null);
