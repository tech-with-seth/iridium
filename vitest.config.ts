import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./app/test/setup.ts'],
        include: ['**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'build', '.react-router', 'tests/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'app/test/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData',
                'build',
                '.react-router',
            ],
        },
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './app'),
        },
    },
});
