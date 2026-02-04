// src/components/ui/Select.tsx
import { View, StyleSheet, Pressable } from 'react-native';
import { Menu, Text, TouchableRipple } from 'react-native-paper';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

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
  const theme = useAppTheme();
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      <Text
        variant="bodySmall"
        style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <Menu
        visible={isOpen}
        onDismiss={() => setIsOpen(false)}
        anchor={
          <TouchableRipple
            onPress={() => setIsOpen(true)}
            style={[
              styles.select,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline,
              },
            ]}
            accessibilityRole="combobox"
            accessibilityLabel={`${label}: ${selectedOption?.label || 'Select'}`}
            accessibilityState={{ expanded: isOpen }}
          >
            <View style={styles.selectInner}>
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurface }}
              >
                {selectedOption?.label || 'Select...'}
              </Text>
              <MaterialCommunityIcons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          </TouchableRipple>
        }
        contentStyle={[
          styles.menuContent,
          { backgroundColor: theme.colors.elevation.level2 },
        ]}
      >
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => {
              onValueChange(option.value);
              setIsOpen(false);
            }}
            title={option.label}
            titleStyle={
              option.value === value
                ? { color: theme.colors.primary, fontWeight: '500' }
                : undefined
            }
            leadingIcon={
              option.value === value
                ? () => (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )
                : undefined
            }
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  select: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  selectInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuContent: {
    borderRadius: 12,
    marginTop: 4,
  },
});
