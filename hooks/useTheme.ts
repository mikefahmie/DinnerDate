// hooks/useTheme.ts
import { theme } from '../theme'
import { commonStyles } from '../theme/styles'

export const useTheme = () => {
  return {
    theme,
    styles: commonStyles,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    shadows: theme.shadows,
    borderRadius: theme.borderRadius,
  }
}