// src/theme/theme.ts
// React Native Paper M3 theme configuration

import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { lightColors, darkColors } from './m3-colors';
import { typeScale, fonts } from './typography';
import type { MD3Theme } from 'react-native-paper';

// Configure fonts with Roboto
const fontConfig = {
  displayLarge: typeScale.displayLarge,
  displayMedium: typeScale.displayMedium,
  displaySmall: typeScale.displaySmall,
  headlineLarge: typeScale.headlineLarge,
  headlineMedium: typeScale.headlineMedium,
  headlineSmall: typeScale.headlineSmall,
  titleLarge: typeScale.titleLarge,
  titleMedium: typeScale.titleMedium,
  titleSmall: typeScale.titleSmall,
  bodyLarge: typeScale.bodyLarge,
  bodyMedium: typeScale.bodyMedium,
  bodySmall: typeScale.bodySmall,
  labelLarge: typeScale.labelLarge,
  labelMedium: typeScale.labelMedium,
  labelSmall: typeScale.labelSmall,
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Re-export fonts for use in font loading
export { fonts };

// Type helper for useTheme hook
export type AppTheme = typeof lightTheme;
