import { PostHog } from 'posthog-node';

console.log(
    '\n\n',
    '===== POSTHOG_API_KEY LOG =====',
    JSON.stringify({ key: process.env.POSTHOG_API_KEY }, null, 4),
    '\n\n',
);

export const postHogClient = new PostHog(process.env.POSTHOG_API_KEY!, {
    host: process.env.POSTHOG_HOST,
});
