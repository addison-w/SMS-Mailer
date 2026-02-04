// src/components/ui/Input.tsx
import { StyleSheet, View, KeyboardTypeOptions } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';

interface InputProps {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'username' | 'off';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  testID?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  multiline,
  numberOfLines,
  disabled,
  testID,
}: InputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        multiline={multiline}
        numberOfLines={numberOfLines}
        disabled={disabled}
        error={!!error}
        outlineStyle={styles.outline}
        contentStyle={styles.content}
        accessibilityLabel={label}
        testID={testID}
      />
      {(error || helperText) && (
        <HelperText type={error ? 'error' : 'info'} visible={!!(error || helperText)}>
          {error || helperText}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  outline: {
    borderRadius: 12,
  },
  content: {
    minHeight: 48,
  },
});
