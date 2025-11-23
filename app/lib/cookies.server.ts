import { createCookie } from 'react-router';

export const themeCookie = createCookie('theme', {
    // Omit maxAge for session-length cookie (cleared when browser closes)
    // Or set a very large maxAge for near-indefinite storage:
    // maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
});
