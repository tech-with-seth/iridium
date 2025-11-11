import posthog from 'posthog-js';

export type EventNameType =
    | 'auth_mode_toggle'
    | 'chat_message_sent'
    | 'email_sent'
    | 'portal_access_success'
    | 'portal_access_unauthorized'
    | 'portal_customer_not_found'
    | 'request_id'
    | 'sign_in_attempt'
    | 'sign_in_success'
    | 'sign_in_error'
    | 'sign_up_attempt'
    | 'sign_up_error'
    | 'sign_up_success';

export function logEvent(eventName: EventNameType, meta: Record<string, any>) {
    posthog.capture(eventName, {
        ...meta,
        timestamp: new Date().toISOString(),
    });
}

export type ExceptionNameType =
    | 'account_deletion'
    | 'customer_portal_access'
    | 'email_api'
    | 'feature_flag_toggle'
    | 'feature_flags_fetch'
    | 'profile_edit'
    | 'profile_update'
    | 'session_retrieval'
    | 'shop_details_loader'
    | 'shop_loader'
    | 'sign_in'
    | 'sign_out'
    | 'sign_up';

export function logException(
    error: Error,
    meta: { context: ExceptionNameType; [key: string]: string },
) {
    posthog.captureException(error, {
        ...meta,
        timestamp: new Date().toISOString(),
    });
}
