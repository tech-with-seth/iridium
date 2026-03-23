import type { FullConfig } from '@playwright/test';

const TEST_USERS = [
    { name: 'Alice', email: 'alice@iridium.dev', password: 'password123' },
];

export default async function globalSetup(config: FullConfig) {
    const baseURL =
        config.projects[0]?.use?.baseURL ?? 'http://localhost:5173';

    for (const user of TEST_USERS) {
        const res = await fetch(`${baseURL}/api/auth/sign-up/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });

        if (res.ok) {
            console.log(`  Created test user ${user.email}`);
        } else {
            const body = await res.json().catch(() => ({}));
            // "User already exists" is fine
            if (body?.code === 'USER_ALREADY_EXISTS') {
                console.log(`  Test user ${user.email} already exists`);
            } else {
                console.log(
                    `  Note: ${user.email} setup returned ${res.status}`,
                );
            }
        }
    }
}
