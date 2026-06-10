import { task, logger } from '@trigger.dev/sdk';
import {
    deliverAuthEmail,
    type AuthEmailPayload,
} from '~/lib/email-jobs.server';

/**
 * Sends auth emails (password reset, verification) off the request path.
 * Triggered by `enqueueAuthEmail` in app/lib/jobs.server.ts when
 * TRIGGER_SECRET_KEY is configured.
 */
export const sendAuthEmailTask = task({
    id: 'send-auth-email',
    run: async (payload: AuthEmailPayload) => {
        logger.info('Sending auth email', {
            kind: payload.kind,
            to: payload.to,
        });

        await deliverAuthEmail(payload);
    },
});
