import type { Config } from '@react-router/dev/config';

export default {
    future: {
        v8_middleware: true,
    },
    async prerender() {
        return [];
    },
    ssr: true,
} satisfies Config;
