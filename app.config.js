const appEnv = require('./app-env.json');
const { APPS } = require('./src/config/apps.js');

const activeAppId = appEnv.activeAppId;
const activeConfig = APPS[activeAppId];

module.exports = ({ config }) => ({
  ...config,
  name: activeConfig.name,
  slug: activeConfig.slug,
  version: activeConfig.version,
  orientation: 'portrait',
  icon: activeConfig.assets.icon,
  userInterfaceStyle: 'automatic',
  splash: {
    ...(activeConfig.assets.splash && activeConfig.assets.splash.trim() !== '' ? { image: activeConfig.assets.splash } : {}),
    resizeMode: 'contain',
    backgroundColor: activeConfig.assets.splashBackgroundColor || '#FFFFFF',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: activeConfig.bundleIdentifier,
    infoPlist: {
      NSCameraUsageDescription: 'Used for profile photos.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: activeConfig.assets.adaptiveIconForeground,
      backgroundColor: activeConfig.assets.adaptiveIconBackground,
    },
    package: activeConfig.packageName,
    permissions: ['INTERNET', 'VIBRATE', 'POST_NOTIFICATIONS'],
  },
  web: {
    favicon: activeConfig.assets.favicon,
  },
  plugins: ['expo-video', 'expo-notifications'],
  extra: {
    eas: {
      projectId: activeConfig.eas.projectId,
    },
  },
});
