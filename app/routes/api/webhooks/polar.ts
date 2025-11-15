import { Webhooks } from '@polar-sh/remix';

import { postHogClient } from '~/lib/posthog';
import { sendEmail } from '~/models/email.server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export const action = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => {
        console.log('Polar general payload hook', payload);
    },
    onCheckoutCreated: async (payload) => {
        console.log('Polar checkout created', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_checkout_created',
            properties: {
                checkoutId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Checkout Created',
                text: `A new checkout has been created.\n\nCheckout ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'checkout_created',
            });
        }
    },
    onCheckoutUpdated: async (payload) => {
        console.log('Polar checkout updated', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_checkout_updated',
            properties: {
                checkoutId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Checkout Updated',
                text: `A checkout has been updated.\n\nCheckout ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'checkout_updated',
            });
        }
    },
    onOrderCreated: async (payload) => {
        console.log('Polar order created', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_order_created',
            properties: {
                orderId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Order Created',
                text: `A new order has been created.\n\nOrder ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'order_created',
            });
        }
    },
    onOrderPaid: async (payload) => {
        console.log('Polar order paid', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_order_paid',
            properties: {
                orderId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Order Paid',
                text: `An order has been paid.\n\nOrder ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'order_paid',
            });
        }
    },
    onOrderRefunded: async (payload) => {
        console.log('Polar order refunded', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_order_refunded',
            properties: {
                orderId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Order Refunded',
                text: `An order has been refunded.\n\nOrder ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'order_refunded',
            });
        }
    },
    onRefundCreated: async (payload) => {
        console.log('Polar refund created', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_refund_created',
            properties: {
                refundId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Refund Created',
                text: `A new refund has been created.\n\nRefund ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'refund_created',
            });
        }
    },
    onRefundUpdated: async (payload) => {
        console.log('Polar refund updated', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_refund_updated',
            properties: {
                refundId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Refund Updated',
                text: `A refund has been updated.\n\nRefund ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'refund_updated',
            });
        }
    },
    onSubscriptionCreated: async (payload) => {
        console.log('Polar subscription created', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_subscription_created',
            properties: {
                subscriptionId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Subscription Created',
                text: `A new subscription has been created.\n\nSubscription ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'subscription_created',
            });
        }
    },
    onSubscriptionUpdated: async (payload) => {
        console.log('Polar subscription updated', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_subscription_updated',
            properties: {
                subscriptionId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Subscription Updated',
                text: `A subscription has been updated.\n\nSubscription ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'subscription_updated',
            });
        }
    },
    onSubscriptionActive: async (payload) => {
        console.log('Polar subscription active', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_subscription_active',
            properties: {
                subscriptionId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Subscription Active',
                text: `A subscription is now active.\n\nSubscription ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'subscription_active',
            });
        }
    },
    onSubscriptionCanceled: async (payload) => {
        console.log('Polar subscription canceled', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_subscription_canceled',
            properties: {
                subscriptionId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Subscription Canceled',
                text: `A subscription has been canceled.\n\nSubscription ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'subscription_canceled',
            });
        }
    },
    onSubscriptionRevoked: async (payload) => {
        console.log('Polar subscription revoked', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_subscription_revoked',
            properties: {
                subscriptionId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Subscription Revoked',
                text: `A subscription has been revoked.\n\nSubscription ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'subscription_revoked',
            });
        }
    },
    onSubscriptionUncanceled: async (payload) => {
        console.log('Polar subscription uncanceled', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_subscription_uncanceled',
            properties: {
                subscriptionId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Subscription Uncanceled',
                text: `A subscription has been uncanceled.\n\nSubscription ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'subscription_uncanceled',
            });
        }
    },
    onProductCreated: async (payload) => {
        console.log('Polar product created', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_product_created',
            properties: {
                productId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Product Created',
                text: `A new product has been created.\n\nProduct ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'product_created',
            });
        }
    },
    onProductUpdated: async (payload) => {
        console.log('Polar product updated', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_product_updated',
            properties: {
                productId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Product Updated',
                text: `A product has been updated.\n\nProduct ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'product_updated',
            });
        }
    },
    onOrganizationUpdated: async (payload) => {
        console.log('Polar organization updated', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_organization_updated',
            properties: {
                organizationId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Organization Updated',
                text: `An organization has been updated.\n\nOrganization ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'organization_updated',
            });
        }
    },
    onBenefitCreated: async (payload) => {
        console.log('Polar benefit created', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_benefit_created',
            properties: {
                benefitId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Benefit Created',
                text: `A new benefit has been created.\n\nBenefit ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'benefit_created',
            });
        }
    },
    onBenefitUpdated: async (payload) => {
        console.log('Polar benefit updated', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_benefit_updated',
            properties: {
                benefitId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Benefit Updated',
                text: `A benefit has been updated.\n\nBenefit ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'benefit_updated',
            });
        }
    },
    onBenefitGrantCreated: async (payload) => {
        console.log('Polar benefit grant created', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_benefit_grant_created',
            properties: {
                benefitGrantId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Benefit Grant Created',
                text: `A new benefit grant has been created.\n\nBenefit Grant ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'benefit_grant_created',
            });
        }
    },
    onBenefitGrantUpdated: async (payload) => {
        console.log('Polar benefit grant updated', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_benefit_grant_updated',
            properties: {
                benefitGrantId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Benefit Grant Updated',
                text: `A benefit grant has been updated.\n\nBenefit Grant ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'benefit_grant_updated',
            });
        }
    },
    onBenefitGrantRevoked: async (payload) => {
        console.log('Polar benefit grant revoked', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_benefit_grant_revoked',
            properties: {
                benefitGrantId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Benefit Grant Revoked',
                text: `A benefit grant has been revoked.\n\nBenefit Grant ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'benefit_grant_revoked',
            });
        }
    },
    onCustomerCreated: async (payload) => {
        console.log('Polar customer created', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_customer_created',
            properties: {
                customerId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Customer Created',
                text: `A new customer has been created.\n\nCustomer ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'customer_created',
            });
        }
    },
    onCustomerUpdated: async (payload) => {
        console.log('Polar customer updated', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_customer_updated',
            properties: {
                customerId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Customer Updated',
                text: `A customer has been updated.\n\nCustomer ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'customer_updated',
            });
        }
    },
    onCustomerDeleted: async (payload) => {
        console.log('Polar customer deleted', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_customer_deleted',
            properties: {
                customerId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Customer Deleted',
                text: `A customer has been deleted.\n\nCustomer ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'customer_deleted',
            });
        }
    },
    onCustomerStateChanged: async (payload) => {
        console.log('Polar customer state changed', payload);
        postHogClient.capture({
            distinctId: 'system',
            event: 'polar_customer_state_changed',
            properties: {
                customerId: payload.data.id,
            },
        });

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Customer State Changed',
                text: `A customer state has changed.\n\nCustomer ID: ${payload.data.id}\n\nPayload: ${JSON.stringify(payload.data, null, 2)}`,
            });
        } catch (error) {
            postHogClient.captureException(error as Error, 'system', {
                context: 'polar_webhook_email',
                webhookType: 'customer_state_changed',
            });
        }
    },
});
