const axios = require('axios');

const baseURL = 'https://sbdhpixels.com/wp-json/wc/v3';
const instance = axios.create({ baseURL });

// Mocking the behavior to see the final URL without actually making a request that might be blocked or fail
instance.interceptors.request.use(config => {
    console.log(`Final URL: ${config.baseURL}${config.url} ??? No, let's see actual request config:`);
    return config;
});

async function test() {
    try {
        // We can use a non-existent endpoint but just look at the error to see where it tried to go
        await instance.get('/test-url-resolution');
    } catch (e) {
        if (e.config) {
            console.log('Requested URL:', e.config.url);
            console.log('Base URL:', e.config.baseURL);
            // In modern axios, the final URL is combined internally
            // Let's use getUri() if available
            if (instance.getUri) {
                console.log('Combined URI:', instance.getUri(e.config));
            }
        }
    }
}

test();
