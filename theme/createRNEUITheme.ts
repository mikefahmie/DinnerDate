// theme/createRNEUITheme.ts - Fixed React Native Elements theme integration
import { createTheme } from '@rneui/themed'
import { theme } from './index'

export const rneTheme = createTheme({
  lightColors: {
    primary: theme.colors.primary,
    secondary: theme.colors.accent,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    white: theme.colors.surface,
    black: theme.colors.textPrimary,
    grey0: theme.colors.background,
    grey1: theme.colors.surfaceElevated,
    grey2: theme.colors.border,
    grey3: theme.colors.divider,
    grey4: theme.colors.disabled,
    grey5: theme.colors.textMuted,
  },
  darkColors: {
    // Define dark mode colors if needed
    primary: theme.colors.primary,
    // ... other dark colors
  },
  mode: 'light',
  components: {
    Header: {
      backgroundColor: theme.colors.primary,
      centerComponent: {
        style: {
          color: theme.colors.textOnPrimary,
          fontSize: theme.typography.fontSize.h1,
          fontWeight: '700', // Fixed: Using string literal
        },
      },
      ...theme.shadows.header,
    },
    Button: {
      buttonStyle: {
        borderRadius: theme.borderRadius.md,
        height: theme.spacing.buttonHeight,
        paddingHorizontal: theme.spacing.xl,
      },
      titleStyle: {
        fontSize: theme.typography.fontSize.body,
        fontWeight: '600', // Fixed: Using string literal
      },
    },
    Input: {
      inputStyle: {
        fontSize: theme.typography.fontSize.body,
        color: theme.colors.textPrimary,
      },
      labelStyle: {
        fontSize: theme.typography.fontSize.secondary,
        color: theme.colors.textSecondary,
        fontWeight: '500', // Fixed: Using string literal
      },
      inputContainerStyle: {
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        height: theme.spacing.inputHeight,
      },
    },
    Card: {
      containerStyle: {
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.medium,
        margin: 0,
        marginBottom: theme.spacing.lg,
      },
    },
    Text: {
      style: {
        fontSize: theme.typography.fontSize.body,
        color: theme.colors.textPrimary,
      },
    },
  },
})