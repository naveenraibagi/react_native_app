const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function run() {
    const apps = require('./src/config/apps.js').APPS;
    const env = JSON.parse(fs.readFileSync('./app-env.json', 'utf8'));
    const config = apps[env.activeAppId];

    const auth = Buffer.from(`${config.api.consumerKey}:${config.api.consumerSecret}`).toString('base64');
    
    console.log(`Checking app: ${config.name}`);

    try {
        console.log('\n--- FETCHING CATEGORIES ---');
        const catRes = await axios.get(`${config.api.baseUrl}/wp-json/wc/v3/products/categories`, {
            headers: { Authorization: `Basic ${auth}` },
            params: { per_page: 100 }
        });
        console.log(catRes.data.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

        console.log('\n--- FETCHING COUPONS ---');
        const coupRes = await axios.get(`${config.api.baseUrl}/wp-json/wc/v3/coupons`, {
            headers: { Authorization: `Basic ${auth}` },
            params: { per_page: 5, status: 'publish' }
        });
        console.log(coupRes.data.map(c => ({ 
            id: c.id, 
            code: c.code, 
            amount: c.amount, 
            minimum_amount: c.minimum_amount,
            maximum_amount: c.maximum_amount,
            product_ids: c.product_ids,
            product_categories: c.product_categories,
            exclude_sale_items: c.exclude_sale_items,
            description: c.description 
        })));

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

run();
