const APPS = {
    'sbdh-crafts': {
        id: 'sbdh-crafts',
        name: 'SBDH CRAFTS',
        slug: 'woocommerce-app',
        version: '1.0.0',
        packageName: 'com.sbdh.app',
        bundleIdentifier: 'com.sbdh.app',
        instagramHandle: 'sbdhcrafts',
        api: {
            baseUrl: 'https://sbdhcrafts.sbdhpixels.com',
            consumerKey: 'ck_1a44719a2a46359537d99e0794a1a1eaded9b4e6',
            consumerSecret: 'cs_eae5f3d7526a6f748fb23609099112f048b47520',
        },
        assets: {
            icon: './assets/apps/sbdh-crafts/icon.png',
            splash: './assets/apps/sbdh-crafts/splash-icon.png',
            favicon: './assets/apps/sbdh-crafts/favicon.png',
            adaptiveIconForeground: './assets/apps/sbdh-crafts/android-icon-foreground.png',
            adaptiveIconBackground: '#FFFFFF',
            splashBackgroundColor: '#FFFFFF',
        },
        eas: {
            projectId: '9e32bb57-7545-49c9-8c66-08ae0c1aad5b',
        },
    },
    'sbdh-pixels': {
        id: 'sbdh-pixels',
        name: 'SBDH PIXELS',
        slug: 'sbdh-pixels',
        version: '1.2.2',
        packageName: 'app.sbdhpixels.android',
        bundleIdentifier: 'app.sbdhpixels.android',
        instagramHandle: 'sbdhpixels',
        youtubeUrl: 'https://youtube.com/@sbdhpixels?si=jFxtSLHnO1jWRX3m',
        facebookUrl: 'https://www.facebook.com/share/18h3bhXYzW/',
        support: {
            whatsapp: ['9620494632'],
            phone: ['9620494632'],
            email: 'sales@sbdhpixels.com',
        },
        api: {
            baseUrl: 'https://sbdhpixels.com',
            consumerKey: 'ck_eea78479b0d75e5aaf7a9c205a56899bcfad2191',
            consumerSecret: 'cs_2a45dc3af9bbbd237d131ff7ba9616a876b4e1cb',
        },
        assets: {
            icon: './assets/apps/sbdh-pixels/icon.png',
            splash: './assets/apps/sbdh-pixels/user-logo.png',
            favicon: './assets/apps/sbdh-pixels/favicon.png',
            adaptiveIconForeground: './assets/apps/sbdh-pixels/adaptive-icon.png',
            adaptiveIconBackground: '#FFFFFF',
            splashBackgroundColor: '#000000',
        },
        eas: {
            projectId: '9e32bb57-7545-49c9-8c66-08ae0c1aad5b',
        },
    },
};

module.exports = { APPS };
