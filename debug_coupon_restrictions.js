const axios = require('axios');
const fs = require('fs');

async function run() {
    const apps = require('./src/config/apps.js').APPS;
    const env = JSON.parse(fs.readFileSync('./app-env.json', 'utf8'));
    const config = apps[env.activeAppId];
    const auth = Buffer.from(`${config.api.consumerKey}:${config.api.consumerSecret}`).toString('base64');

    try {
        const { data: coupons } = await axios.get(`${config.api.baseUrl}/wp-json/wc/v3/coupons`, {
            headers: { Authorization: `Basic ${auth}` },
            params: { per_page: 5, status: 'publish' }
        });
        
        console.log(JSON.stringify(coupons.map(c => ({ 
            id: c.id, 
            code: c.code, 
            minimum_amount: c.minimum_amount,
            maximum_amount: c.maximum_amount,
            exclude_sale_items: c.exclude_sale_items,
            product_ids: c.product_ids,
            excluded_product_ids: c.excluded_product_ids,
            product_categories: c.product_categories,
            excluded_product_categories: c.excluded_product_categories,
            date_expires: c.date_expires
        })), null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
}
run();
