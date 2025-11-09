import { Polar } from '@polar-sh/sdk';
import 'dotenv/config';

export const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: 'sandbox',
});
