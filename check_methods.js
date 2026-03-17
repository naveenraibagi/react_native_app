const axios = require('axios');
const { APPS } = require('./src/config/apps');

const targetApp = APPS['sbdh-pixels'];
const baseUrl = targetApp.api.baseUrl;

async function discover() {
    console.log(`Discovering methods for ${baseUrl}...`);
    try {
        const response = await axios.get(`${baseUrl}/wp-json/`, {
            timeout: 10000
        });
        
        const resetRoute = response.data.routes['/wc/v3/ams-send-password-reset-link'];
        console.log('Route Info:', JSON.stringify(resetRoute, null, 2));
        
    } catch (error) {
        console.error('Discovery failed:', error.message);
    }
}

discover();
