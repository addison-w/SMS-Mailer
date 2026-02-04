// android-manifest.plugin.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withSmsMailerPermissions(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Add receiver for SMS
    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }

    // Add intent filter for deep linking
    const mainActivity = mainApplication.activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
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
    }

    return config;
  });
};
