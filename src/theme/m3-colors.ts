// src/theme/m3-colors.ts
// Material Design 3 color scheme generated from seed #3B82F6

export const lightColors = {
  primary: '#3B82F6',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D6E3FF',
  onPrimaryContainer: '#001A41',

  secondary: '#575E71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#DBE2F9',
  onSecondaryContainer: '#141B2C',

  tertiary: '#715573',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FCD7FB',
  onTertiaryContainer: '#29132D',

  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',

  background: '#FEFBFF',
  onBackground: '#1B1B1F',

  surface: '#FEFBFF',
  onSurface: '#1B1B1F',
  surfaceVariant: '#E1E2EC',
  onSurfaceVariant: '#44474F',

  outline: '#74777F',
  outlineVariant: '#C4C6D0',

  inverseSurface: '#303034',
  inverseOnSurface: '#F2F0F4',
  inversePrimary: '#ADC6FF',

  shadow: '#000000',
  scrim: '#000000',

  surfaceDisabled: 'rgba(27, 27, 31, 0.12)',
  onSurfaceDisabled: 'rgba(27, 27, 31, 0.38)',

  backdrop: 'rgba(46, 48, 56, 0.4)',

  elevation: {
    level0: 'transparent',
    level1: '#F4F3F7',
    level2: '#EFEEF3',
    level3: '#EAEAEF',
    level4: '#E8E8ED',
    level5: '#E5E5EA',
  },
} as const;

export const darkColors = {
  primary: '#ADC6FF',
  onPrimary: '#002E69',
  primaryContainer: '#004494',
  onPrimaryContainer: '#D6E3FF',

  secondary: '#BFC6DC',
  onSecondary: '#293041',
  secondaryContainer: '#3F4759',
  onSecondaryContainer: '#DBE2F9',

  tertiary: '#DFBBDE',
  onTertiary: '#402843',
  tertiaryContainer: '#583E5A',
  onTertiaryContainer: '#FCD7FB',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',

  background: '#1B1B1F',
  onBackground: '#E4E2E6',

  surface: '#1B1B1F',
  onSurface: '#E4E2E6',
  surfaceVariant: '#44474F',
  onSurfaceVariant: '#C4C6D0',

  outline: '#8E9099',
  outlineVariant: '#44474F',

  inverseSurface: '#E4E2E6',
  inverseOnSurface: '#303034',
  inversePrimary: '#3B5BA9',

  shadow: '#000000',
  scrim: '#000000',

  surfaceDisabled: 'rgba(228, 226, 230, 0.12)',
  onSurfaceDisabled: 'rgba(228, 226, 230, 0.38)',

  backdrop: 'rgba(46, 48, 56, 0.4)',

  elevation: {
    level0: 'transparent',
    level1: '#24242A',
    level2: '#292931',
    level3: '#2E2E37',
    level4: '#30303A',
    level5: '#33333E',
  },
} as const;

export type M3Colors = typeof lightColors;
