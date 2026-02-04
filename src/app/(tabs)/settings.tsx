// src/app/(tabs)/settings.tsx
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button, Input, Card, Select } from '@/components/ui';
import { useSettingsStore } from '@/stores/settings';
import { useThemeStore } from '@/stores/theme';
import { testConnection } from '@/services/email-sender';

const SECURITY_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'TLS (Port 587)', value: 'tls' },
  { label: 'SSL (Port 465)', value: 'ssl' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
  { value: 'system', label: 'System', icon: 'cellphone' },
] as const;

export default function SettingsScreen() {
  const theme = useAppTheme();
  const { smtp, setSmtp, savePassword, loadPassword, isConfigured } = useSettingsStore();
  const { colorScheme, setColorScheme } = useThemeStore();
  const [password, setPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPassword().then(setPassword);
  }, []);

  const handleSecurityChange = (security: string) => {
    setSmtp({ security: security as 'none' | 'tls' | 'ssl' });
    // Auto-set common ports
    if (security === 'ssl') {
      setSmtp({ port: '465' });
    } else if (security === 'tls') {
      setSmtp({ port: '587' });
    }
  };

  const handleTestConnection = async () => {
    if (!smtp.host || !smtp.username || !password || !smtp.toEmail) {
      Alert.alert('Error', 'Please fill in host, username, password, and recipient email');
      return;
    }

    setIsTesting(true);
    try {
      const result = await testConnection(smtp, password);
      if (result.success) {
        Alert.alert('Success', 'Test email sent successfully! Check your inbox.');
      } else {
        Alert.alert('Error', result.error || 'Connection failed. Please check your settings.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Please check your settings.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!smtp.host || !smtp.username || !password || !smtp.fromEmail || !smtp.toEmail) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await savePassword(password);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Theme Selection */}
          <Card title="APPEARANCE">
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              Choose your preferred color scheme
            </Text>
            <SegmentedButtons
              value={colorScheme}
              onValueChange={(value) => setColorScheme(value as 'light' | 'dark' | 'system')}
              buttons={THEME_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
                icon: opt.icon,
                accessibilityLabel: `${opt.label} theme`,
              }))}
              style={styles.segmentedButtons}
            />
          </Card>

          <Card title="SMTP SERVER" style={styles.card}>
            <Input
              label="Host"
              value={smtp.host}
              onChangeText={(text) => setSmtp({ host: text })}
              placeholder="smtp.example.com"
              autoCapitalize="none"
              keyboardType="url"
            />
            <Input
              label="Port"
              value={smtp.port}
              onChangeText={(text) => setSmtp({ port: text })}
              placeholder="587"
              keyboardType="number-pad"
            />
            <Select
              label="Security"
              value={smtp.security}
              options={SECURITY_OPTIONS}
              onValueChange={handleSecurityChange}
            />
          </Card>

          <Card title="AUTHENTICATION" style={styles.card}>
            <Input
              label="Username"
              value={smtp.username}
              onChangeText={(text) => setSmtp({ username: text })}
              placeholder="user@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
            />
          </Card>

          <Card title="EMAIL ADDRESSES" style={styles.card}>
            <Input
              label="From (Sender)"
              value={smtp.fromEmail}
              onChangeText={(text) => setSmtp({ fromEmail: text })}
              placeholder="noreply@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="To (Recipient)"
              value={smtp.toEmail}
              onChangeText={(text) => setSmtp({ toEmail: text })}
              placeholder="alerts@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Card>

          <View style={styles.buttons}>
            <Button
              title="Test Connection"
              onPress={handleTestConnection}
              variant="secondary"
              loading={isTesting}
              accessibilityLabel="Send test email to verify SMTP settings"
            />
            <Button
              title="Save Settings"
              onPress={handleSave}
              loading={isSaving}
              style={styles.saveButton}
              accessibilityLabel="Save SMTP configuration"
            />
          </View>

          {isConfigured && (
            <Card title="EMAIL PREVIEW" style={styles.card} mode="outlined">
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface, marginBottom: 8 }}
              >
                Subject: SMS from +61412345678
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.previewBody, { color: theme.colors.onSurfaceVariant }]}
              >
                From: +61412345678{'\n'}
                To: +61498765432 (SIM 1){'\n'}
                Time: {new Date().toLocaleString()}{'\n'}
                {'\n'}
                Message:{'\n'}
                [SMS content will appear here]
              </Text>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginTop: 16,
  },
  segmentedButtons: {
    marginTop: 4,
  },
  buttons: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    marginTop: 4,
  },
  previewBody: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
});
