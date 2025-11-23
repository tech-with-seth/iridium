import { Resend } from 'resend';

let resendInstance: Resend | null = null;

const hasResendConfig = Boolean(process.env.RESEND_API_KEY);

export function isResendEnabled() {
    return hasResendConfig;
}

export function getResendClient() {
    if (!hasResendConfig) {
        return null;
    }

    if (!resendInstance) {
        resendInstance = new Resend(process.env.RESEND_API_KEY);
    }

    return resendInstance;
}
