import { Checkout } from '@polar-sh/remix';

export const loader = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN, // Or set an environment variable to POLAR_ACCESS_TOKEN
    successUrl: process.env.SUCCESS_URL,
    server: 'sandbox', // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
});
