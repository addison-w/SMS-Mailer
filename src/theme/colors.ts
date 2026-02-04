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
