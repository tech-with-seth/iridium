import { schedules, logger } from '@trigger.dev/sdk';
import { purgeSoftDeletedThreads } from '~/models/thread.server';
import { purgeSoftDeletedNotes } from '~/models/note.server';

/** Soft-deleted rows older than this are gone for good. */
const RETENTION_DAYS = 30;

/**
 * Nightly cleanup: hard-deletes Threads and Notes whose soft-delete window
 * has lapsed. Without this job soft-deleted rows accumulate forever.
 */
export const purgeSoftDeletedTask = schedules.task({
    id: 'purge-soft-deleted',
    // Daily at 04:17 UTC (off the hour to avoid thundering-herd crons).
    cron: '17 4 * * *',
    run: async () => {
        const [threads, notes] = await Promise.all([
            purgeSoftDeletedThreads(RETENTION_DAYS),
            purgeSoftDeletedNotes(RETENTION_DAYS),
        ]);

        logger.info('Purged soft-deleted rows', {
            retentionDays: RETENTION_DAYS,
            threadsDeleted: threads.count,
            notesDeleted: notes.count,
        });

        return {
            threadsDeleted: threads.count,
            notesDeleted: notes.count,
        };
    },
});
