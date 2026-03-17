const axios = require('axios');
const { APPS } = require('./src/config/apps');

const targetApp = APPS['sbdh-pixels'];
const baseUrl = targetApp.api.baseUrl;
const ck = targetApp.api.consumerKey;
const cs = targetApp.api.consumerSecret;

async function test() {
    const email = 'test@example.com';
    
    // Trial 1: Exact URL I thought it was
    const url1 = `${baseUrl}/wp-json/wc/v3/ams-send-password-reset-link`;
    console.log(`Testing URL 1: ${url1}`);
    try {
        const res = await axios.post(url1, { email });
        console.log('URL 1 Success:', res.status);
    } catch (e) {
        console.log('URL 1 Failed:', e.response ? e.response.status : e.message);
    }

    // Trial 2: With Basic Auth
    console.log(`Testing URL 1 with Basic Auth...`);
    try {
        const res = await axios.post(url1, { email }, {
            auth: { username: ck, password: cs }
        });
        console.log('URL 1 + Auth Success:', res.status);
    } catch (e) {
        console.log('URL 1 + Auth Failed:', e.response ? e.response.status : e.message);
        if (e.response) console.log('Data:', e.response.data);
    }

    // Trial 3: Alternative path (/wp-json/ams-send-password-reset-link)?? unlikely
}

test();
