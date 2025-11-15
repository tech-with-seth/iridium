import { PostHog } from 'posthog-node';
import 'dotenv/config';

export const postHogClient = new PostHog(process.env.POSTHOG_API_KEY!, {
    host: process.env.POSTHOG_HOST,
});
