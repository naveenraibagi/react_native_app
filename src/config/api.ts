import axios from 'axios';
import { activeConfig } from './index';

// ─────────────────────────────────────────────────
// ⚙️  CONFIGURATION — dynamically loaded from apps.ts
// ─────────────────────────────────────────────────
export const WC_CONFIG = {
    BASE_URL: activeConfig.api.baseUrl,
    CONSUMER_KEY: activeConfig.api.consumerKey,
    CONSUMER_SECRET: activeConfig.api.consumerSecret,
    VERSION: 'wc/v3',
    JWT_AUTH_URL: '/wp-json/jwt-auth/v1/token',
    // Stripe publishable key (test or live)
    STRIPE_PUBLISHABLE_KEY: 'pk_test_YOUR_STRIPE_KEY',
};

// ─────────────────────────────────────────────────
// Axios instance – Basic Auth (works over HTTPS
// ─────────────────────────────────────────────────
export const wooApi = axios.create({
    baseURL: `${WC_CONFIG.BASE_URL}/wp-json/${WC_CONFIG.VERSION}`,
    auth: {
        username: WC_CONFIG.CONSUMER_KEY,
        password: WC_CONFIG.CONSUMER_SECRET,
    },
    timeout: 15000,
});

// ─────────────────────────────────────────────────
// WordPress / JWT Axios instance (for auth endpoints)
// ─────────────────────────────────────────────────
export const wpApi = axios.create({
    baseURL: `${WC_CONFIG.BASE_URL}/wp-json`,
    timeout: 15000,
});

export const setAuthHeader = (token: string) => {
    wpApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthHeader = () => {
    delete wpApi.defaults.headers.common['Authorization'];
};
