/**
 * Environment Variable Validation Script
 *
 * Validates that required environment variables are set before deployment.
 * Parses .env.example to determine which variables are required vs optional.
 *
 * Usage:
 *   npm run validate:env              # Check current environment
 *   npm run validate:env -- --railway # Check Railway environment
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Required for core functionality (app won't work without these)
const REQUIRED_VARS = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'VITE_BETTER_AUTH_BASE_URL',
];

// Required for specific features (can be disabled if not using feature)
const FEATURE_VARS: Record<string, string[]> = {
    'Email (Resend)': ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'],
    'AI (OpenAI)': ['OPENAI_API_KEY'],
    'Billing (Polar)': [
        'POLAR_ACCESS_TOKEN',
        'POLAR_ORGANIZATION_ID',
        'POLAR_PRODUCT_ID',
        'POLAR_WEBHOOK_SECRET',
    ],
    'Analytics (PostHog)': ['POSTHOG_API_KEY', 'POSTHOG_HOST'],
    'OAuth (GitHub)': ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
    'OAuth (Google)': ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    'Storage (AWS/Railway)': [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_BUCKET_NAME',
    ],
};

interface ValidationResult {
    missing: string[];
    present: string[];
    featureStatus: Record<string, { enabled: boolean; missing: string[] }>;
}

function getEnvVars(useRailway: boolean): Record<string, string> {
    if (useRailway) {
        try {
            const output = execSync('railway variables --json', {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            return JSON.parse(output);
        } catch (error) {
            console.error(
                '❌ Failed to fetch Railway variables. Are you logged in?',
            );
            console.error('   Run: railway login');
            process.exit(1);
        }
    }

    // Load from .env file
    const envPath = resolve(process.cwd(), '.env');
    if (!existsSync(envPath)) {
        console.error('❌ No .env file found. Copy .env.example to .env');
        process.exit(1);
    }

    const envContent = readFileSync(envPath, 'utf-8');
    const vars: Record<string, string> = {};

    envContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1]!.trim();
            let value = match[2]!.trim();
            // Remove quotes if present
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }
            vars[key] = value;
        }
    });

    return vars;
}

function validateEnv(vars: Record<string, string>): ValidationResult {
    const missing: string[] = [];
    const present: string[] = [];

    // Check required vars
    for (const varName of REQUIRED_VARS) {
        const value = vars[varName];
        if (!value || value.startsWith('<YOUR_')) {
            missing.push(varName);
        } else {
            present.push(varName);
        }
    }

    // Check feature vars
    const featureStatus: Record<
        string,
        { enabled: boolean; missing: string[] }
    > = {};

    for (const [feature, varNames] of Object.entries(FEATURE_VARS)) {
        const featureMissing: string[] = [];
        let hasAny = false;

        for (const varName of varNames) {
            const value = vars[varName];
            if (!value || value.startsWith('<YOUR_')) {
                featureMissing.push(varName);
            } else {
                hasAny = true;
            }
        }

        featureStatus[feature] = {
            enabled: hasAny && featureMissing.length === 0,
            missing: featureMissing,
        };
    }

    return { missing, present, featureStatus };
}

function printResults(result: ValidationResult, source: string): void {
    console.log(`\n🔍 Validating environment variables (${source})\n`);

    // Required vars
    console.log('━━━ Required Variables ━━━');
    if (result.missing.length === 0) {
        console.log('✅ All required variables are set\n');
    } else {
        for (const varName of result.missing) {
            console.log(`❌ ${varName} - MISSING`);
        }
        for (const varName of result.present) {
            console.log(`✅ ${varName}`);
        }
        console.log();
    }

    // Feature vars
    console.log('━━━ Optional Features ━━━');
    for (const [feature, status] of Object.entries(result.featureStatus)) {
        if (status.enabled) {
            console.log(`✅ ${feature} - Enabled`);
        } else if (status.missing.length === Object.keys(FEATURE_VARS).length) {
            console.log(`⚪ ${feature} - Disabled (not configured)`);
        } else {
            console.log(
                `⚠️  ${feature} - Partial (missing: ${status.missing.join(', ')})`,
            );
        }
    }

    console.log();

    // Summary
    if (result.missing.length > 0) {
        console.log(
            '❌ Deployment blocked: Missing required environment variables',
        );
        console.log('   Set them with: railway variables --set KEY=value\n');
        process.exit(1);
    } else {
        console.log('✅ Ready for deployment\n');
    }
}

// Main
const useRailway = process.argv.includes('--railway');
const source = useRailway ? 'Railway' : 'local .env';
const vars = getEnvVars(useRailway);
const result = validateEnv(vars);
printResults(result, source);
