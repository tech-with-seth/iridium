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
