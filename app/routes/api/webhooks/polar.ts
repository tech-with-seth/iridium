import { Webhooks } from '@polar-sh/remix';
import { PostHogEventNames } from '~/constants';

import { getPostHogClient } from '~/lib/posthog';
import { sendEmail } from '~/models/email.server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const postHogClient = getPostHogClient();

export const action = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => {
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_PAYLOAD_RECEIVED,
            properties: {
                payload,
            },
        });
    },
    onCheckoutCreated: async (payload) => {
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_CHECKOUT_CREATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_CHECKOUT_CREATED,
            });
        }
    },
    onCheckoutUpdated: async (payload) => {
        console.log('Polar checkout updated', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_CHECKOUT_UPDATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_CHECKOUT_UPDATED,
            });
        }
    },
    onOrderCreated: async (payload) => {
        console.log('Polar order created', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_ORDER_CREATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context: PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_ORDER_CREATED,
            });
        }
    },
    onOrderPaid: async (payload) => {
        console.log('Polar order paid', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_ORDER_PAID,
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
            postHogClient?.captureException(error as Error, 'system', {
                context: PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_ORDER_PAID,
            });
        }
    },
    onOrderRefunded: async (payload) => {
        console.log('Polar order refunded', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_ORDER_REFUNDED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_ORDER_REFUNDED,
            });
        }
    },
    onRefundCreated: async (payload) => {
        console.log('Polar refund created', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_REFUND_CREATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_REFUND_CREATED,
            });
        }
    },
    onRefundUpdated: async (payload) => {
        console.log('Polar refund updated', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_REFUND_UPDATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_REFUND_UPDATED,
            });
        }
    },
    onSubscriptionCreated: async (payload) => {
        console.log('Polar subscription created', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_SUBSCRIPTION_CREATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_SUBSCRIPTION_CREATED,
            });
        }
    },
    onSubscriptionUpdated: async (payload) => {
        console.log('Polar subscription updated', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_SUBSCRIPTION_UPDATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_SUBSCRIPTION_UPDATED,
            });
        }
    },
    onSubscriptionActive: async (payload) => {
        console.log('Polar subscription active', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_SUBSCRIPTION_ACTIVE,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_SUBSCRIPTION_ACTIVE,
            });
        }
    },
    onSubscriptionCanceled: async (payload) => {
        console.log('Polar subscription canceled', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_SUBSCRIPTION_CANCELED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_SUBSCRIPTION_CANCELED,
            });
        }
    },
    onSubscriptionRevoked: async (payload) => {
        console.log('Polar subscription revoked', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_SUBSCRIPTION_REVOKED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_SUBSCRIPTION_REVOKED,
            });
        }
    },
    onSubscriptionUncanceled: async (payload) => {
        console.log('Polar subscription uncanceled', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_SUBSCRIPTION_UNCANCELED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_SUBSCRIPTION_UNCANCELED,
            });
        }
    },
    onProductCreated: async (payload) => {
        console.log('Polar product created', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_PRODUCT_CREATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_PRODUCT_CREATED,
            });
        }
    },
    onProductUpdated: async (payload) => {
        console.log('Polar product updated', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_PRODUCT_UPDATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_PRODUCT_UPDATED,
            });
        }
    },
    onOrganizationUpdated: async (payload) => {
        console.log('Polar organization updated', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_ORGANIZATION_UPDATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_ORGANIZATION_UPDATED,
            });
        }
    },
    onBenefitCreated: async (payload) => {
        console.log('Polar benefit created', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_BENEFIT_CREATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_BENEFIT_CREATED,
            });
        }
    },
    onBenefitUpdated: async (payload) => {
        console.log('Polar benefit updated', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_BENEFIT_UPDATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_BENEFIT_UPDATED,
            });
        }
    },
    onBenefitGrantCreated: async (payload) => {
        console.log('Polar benefit grant created', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_BENEFIT_GRANT_CREATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_BENEFIT_GRANT_CREATED,
            });
        }
    },
    onBenefitGrantUpdated: async (payload) => {
        console.log('Polar benefit grant updated', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_BENEFIT_GRANT_UPDATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_BENEFIT_GRANT_UPDATED,
            });
        }
    },
    onBenefitGrantRevoked: async (payload) => {
        console.log('Polar benefit grant revoked', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_BENEFIT_GRANT_REVOKED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_BENEFIT_GRANT_REVOKED,
            });
        }
    },
    onCustomerCreated: async (payload) => {
        console.log('Polar customer created', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_CUSTOMER_CREATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_CUSTOMER_CREATED,
            });
        }
    },
    onCustomerUpdated: async (payload) => {
        console.log('Polar customer updated', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_CUSTOMER_UPDATED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_CUSTOMER_UPDATED,
            });
        }
    },
    onCustomerDeleted: async (payload) => {
        console.log('Polar customer deleted', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_CUSTOMER_DELETED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_CUSTOMER_DELETED,
            });
        }
    },
    onCustomerStateChanged: async (payload) => {
        console.log('Polar customer state changed', payload);
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_CUSTOMER_STATE_CHANGED,
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
            postHogClient?.captureException(error as Error, 'system', {
                context:
                    PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_CUSTOMER_STATE_CHANGED,
            });
        }
    },
});
