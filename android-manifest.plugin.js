// android-manifest.plugin.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withSmsMailerPermissions(config) {
  return withAndroidManifest(config, async (config) => {
    try {
      const androidManifest = config.modResults;

      // Validate manifest structure
      if (!androidManifest.manifest.application?.[0]) {
        console.warn('SMS Mailer plugin: No application element found in AndroidManifest');
        return config;
      }

      const mainApplication = androidManifest.manifest.application[0];

      // Add FOREGROUND_SERVICE_DATA_SYNC permission for Android 14+
      if (!androidManifest.manifest['uses-permission']) {
        androidManifest.manifest['uses-permission'] = [];
      }

      const hasForegroundServiceDataSync = androidManifest.manifest['uses-permission'].some(
        (perm) => perm.$?.['android:name'] === 'android.permission.FOREGROUND_SERVICE_DATA_SYNC'
      );

      if (!hasForegroundServiceDataSync) {
        androidManifest.manifest['uses-permission'].push({
          $: { 'android:name': 'android.permission.FOREGROUND_SERVICE_DATA_SYNC' },
        });
      }

      // Add/update RNBackgroundActionsTask service with foregroundServiceType
      if (!mainApplication.service) {
        mainApplication.service = [];
      }

      const bgActionsService = mainApplication.service.find(
        (service) => service.$?.['android:name'] === 'com.asterinet.react.bgactions.RNBackgroundActionsTask'
      );

      if (bgActionsService) {
        // Update existing service declaration
        bgActionsService.$['android:foregroundServiceType'] = 'dataSync';
      } else {
        // Add new service declaration
        mainApplication.service.push({
          $: {
            'android:name': 'com.asterinet.react.bgactions.RNBackgroundActionsTask',
            'android:foregroundServiceType': 'dataSync',
          },
        });
      }

      // Add intent filter for deep linking
      if (!mainApplication.activity) {
        console.warn('SMS Mailer plugin: No activity array found');
        return config;
      }

      const mainActivity = mainApplication.activity.find(
        (activity) => activity.$['android:name'] === '.MainActivity'
      );

      if (!mainActivity) {
        console.warn('SMS Mailer plugin: MainActivity not found');
        return config;
      }

      if (!mainActivity['intent-filter']) {
        mainActivity['intent-filter'] = [];
      }

      mainActivity['intent-filter'].push({
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
          { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
        ],
        data: [{ $: { 'android:scheme': 'smsmailer' } }],
      });

      return config;
    } catch (error) {
      console.warn('SMS Mailer plugin error:', error.message);
      return config;
    }
  });
};
