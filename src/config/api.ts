import axios from 'axios';

// ─────────────────────────────────────────────────
// ⚙️  CONFIGURATION — fill these in before first run
// ─────────────────────────────────────────────────
export const WC_CONFIG = {
    BASE_URL: 'https://sbdhcrafts.sbdhpixels.com', // e.g. https://mystore.com
    CONSUMER_KEY: 'ck_1a44719a2a46359537d99e0794a1a1eaded9b4e6',
    CONSUMER_SECRET: 'cs_eae5f3d7526a6f748fb23609099112f048b47520',
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
