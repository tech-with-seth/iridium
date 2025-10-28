import type { PrismaConfig } from 'prisma';

import 'dotenv/config';

export default {
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    engine: 'classic',
    datasource: {
        url: process.env.DATABASE_URL,
    },
} satisfies PrismaConfig;
