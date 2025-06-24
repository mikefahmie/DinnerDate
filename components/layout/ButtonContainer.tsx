// components/layout/ButtonContainer.tsx
import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../hooks/useTheme'

interface ButtonContainerProps {
  /**
   * Button components to render
   */
  children: React.ReactNode
  /**
   * Layout direction for buttons
   */
  direction?: 'row' | 'column'
  /**
   * Spacing between buttons when in row layout
   */
  spacing?: number
  /**
   * Background color override
   */
  backgroundColor?: string
  /**
   * Whether this container should account for tab bar height
   */
  hasTabBar?: boolean
  /**
   * Additional bottom padding
   */
  extraBottomPadding?: number
  /**
   * Custom style overrides
   */
  style?: any
  /**
   * Whether to add a top border/shadow
   */
  withBorder?: boolean
}

/**
 * ButtonContainer - A container for buttons that ensures they sit above
 * the safe area and system navigation controls.
 * 
 * This component should be used for:
 * - Primary action buttons at bottom of screens
 * - Wizard navigation buttons
 * - Any fixed-position buttons that might overlap system UI
 */
const ButtonContainer: React.FC<ButtonContainerProps> = ({
  children,
  direction = 'column',
  spacing = 12,
  backgroundColor,
  hasTabBar = true,
  extraBottomPadding = 0,
  style,
  withBorder = true,
}) => {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  // Calculate bottom padding to keep buttons above system controls
  const calculateBottomPadding = () => {
    let padding = insets.bottom

    // Add tab bar height if present (matches TabNavigator calculations)
    if (hasTabBar) {
      const baseTabHeight = 60
      const totalTabHeight = baseTabHeight + insets.bottom
      padding = Math.max(padding, totalTabHeight)
    }

    // Add extra padding if specified
    padding += extraBottomPadding

    return padding
  }

  const bottomPadding = calculateBottomPadding()
  const bgColor = backgroundColor || theme.colors.surface

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: bgColor,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: bottomPadding,
      zIndex: 100, // Above content but below modals
      ...(withBorder && {
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
        ...theme.shadows.small,
      }),
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing,
    },
    buttonColumn: {
      flexDirection: 'column',
      gap: spacing,
    },
  })

  const containerStyle = direction === 'row' ? styles.buttonRow : styles.buttonColumn

  return (
    <View style={[styles.container, containerStyle, style]}>
      {children}
    </View>
  )
}

export default ButtonContainer