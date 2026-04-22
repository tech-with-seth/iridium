/**
 * Tiny structured-JSON logger. No deps.
 *
 * Emits one JSON object per line to stdout/stderr so logs can be ingested by
 * any log aggregator that understands NDJSON (Datadog, Loki, CloudWatch, etc.)
 * without adding a runtime dependency.
 */

type LogLevel = 'info' | 'warn' | 'error';

type LogFields = Record<string, unknown>;

function serializeError(error: unknown): LogFields {
    if (error instanceof Error) {
        return {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        };
    }

    return { error: String(error) };
}

function emit(level: LogLevel, event: string, fields: LogFields = {}) {
    const payload = {
        ts: new Date().toISOString(),
        level,
        event,
        ...fields,
    };

    const line = JSON.stringify(payload, (_key, value) => {
        if (value instanceof Error) {
            return {
                name: value.name,
                message: value.message,
                stack: value.stack,
            };
        }
        return value;
    });

    if (level === 'error') {
        console.error(line);
    } else if (level === 'warn') {
        console.warn(line);
    } else {
        console.log(line);
    }
}

export const log = {
    info(event: string, fields?: LogFields) {
        emit('info', event, fields);
    },
    warn(event: string, fields?: LogFields) {
        emit('warn', event, fields);
    },
    error(event: string, fields?: LogFields) {
        emit('error', event, fields);
    },
    /** Convenience: log an error with structured stack trace. */
    exception(event: string, error: unknown, fields?: LogFields) {
        emit('error', event, { ...serializeError(error), ...fields });
    },
};
