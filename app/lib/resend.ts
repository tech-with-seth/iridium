import { Resend } from 'resend';

let resendInstance: Resend | null = null;

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables');
}

export function getResendClient() {
    if (!resendInstance) {
        resendInstance = new Resend(process.env.RESEND_API_KEY);
    }

    return resendInstance;
}
