/**
 * This is a medical app — it is intentionally locked to a clean, bright light
 * theme regardless of the device's system setting. Do not switch on color scheme.
 */

import { Colors } from '@/constants/theme';

export function useTheme() {
  return Colors.light;
}
