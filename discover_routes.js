const axios = require('axios');
const fs = require('fs');

async function discoverRoutes() {
    const apps = require('./src/config/apps.js').APPS;
    const env = JSON.parse(fs.readFileSync('./app-env.json', 'utf8'));
    const config = apps[env.activeAppId];
    
    console.log(`Checking app: ${config.name} at ${config.api.baseUrl}`);
    
    try {
        const res = await axios.get(`${config.api.baseUrl}/wp-json/`);
        const routes = Object.keys(res.data.routes);
        
        console.log('\n--- DISCOVERED ROUTES (relevant to password/auth) ---');
        const relevant = routes.filter(r => 
            r.toLowerCase().includes('password') || 
            r.toLowerCase().includes('auth') || 
            r.toLowerCase().includes('user') ||
            r.toLowerCase().includes('login')
        );
        console.log(relevant);

        if (relevant.length === 0) {
            console.log('No obviously relevant routes found. Showing first 20 routes:');
            console.log(routes.slice(0, 20));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

discoverRoutes();
