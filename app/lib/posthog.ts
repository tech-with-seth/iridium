import { PostHog } from 'posthog-node';
import 'dotenv/config';

export const postHogClient = new PostHog(process.env.POSTHOG_API_KEY!, {
    host: process.env.POSTHOG_HOST,
});

async function gracefulShutdown() {
    try {
        await postHogClient.shutdown();
    } catch (error) {
        console.error('PostHog shutdown error:', error);
    }
}

// Flush PostHog queue when Node finishes normally
process.once('beforeExit', () => {
    void gracefulShutdown();
});

// Flush and exit cleanly when the process receives termination signals
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, async () => {
        await gracefulShutdown();
        process.exit(0);
    });
}
