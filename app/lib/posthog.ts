import posthog from 'posthog-js';

export type EventNameType =
    | 'auth_mode_toggle'
    | 'chat_message_sent'
    | 'email_sent'
    | 'polar_benefit_created'
    | 'polar_benefit_grant_created'
    | 'polar_benefit_grant_revoked'
    | 'polar_benefit_grant_updated'
    | 'polar_benefit_updated'
    | 'polar_checkout_created'
    | 'polar_checkout_updated'
    | 'polar_customer_created'
    | 'polar_customer_deleted'
    | 'polar_customer_state_changed'
    | 'polar_customer_updated'
    | 'polar_order_created'
    | 'polar_order_paid'
    | 'polar_order_refunded'
    | 'polar_organization_updated'
    | 'polar_product_created'
    | 'polar_product_updated'
    | 'polar_refund_created'
    | 'polar_refund_updated'
    | 'polar_subscription_active'
    | 'polar_subscription_canceled'
    | 'polar_subscription_created'
    | 'polar_subscription_revoked'
    | 'polar_subscription_uncanceled'
    | 'polar_subscription_updated'
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
    | 'polar_webhook_email'
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
