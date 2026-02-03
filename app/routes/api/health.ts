import type { Route } from './+types/health';
import { prisma } from '~/db.server';

interface HealthResponse {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    version: string;
    checks: {
        database: 'ok' | 'error';
    };
    responseTime?: number;
}

/**
 * Health check endpoint for Railway and monitoring.
 *
 * Returns:
 * - 200 with status "ok" when all systems are healthy
 * - 200 with status "degraded" when database is down but app is running
 * - 500 with status "error" for unexpected failures
 *
 * Configure Railway to use `/api/health` as the health check URL.
 */
export async function loader({ request }: Route.LoaderArgs) {
    const startTime = Date.now();

    let databaseStatus: 'ok' | 'error' = 'error';

    try {
        // Ping database with a simple query
        await prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'ok';
    } catch {
        databaseStatus = 'error';
    }

    const responseTime = Date.now() - startTime;

    const response: HealthResponse = {
        status: databaseStatus === 'ok' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.0.1',
        checks: {
            database: databaseStatus,
        },
        responseTime,
    };

    // Return 200 even for degraded - Railway healthcheck expects 200
    // The status field indicates actual health
    return Response.json(response, {
        status: 200,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
    });
}
