// theme/index.ts - Main theme export
import { colors } from './colors'
import { typography } from './typography'
import { spacing } from './spacing'
import { shadows } from './shadows'
import { borderRadius } from './borderRadius'

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
}

export type Theme = typeof theme

// Re-export individual theme parts for convenience
export { colors, typography, spacing, shadows, borderRadius }