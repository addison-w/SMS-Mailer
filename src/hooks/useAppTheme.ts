// src/hooks/useAppTheme.ts
// Typed hook for accessing the M3 theme

import { useTheme } from 'react-native-paper';
import type { AppTheme } from '@/theme/theme';

export function useAppTheme() {
  return useTheme<AppTheme>();
}
