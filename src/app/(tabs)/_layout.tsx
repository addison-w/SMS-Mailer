// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

type IconName = 'home' | 'home-outline' | 'cog' | 'cog-outline' | 'history';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const theme = useAppTheme();

  const icons: Record<string, { active: IconName; inactive: IconName }> = {
    index: { active: 'home', inactive: 'home-outline' },
    settings: { active: 'cog', inactive: 'cog-outline' },
    history: { active: 'history', inactive: 'history' },
  };

  const iconConfig = icons[name] || { active: 'home', inactive: 'home-outline' };

  return (
    <MaterialCommunityIcons
      name={focused ? iconConfig.active : iconConfig.inactive}
      size={24}
      color={focused ? theme.colors.primary : theme.colors.onSurfaceVariant}
    />
  );
}

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontFamily: 'Roboto_500Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Status',
          headerTitle: 'SMS Mailer',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
          tabBarAccessibilityLabel: 'Status tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon name="history" focused={focused} />,
          tabBarAccessibilityLabel: 'History tab',
        }}
      />
    </Tabs>
  );
}
