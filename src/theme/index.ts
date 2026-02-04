// src/theme/index.ts
// Theme exports

export { lightTheme, darkTheme, fonts } from './theme';
export { lightColors, darkColors } from './m3-colors';
export { typeScale } from './typography';
export type { AppTheme } from './theme';
export type { M3Colors } from './m3-colors';

// Legacy colors for gradual migration
// Components should migrate to useAppTheme().colors
export { colors } from './colors';
