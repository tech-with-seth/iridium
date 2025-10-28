import { Resend } from 'resend';

/**
 * Resend SDK Client (Singleton)
 *
 * Email service for sending transactional emails.
 * Never call this directly in routes - use functions from `app/models/email.server.ts`
 *
 * @requires RESEND_API_KEY - Environment variable with Resend API key
 * @see https://resend.com/docs
 */
export const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

/**
 * Default sender email address
 * Should be a verified domain in Resend
 */
export const DEFAULT_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
