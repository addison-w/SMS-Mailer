// src/app/(tabs)/settings.tsx
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { colors } from '@/theme/colors';
import { Button, Input, Card, Select } from '@/components/ui';
import { useSettingsStore } from '@/stores/settings';
import { testConnection } from '@/services/email-sender';

const SECURITY_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'TLS (Port 587)', value: 'tls' },
  { label: 'SSL (Port 465)', value: 'ssl' },
];

export default function SettingsScreen() {
  const { smtp, setSmtp, savePassword, loadPassword, isConfigured } = useSettingsStore();
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Card title="SMTP Server">
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

          <Card title="Authentication" style={styles.card}>
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
              placeholder="••••••••"
              secureTextEntry
            />
          </Card>

          <Card title="Email Addresses" style={styles.card}>
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
            />
            <Button
              title="Save Settings"
              onPress={handleSave}
              loading={isSaving}
              style={styles.saveButton}
            />
          </View>

          {isConfigured && (
            <Card title="Email Preview" style={styles.card}>
              <Text style={styles.previewSubject}>Subject: SMS from +61412345678</Text>
              <Text style={styles.previewBody}>
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
    backgroundColor: colors.background,
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
  buttons: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    marginTop: 4,
  },
  previewSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  previewBody: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
});
