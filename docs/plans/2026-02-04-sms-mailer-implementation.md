# SMS Mailer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an Android app that forwards received SMS messages to a configured email address via SMTP.

**Architecture:** Expo Router for navigation with 3 tabs (Status, Settings, History). Background SMS listener using `@maniac-tech/react-native-expo-read-sms` with foreground service via `react-native-background-actions`. SMTP sending via `react-native-smtp-mailer`. Zustand for state management with AsyncStorage persistence.

**Tech Stack:** Expo SDK 54, React Native 0.81, expo-router, zustand, react-native-background-actions, @maniac-tech/react-native-expo-read-sms, react-native-smtp-mailer, expo-secure-store

---

## Phase 1: Project Setup & Dependencies

### Task 1: Configure TypeScript Path Aliases

**Files:**
- Modify: `tsconfig.json`

**Step 1: Update tsconfig.json with path aliases**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

**Step 2: Commit**

```bash
git add tsconfig.json
git commit -m "chore: configure TypeScript path aliases"
```

---

### Task 2: Install Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install navigation and state management**

Run:
```bash
npx expo install @react-native-async-storage/async-storage expo-secure-store zustand
```

**Step 2: Install UI dependencies**

Run:
```bash
npx expo install expo-linking expo-notifications
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add core dependencies (storage, state, notifications)"
```

---

### Task 3: Install Native SMS and Background Dependencies

**Files:**
- Modify: `package.json`
- Modify: `app.json`

**Step 1: Install SMS reading library**

Run:
```bash
npm install @maniac-tech/react-native-expo-read-sms --save
```

**Step 2: Install background actions library**

Run:
```bash
npm install react-native-background-actions --save
```

**Step 3: Install SMTP mailer**

Run:
```bash
npm install react-native-smtp-mailer --save
```

**Step 4: Update app.json with Android permissions**

Update `app.json`:
```json
{
  "expo": {
    "name": "sms-mailer",
    "slug": "sms-mailer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "newArchEnabled": false,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0D0D0D"
    },
    "ios": {
      "supportsTablet": false
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0D0D0D"
      },
      "package": "com.smsmailer.app",
      "permissions": [
        "android.permission.READ_SMS",
        "android.permission.RECEIVE_SMS",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.WAKE_LOCK",
        "android.permission.POST_NOTIFICATIONS"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ]
  }
}
```

**Step 5: Commit**

```bash
git add package.json package-lock.json app.json
git commit -m "chore: add SMS, background, and SMTP native dependencies"
```

---

## Phase 2: Theme & Type Definitions

### Task 4: Create Theme Constants

**Files:**
- Create: `src/theme/colors.ts`

**Step 1: Create theme directory and colors file**

```typescript
// src/theme/colors.ts
export const colors = {
  // Background
  background: '#0D0D0D',
  surface: '#1A1A1A',
  elevated: '#262626',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#666666',

  // Accent
  primary: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  // Border
  border: '#333333',
  borderFocus: '#3B82F6',
} as const;

export type Colors = typeof colors;
```

**Step 2: Commit**

```bash
git add src/theme/colors.ts
git commit -m "feat: add dark theme color palette"
```

---

### Task 5: Create Type Definitions

**Files:**
- Create: `src/types/index.ts`

**Step 1: Create types file**

```typescript
// src/types/index.ts

// SMTP Configuration
export interface SmtpConfig {
  host: string;
  port: string;
  security: 'none' | 'tls' | 'ssl';
  username: string;
  password: string;
  fromEmail: string;
  toEmail: string;
}

// SMS Message
export interface SmsMessage {
  id: string;
  sender: string;
  body: string;
  timestamp: number;
  simSlot: number;
  receiverNumber: string;
}

// Queue Item
export interface QueueItem {
  id: string;
  sms: SmsMessage;
  status: 'pending' | 'failed';
  attempts: number;
  lastAttempt: number;
  nextRetry: number;
  error?: string;
}

// Permission Status
export interface PermissionStatus {
  sms: boolean;
  notifications: boolean;
  batteryOptimization: boolean;
}

// Service Status
export interface ServiceStatus {
  isRunning: boolean;
  startedAt: number | null;
}

// History Stats
export interface HistoryStats {
  totalForwarded: number;
  pending: QueueItem[];
  failed: QueueItem[];
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Phase 3: State Management

### Task 6: Create Settings Store

**Files:**
- Create: `src/stores/settings.ts`

**Step 1: Create settings store with persistence**

```typescript
// src/stores/settings.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { SmtpConfig } from '@/types';

interface SettingsState {
  smtp: SmtpConfig;
  isConfigured: boolean;
  setSmtp: (config: Partial<SmtpConfig>) => void;
  savePassword: (password: string) => Promise<void>;
  loadPassword: () => Promise<string>;
  clearSettings: () => void;
}

const defaultSmtp: SmtpConfig = {
  host: '',
  port: '587',
  security: 'tls',
  username: '',
  password: '',
  fromEmail: '',
  toEmail: '',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      smtp: defaultSmtp,
      isConfigured: false,

      setSmtp: (config) => {
        set((state) => {
          const newSmtp = { ...state.smtp, ...config };
          const isConfigured = Boolean(
            newSmtp.host &&
            newSmtp.port &&
            newSmtp.username &&
            newSmtp.fromEmail &&
            newSmtp.toEmail
          );
          return { smtp: newSmtp, isConfigured };
        });
      },

      savePassword: async (password) => {
        await SecureStore.setItemAsync('smtp_password', password);
        set((state) => ({
          smtp: { ...state.smtp, password: '••••••••' },
        }));
      },

      loadPassword: async () => {
        const password = await SecureStore.getItemAsync('smtp_password');
        return password || '';
      },

      clearSettings: () => {
        SecureStore.deleteItemAsync('smtp_password');
        set({ smtp: defaultSmtp, isConfigured: false });
      },
    }),
    {
      name: 'sms-mailer-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        smtp: { ...state.smtp, password: '' },
        isConfigured: state.isConfigured,
      }),
    }
  )
);
```

**Step 2: Commit**

```bash
git add src/stores/settings.ts
git commit -m "feat: add settings store with secure password storage"
```

---

### Task 7: Create History Store

**Files:**
- Create: `src/stores/history.ts`

**Step 1: Create history store**

```typescript
// src/stores/history.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QueueItem, SmsMessage } from '@/types';

interface HistoryState {
  totalForwarded: number;
  queue: QueueItem[];

  addToQueue: (sms: SmsMessage) => void;
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
  removeFromQueue: (id: string) => void;
  markAsForwarded: (id: string) => void;
  markAsFailed: (id: string, error: string) => void;
  retryItem: (id: string) => void;
  clearFailed: () => void;
  getPending: () => QueueItem[];
  getFailed: () => QueueItem[];
  getNextRetry: () => QueueItem | null;
}

const RETRY_DELAYS = [0, 30000, 120000]; // immediate, 30s, 2min
const MAX_ATTEMPTS = 3;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      totalForwarded: 0,
      queue: [],

      addToQueue: (sms) => {
        const item: QueueItem = {
          id: sms.id,
          sms,
          status: 'pending',
          attempts: 0,
          lastAttempt: 0,
          nextRetry: Date.now(),
        };
        set((state) => ({ queue: [...state.queue, item] }));
      },

      updateQueueItem: (id, updates) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        }));
      },

      markAsForwarded: (id) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
          totalForwarded: state.totalForwarded + 1,
        }));
      },

      markAsFailed: (id, error) => {
        set((state) => ({
          queue: state.queue.map((item) => {
            if (item.id !== id) return item;

            const attempts = item.attempts + 1;
            if (attempts >= MAX_ATTEMPTS) {
              return { ...item, status: 'failed', attempts, error };
            }

            const nextRetry = Date.now() + RETRY_DELAYS[attempts];
            return { ...item, attempts, lastAttempt: Date.now(), nextRetry, error };
          }),
        }));
      },

      retryItem: (id) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id
              ? { ...item, status: 'pending', attempts: 0, nextRetry: Date.now(), error: undefined }
              : item
          ),
        }));
      },

      clearFailed: () => {
        set((state) => ({
          queue: state.queue.filter((item) => item.status !== 'failed'),
        }));
      },

      getPending: () => get().queue.filter((item) => item.status === 'pending'),

      getFailed: () => get().queue.filter((item) => item.status === 'failed'),

      getNextRetry: () => {
        const pending = get().getPending();
        const ready = pending.filter((item) => item.nextRetry <= Date.now());
        return ready.sort((a, b) => a.nextRetry - b.nextRetry)[0] || null;
      },
    }),
    {
      name: 'sms-mailer-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Step 2: Commit**

```bash
git add src/stores/history.ts
git commit -m "feat: add history store with retry queue management"
```

---

### Task 8: Create Service Store

**Files:**
- Create: `src/stores/service.ts`

**Step 1: Create service status store**

```typescript
// src/stores/service.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ServiceState {
  isRunning: boolean;
  startedAt: number | null;
  setRunning: (running: boolean) => void;
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set) => ({
      isRunning: false,
      startedAt: null,

      setRunning: (running) => {
        set({
          isRunning: running,
          startedAt: running ? Date.now() : null,
        });
      },
    }),
    {
      name: 'sms-mailer-service',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Step 2: Commit**

```bash
git add src/stores/service.ts
git commit -m "feat: add service status store"
```

---

## Phase 4: UI Components

### Task 9: Create Base UI Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/index.ts`

**Step 1: Create Button component**

```typescript
// src/components/ui/Button.tsx
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.textPrimary} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.textPrimary,
  },
  secondaryText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.textPrimary,
  },
});
```

**Step 2: Create Input component**

```typescript
// src/components/ui/Input.tsx
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '@/theme/colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
```

**Step 3: Create Card component**

```typescript
// src/components/ui/Card.tsx
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ title, children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
```

**Step 4: Create index export**

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
```

**Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add base UI components (Button, Input, Card)"
```

---

### Task 10: Create Select Component

**Files:**
- Create: `src/components/ui/Select.tsx`
- Modify: `src/components/ui/index.ts`

**Step 1: Create Select component**

```typescript
// src/components/ui/Select.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { colors } from '@/theme/colors';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
}

export function Select({ label, value, options, onValueChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.select}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.selectText}>{selectedOption?.label || 'Select...'}</Text>
        <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
      </Pressable>
      {isOpen && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                option.value === value && styles.optionSelected,
              ]}
              onPress={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  option.value === value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  select: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  arrow: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionSelected: {
    backgroundColor: colors.primary + '20',
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.primary,
  },
});
```

**Step 2: Update index export**

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
export { Select } from './Select';
```

**Step 3: Commit**

```bash
git add src/components/ui/Select.tsx src/components/ui/index.ts
git commit -m "feat: add Select dropdown component"
```

---

### Task 11: Create Permission Card Component

**Files:**
- Create: `src/components/features/PermissionCard.tsx`

**Step 1: Create PermissionCard component**

```typescript
// src/components/features/PermissionCard.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/theme/colors';

interface PermissionCardProps {
  title: string;
  granted: boolean;
  onRequestPermission?: () => void;
  actionLabel?: string;
}

export function PermissionCard({
  title,
  granted,
  onRequestPermission,
  actionLabel = 'Enable',
}: PermissionCardProps) {
  return (
    <View style={[styles.card, granted ? styles.cardGranted : styles.cardDenied]}>
      <View style={styles.row}>
        <Text style={styles.icon}>{granted ? '✓' : '✗'}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {!granted && onRequestPermission && (
        <Pressable style={styles.button} onPress={onRequestPermission}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGranted: {
    borderColor: colors.success + '40',
  },
  cardDenied: {
    borderColor: colors.error + '40',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
```

**Step 2: Commit**

```bash
git add src/components/features/PermissionCard.tsx
git commit -m "feat: add PermissionCard component"
```

---

### Task 12: Create Queue Item Component

**Files:**
- Create: `src/components/features/QueueItemCard.tsx`

**Step 1: Create QueueItemCard component**

```typescript
// src/components/features/QueueItemCard.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { colors } from '@/theme/colors';
import type { QueueItem } from '@/types';

interface QueueItemCardProps {
  item: QueueItem;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function QueueItemCard({ item, onRetry, onDismiss }: QueueItemCardProps) {
  const [countdown, setCountdown] = useState(0);
  const isPending = item.status === 'pending';

  useEffect(() => {
    if (!isPending) return;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((item.nextRetry - Date.now()) / 1000));
      setCountdown(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [item.nextRetry, isPending]);

  const truncatedBody = item.sms.body.length > 30
    ? item.sms.body.substring(0, 30) + '...'
    : item.sms.body;

  return (
    <View style={[styles.card, isPending ? styles.cardPending : styles.cardFailed]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{isPending ? '⏳' : '✗'}</Text>
        <Text style={styles.sender}>{item.sms.sender}</Text>
      </View>
      <Text style={styles.body}>"{truncatedBody}"</Text>
      {isPending ? (
        <Text style={styles.status}>
          {countdown > 0 ? `Retry in ${countdown}s` : 'Retrying...'}
        </Text>
      ) : (
        <>
          <Text style={styles.error}>{item.error}</Text>
          <Text style={styles.status}>{item.attempts} retries exhausted</Text>
          <View style={styles.actions}>
            {onRetry && (
              <Pressable style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            )}
            {onDismiss && (
              <Pressable style={styles.dismissButton} onPress={onDismiss}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardPending: {
    borderColor: colors.warning + '40',
  },
  cardFailed: {
    borderColor: colors.error + '40',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  status: {
    fontSize: 12,
    color: colors.textMuted,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dismissText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
```

**Step 2: Commit**

```bash
git add src/components/features/QueueItemCard.tsx
git commit -m "feat: add QueueItemCard component for history display"
```

---

## Phase 5: Navigation Setup

### Task 13: Set Up Expo Router with Tabs

**Files:**
- Create: `src/app/_layout.tsx`
- Create: `src/app/(tabs)/_layout.tsx`
- Create: `src/app/(tabs)/index.tsx`
- Create: `src/app/(tabs)/settings.tsx`
- Create: `src/app/(tabs)/history.tsx`
- Delete: `App.tsx`
- Modify: `index.ts`

**Step 1: Create root layout**

```typescript
// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
```

**Step 2: Create tabs layout**

```typescript
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '●',
    settings: '⚙',
    history: '☰',
  };
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[name] || '○'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Status',
          headerTitle: 'SMS Mailer',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon name="history" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
    color: colors.textMuted,
  },
  iconFocused: {
    color: colors.primary,
  },
});
```

**Step 3: Create placeholder Status screen**

```typescript
// src/app/(tabs)/index.tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

export default function StatusScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.text}>Status Screen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 18,
  },
});
```

**Step 4: Create placeholder Settings screen**

```typescript
// src/app/(tabs)/settings.tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.text}>Settings Screen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 18,
  },
});
```

**Step 5: Create placeholder History screen**

```typescript
// src/app/(tabs)/history.tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.text}>History Screen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 18,
  },
});
```

**Step 6: Update index.ts entry point**

```typescript
// index.ts
import 'expo-router/entry';
```

**Step 7: Delete old App.tsx**

Run:
```bash
rm App.tsx
```

**Step 8: Update package.json main entry**

In `package.json`, change:
```json
"main": "index.ts"
```
to:
```json
"main": "expo-router/entry"
```

**Step 9: Verify app runs**

Run:
```bash
npx expo start
```
Expected: App starts with 3 tabs visible

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: set up Expo Router with tab navigation"
```

---

## Phase 6: Settings Screen Implementation

### Task 14: Implement Settings Form

**Files:**
- Modify: `src/app/(tabs)/settings.tsx`

**Step 1: Implement full settings screen**

```typescript
// src/app/(tabs)/settings.tsx
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { colors } from '@/theme/colors';
import { Button, Input, Card, Select } from '@/components/ui';
import { useSettingsStore } from '@/stores/settings';

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
    if (!smtp.host || !smtp.username || !password) {
      Alert.alert('Error', 'Please fill in host, username, and password');
      return;
    }

    setIsTesting(true);
    try {
      // TODO: Implement actual SMTP test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Connection test successful!');
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
```

**Step 2: Commit**

```bash
git add src/app/\(tabs\)/settings.tsx
git commit -m "feat: implement Settings screen with SMTP form"
```

---

## Phase 7: Permissions Hook

### Task 15: Create Permissions Hook

**Files:**
- Create: `src/hooks/usePermissions.ts`

**Step 1: Create permissions hook**

```typescript
// src/hooks/usePermissions.ts
import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { PermissionStatus } from '@/types';

// Note: SMS permissions need to be checked via native module
// This is a simplified version - full implementation requires native code

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    sms: false,
    notifications: false,
    batteryOptimization: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check notification permission
      const { status: notifStatus } = await Notifications.getPermissionsAsync();

      // SMS permissions will be checked via native module
      // For now, we'll set a placeholder
      const smsGranted = false; // TODO: Check via @maniac-tech/react-native-expo-read-sms

      // Battery optimization - Android only
      const batteryOptDisabled = false; // TODO: Check via native module

      setPermissions({
        sms: smsGranted,
        notifications: notifStatus === 'granted',
        batteryOptimization: batteryOptDisabled,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setPermissions((prev) => ({ ...prev, notifications: true }));
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const requestSmsPermission = async () => {
    // TODO: Implement via @maniac-tech/react-native-expo-read-sms
    // For now, direct to settings
    Alert.alert(
      'SMS Permission Required',
      'Please grant SMS permissions in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const requestBatteryOptimization = async () => {
    if (Platform.OS !== 'android') return;

    // Open battery optimization settings
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert('Error', 'Unable to open settings');
    }
  };

  return {
    permissions,
    isLoading,
    checkPermissions,
    requestNotifications,
    requestSmsPermission,
    requestBatteryOptimization,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/usePermissions.ts
git commit -m "feat: add usePermissions hook for permission management"
```

---

## Phase 8: Status Screen Implementation

### Task 16: Implement Status Screen

**Files:**
- Modify: `src/app/(tabs)/index.tsx`

**Step 1: Implement full status screen**

```typescript
// src/app/(tabs)/index.tsx
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { Card, Button } from '@/components/ui';
import { PermissionCard } from '@/components/features/PermissionCard';
import { usePermissions } from '@/hooks/usePermissions';
import { useServiceStore } from '@/stores/service';
import { useHistoryStore } from '@/stores/history';
import { useSettingsStore } from '@/stores/settings';

export default function StatusScreen() {
  const router = useRouter();
  const { isRunning, setRunning } = useServiceStore();
  const { isConfigured } = useSettingsStore();
  const { getPending, getFailed } = useHistoryStore();
  const {
    permissions,
    isLoading,
    requestSmsPermission,
    requestNotifications,
    requestBatteryOptimization,
  } = usePermissions();

  const pendingCount = getPending().length;
  const failedCount = getFailed().length;

  const handleToggleService = () => {
    if (!isConfigured) {
      router.push('/settings');
      return;
    }
    // TODO: Actually start/stop the background service
    setRunning(!isRunning);
  };

  const allPermissionsGranted =
    permissions.sms && permissions.notifications && permissions.batteryOptimization;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Service Status */}
        <Card>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>SERVICE STATUS</Text>
            <View style={[styles.statusBadge, isRunning ? styles.statusRunning : styles.statusStopped]}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusText}>{isRunning ? 'Running' : 'Stopped'}</Text>
            </View>
          </View>
          <Button
            title={isRunning ? 'Stop Service' : (isConfigured ? 'Start Service' : 'Configure Settings')}
            onPress={handleToggleService}
            variant={isRunning ? 'danger' : 'primary'}
            disabled={!allPermissionsGranted && isConfigured}
          />
          {!isConfigured && (
            <Text style={styles.hint}>Configure SMTP settings to start the service</Text>
          )}
          {isConfigured && !allPermissionsGranted && (
            <Text style={styles.hint}>Grant all permissions to start the service</Text>
          )}
        </Card>

        {/* Permissions */}
        <Text style={styles.sectionTitle}>PERMISSIONS</Text>

        <PermissionCard
          title="SMS Permission"
          granted={permissions.sms}
          onRequestPermission={requestSmsPermission}
          actionLabel="Grant"
        />

        <PermissionCard
          title="Notification Access"
          granted={permissions.notifications}
          onRequestPermission={requestNotifications}
          actionLabel="Enable"
        />

        <PermissionCard
          title="Battery Optimization"
          granted={permissions.batteryOptimization}
          onRequestPermission={requestBatteryOptimization}
          actionLabel="Disable"
        />

        {/* Quick Stats */}
        <Card title="QUICK STATS" style={styles.statsCard}>
          <Pressable style={styles.statsRow} onPress={() => router.push('/history')}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, failedCount > 0 && styles.statError]}>
                {failedCount}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusRunning: {
    backgroundColor: colors.success + '20',
  },
  statusStopped: {
    backgroundColor: colors.textMuted + '20',
  },
  statusDot: {
    fontSize: 10,
    color: colors.success,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 12,
  },
  statsCard: {
    marginTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statError: {
    color: colors.error,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
```

**Step 2: Commit**

```bash
git add src/app/\(tabs\)/index.tsx
git commit -m "feat: implement Status screen with service toggle and permissions"
```

---

## Phase 9: History Screen Implementation

### Task 17: Implement History Screen

**Files:**
- Modify: `src/app/(tabs)/history.tsx`

**Step 1: Implement full history screen**

```typescript
// src/app/(tabs)/history.tsx
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Card, Button } from '@/components/ui';
import { QueueItemCard } from '@/components/features/QueueItemCard';
import { useHistoryStore } from '@/stores/history';

export default function HistoryScreen() {
  const {
    totalForwarded,
    getPending,
    getFailed,
    retryItem,
    removeFromQueue,
    clearFailed,
  } = useHistoryStore();

  const pending = getPending();
  const failed = getFailed();
  const hasItems = pending.length > 0 || failed.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {!hasItems ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptySubtitle}>
              No pending or failed messages
            </Text>
            <Text style={styles.successCount}>
              {totalForwarded} forwarded successfully
            </Text>
          </View>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>PENDING ({pending.length})</Text>
                {pending.map((item) => (
                  <QueueItemCard key={item.id} item={item} />
                ))}
              </>
            )}

            {failed.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>FAILED ({failed.length})</Text>
                {failed.map((item) => (
                  <QueueItemCard
                    key={item.id}
                    item={item}
                    onRetry={() => retryItem(item.id)}
                    onDismiss={() => removeFromQueue(item.id)}
                  />
                ))}
                <Button
                  title="Clear All Failed"
                  onPress={clearFailed}
                  variant="secondary"
                  style={styles.clearButton}
                />
              </>
            )}

            <View style={styles.divider} />
            <Text style={styles.successText}>
              ✓ {totalForwarded} messages forwarded successfully
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.success,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  successCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  successText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
```

**Step 2: Commit**

```bash
git add src/app/\(tabs\)/history.tsx
git commit -m "feat: implement History screen with pending/failed items"
```

---

## Phase 10: Email Service

### Task 18: Create Email Sender Service

**Files:**
- Create: `src/services/email-sender.ts`

**Step 1: Create email sender service**

```typescript
// src/services/email-sender.ts
import RNSmtpMailer from 'react-native-smtp-mailer';
import type { SmtpConfig, SmsMessage } from '@/types';

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

function formatEmailBody(sms: SmsMessage): string {
  const date = new Date(sms.timestamp);
  const formattedDate = date.toLocaleString();
  const simLabel = sms.simSlot === 0 ? 'SIM 1' : 'SIM 2';

  return `
From: ${sms.sender}
To: ${sms.receiverNumber} (${simLabel})
Time: ${formattedDate}

Message:
${sms.body}
  `.trim();
}

export async function sendEmail(
  config: SmtpConfig,
  password: string,
  sms: SmsMessage
): Promise<SendEmailResult> {
  try {
    const subject = `SMS from ${sms.sender}`;
    const body = formatEmailBody(sms);

    await RNSmtpMailer.sendMail({
      mailhost: config.host,
      port: config.port,
      ssl: config.security === 'ssl',
      username: config.username,
      password: password,
      fromName: 'SMS Mailer',
      replyTo: config.fromEmail,
      recipients: config.toEmail,
      subject: subject,
      htmlBody: `<pre style="font-family: monospace;">${body}</pre>`,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function testConnection(
  config: SmtpConfig,
  password: string
): Promise<SendEmailResult> {
  try {
    await RNSmtpMailer.sendMail({
      mailhost: config.host,
      port: config.port,
      ssl: config.security === 'ssl',
      username: config.username,
      password: password,
      fromName: 'SMS Mailer',
      replyTo: config.fromEmail,
      recipients: config.toEmail,
      subject: 'SMS Mailer - Test Connection',
      htmlBody: '<p>This is a test email from SMS Mailer. Your SMTP settings are working correctly!</p>',
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
```

**Step 2: Commit**

```bash
git add src/services/email-sender.ts
git commit -m "feat: add email sender service with SMTP support"
```

---

### Task 19: Update Settings Screen with Real Email Test

**Files:**
- Modify: `src/app/(tabs)/settings.tsx`

**Step 1: Add real email test functionality**

In `src/app/(tabs)/settings.tsx`, update the `handleTestConnection` function:

Find:
```typescript
  const handleTestConnection = async () => {
    if (!smtp.host || !smtp.username || !password) {
      Alert.alert('Error', 'Please fill in host, username, and password');
      return;
    }

    setIsTesting(true);
    try {
      // TODO: Implement actual SMTP test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Connection test successful!');
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Please check your settings.');
    } finally {
      setIsTesting(false);
    }
  };
```

Replace with:
```typescript
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
```

Also add the import at the top:
```typescript
import { testConnection } from '@/services/email-sender';
```

**Step 2: Commit**

```bash
git add src/app/\(tabs\)/settings.tsx
git commit -m "feat: integrate real SMTP test in Settings screen"
```

---

## Phase 11: SMS Listener Service

### Task 20: Create SMS Listener Service

**Files:**
- Create: `src/services/sms-listener.ts`

**Step 1: Create SMS listener service**

```typescript
// src/services/sms-listener.ts
import {
  checkIfHasSMSPermission,
  requestReadSMSPermission,
  startReadSMS,
} from '@maniac-tech/react-native-expo-read-sms';
import type { SmsMessage } from '@/types';

export interface SmsPermissionStatus {
  hasReceiveSmsPermission: boolean;
  hasReadSmsPermission: boolean;
}

export async function checkSmsPermissions(): Promise<SmsPermissionStatus> {
  try {
    const result = await checkIfHasSMSPermission();
    return result;
  } catch (error) {
    console.error('Error checking SMS permissions:', error);
    return {
      hasReceiveSmsPermission: false,
      hasReadSmsPermission: false,
    };
  }
}

export async function requestSmsPermissions(): Promise<boolean> {
  try {
    const granted = await requestReadSMSPermission();
    return granted;
  } catch (error) {
    console.error('Error requesting SMS permissions:', error);
    return false;
  }
}

let smsListenerActive = false;

export function startSmsListener(
  onSmsReceived: (sms: SmsMessage) => void
): void {
  if (smsListenerActive) {
    console.log('SMS listener already active');
    return;
  }

  smsListenerActive = true;

  startReadSMS(
    (status: string, smsData: string) => {
      try {
        // smsData format: "[+919999999999, this is a sample message body]"
        const match = smsData.match(/\[(.+?),\s*(.+)\]/);
        if (match) {
          const sender = match[1];
          const body = match[2];

          const sms: SmsMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender,
            body,
            timestamp: Date.now(),
            simSlot: 0, // TODO: Get actual SIM slot if available
            receiverNumber: 'Unknown', // TODO: Get actual receiver number
          };

          onSmsReceived(sms);
        }
      } catch (error) {
        console.error('Error parsing SMS:', error);
      }
    },
    (error: string) => {
      console.error('SMS listener error:', error);
      smsListenerActive = false;
    }
  );
}

export function stopSmsListener(): void {
  smsListenerActive = false;
  // Note: The library doesn't provide a stop method
  // The listener will be cleaned up when the app closes
}
```

**Step 2: Commit**

```bash
git add src/services/sms-listener.ts
git commit -m "feat: add SMS listener service"
```

---

## Phase 12: Background Service

### Task 21: Create Background Service

**Files:**
- Create: `src/services/background.ts`

**Step 1: Create background service**

```typescript
// src/services/background.ts
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { startSmsListener, stopSmsListener } from './sms-listener';
import { sendEmail } from './email-sender';
import { useHistoryStore } from '@/stores/history';
import { useSettingsStore } from '@/stores/settings';
import { useServiceStore } from '@/stores/service';
import type { SmsMessage } from '@/types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const NOTIFICATION_CHANNEL = 'sms-mailer-service';

async function setupNotifications() {
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL, {
    name: 'SMS Mailer Service',
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [0],
    lightColor: '#3B82F6',
  });
}

async function showFailureNotification(failedCount: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SMS Mailer - Delivery Failed',
      body: `${failedCount} message(s) failed to forward. Tap to view.`,
      data: { screen: 'history' },
    },
    trigger: null,
  });
}

async function processQueue() {
  const historyStore = useHistoryStore.getState();
  const settingsStore = useSettingsStore.getState();

  const nextItem = historyStore.getNextRetry();
  if (!nextItem) return;

  const password = await settingsStore.loadPassword();
  const result = await sendEmail(settingsStore.smtp, password, nextItem.sms);

  if (result.success) {
    historyStore.markAsForwarded(nextItem.id);
  } else {
    historyStore.markAsFailed(nextItem.id, result.error || 'Unknown error');

    // Check if this was the final retry
    const updatedItem = historyStore.queue.find((i) => i.id === nextItem.id);
    if (updatedItem?.status === 'failed') {
      const failedCount = historyStore.getFailed().length;
      await showFailureNotification(failedCount);
    }
  }
}

async function backgroundTask(taskData?: { delay: number }) {
  const delay = taskData?.delay || 5000;

  // Set up SMS listener
  startSmsListener((sms: SmsMessage) => {
    const historyStore = useHistoryStore.getState();
    historyStore.addToQueue(sms);
  });

  // Main loop
  while (BackgroundService.isRunning()) {
    await processQueue();
    await sleep(delay);
  }

  stopSmsListener();
}

const backgroundOptions = {
  taskName: 'SMS Mailer',
  taskTitle: 'SMS Mailer Active',
  taskDesc: 'Listening for incoming SMS messages',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#3B82F6',
  linkingURI: 'smsmailer://status',
  parameters: {
    delay: 5000,
  },
};

export async function startBackgroundService(): Promise<boolean> {
  try {
    await setupNotifications();
    await BackgroundService.start(backgroundTask, backgroundOptions);
    useServiceStore.getState().setRunning(true);
    return true;
  } catch (error) {
    console.error('Failed to start background service:', error);
    return false;
  }
}

export async function stopBackgroundService(): Promise<void> {
  try {
    await BackgroundService.stop();
    useServiceStore.getState().setRunning(false);
  } catch (error) {
    console.error('Failed to stop background service:', error);
  }
}

export function isBackgroundServiceRunning(): boolean {
  return BackgroundService.isRunning();
}
```

**Step 2: Commit**

```bash
git add src/services/background.ts
git commit -m "feat: add background service with SMS forwarding"
```

---

### Task 22: Integrate Background Service in Status Screen

**Files:**
- Modify: `src/app/(tabs)/index.tsx`

**Step 1: Add service integration**

Update the imports at the top:
```typescript
import { startBackgroundService, stopBackgroundService } from '@/services/background';
```

Update the `handleToggleService` function:
```typescript
  const handleToggleService = async () => {
    if (!isConfigured) {
      router.push('/settings');
      return;
    }

    if (isRunning) {
      await stopBackgroundService();
    } else {
      const started = await startBackgroundService();
      if (!started) {
        Alert.alert('Error', 'Failed to start the service. Please check permissions.');
      }
    }
  };
```

Add Alert import:
```typescript
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
```

**Step 2: Commit**

```bash
git add src/app/\(tabs\)/index.tsx
git commit -m "feat: integrate background service controls in Status screen"
```

---

## Phase 13: Update Permissions Hook with Real SMS Check

### Task 23: Update Permissions Hook

**Files:**
- Modify: `src/hooks/usePermissions.ts`

**Step 1: Integrate real SMS permission checking**

```typescript
// src/hooks/usePermissions.ts
import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { checkSmsPermissions, requestSmsPermissions } from '@/services/sms-listener';
import type { PermissionStatus } from '@/types';

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    sms: false,
    notifications: false,
    batteryOptimization: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check notification permission
      const { status: notifStatus } = await Notifications.getPermissionsAsync();

      // Check SMS permissions
      const smsStatus = await checkSmsPermissions();
      const smsGranted = smsStatus.hasReadSmsPermission && smsStatus.hasReceiveSmsPermission;

      // Battery optimization - we can't easily check this, assume false
      // User needs to manually verify
      const batteryOptDisabled = false;

      setPermissions({
        sms: smsGranted,
        notifications: notifStatus === 'granted',
        batteryOptimization: batteryOptDisabled,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setPermissions((prev) => ({ ...prev, notifications: true }));
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const requestSmsPermission = async () => {
    const granted = await requestSmsPermissions();
    if (granted) {
      setPermissions((prev) => ({ ...prev, sms: true }));
    } else {
      Alert.alert(
        'SMS Permission Required',
        'Please grant SMS permissions to forward messages.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const requestBatteryOptimization = async () => {
    if (Platform.OS !== 'android') return;

    Alert.alert(
      'Battery Optimization',
      'To keep SMS Mailer running reliably, please disable battery optimization for this app in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: async () => {
            try {
              await Linking.openSettings();
              // Assume user enabled it after opening settings
              setPermissions((prev) => ({ ...prev, batteryOptimization: true }));
            } catch (error) {
              Alert.alert('Error', 'Unable to open settings');
            }
          }
        },
      ]
    );
  };

  return {
    permissions,
    isLoading,
    checkPermissions,
    requestNotifications,
    requestSmsPermission,
    requestBatteryOptimization,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/usePermissions.ts
git commit -m "feat: integrate real SMS permission checks"
```

---

## Phase 14: Final Integration & Testing

### Task 24: Create Development Build Configuration

**Files:**
- Create: `eas.json`

**Step 1: Create EAS build config**

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Step 2: Commit**

```bash
git add eas.json
git commit -m "chore: add EAS build configuration"
```

---

### Task 25: Add Android Gradle Configuration for SMTP

**Files:**
- Create: `android-manifest.plugin.js` (Expo config plugin)

**Step 1: Create config plugin for Android manifest**

```javascript
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
```

**Step 2: Update app.json to use the plugin**

In `app.json`, update the plugins array:
```json
"plugins": [
  "expo-router",
  "expo-secure-store",
  "./android-manifest.plugin.js"
]
```

**Step 3: Commit**

```bash
git add android-manifest.plugin.js app.json
git commit -m "chore: add Android manifest config plugin for deep linking"
```

---

### Task 26: Final Code Review & Cleanup

**Step 1: Verify all imports work**

Run:
```bash
npx tsc --noEmit
```
Expected: No TypeScript errors

**Step 2: Create a development build**

Run:
```bash
npx expo prebuild --platform android
```

**Step 3: Build APK for testing**

Run:
```bash
eas build --platform android --profile development --local
```

Or if not using EAS:
```bash
cd android && ./gradlew assembleDebug
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: complete initial implementation"
```

---

## Summary

This implementation plan creates a complete SMS-to-email forwarding app with:

1. **Tab Navigation**: Status, Settings, History screens
2. **Dark Theme**: Modern dark UI with blue accents
3. **SMTP Configuration**: Full form with test connection
4. **Permission Management**: SMS, notifications, battery optimization
5. **Background Service**: Foreground service that survives app closure
6. **SMS Listener**: Receives incoming SMS via broadcast receiver
7. **Retry Queue**: 3-attempt retry with exponential backoff
8. **History View**: Pending/failed items only, success counter

**Key Libraries:**
- `@maniac-tech/react-native-expo-read-sms` - SMS reception
- `react-native-background-actions` - Foreground service
- `react-native-smtp-mailer` - SMTP email sending
- `zustand` - State management with persistence
- `expo-secure-store` - Password encryption

**Testing on Device:**
1. Build development APK
2. Install on Android device
3. Configure SMTP settings
4. Grant all permissions
5. Start service
6. Send test SMS to device
7. Verify email received
