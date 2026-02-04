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
