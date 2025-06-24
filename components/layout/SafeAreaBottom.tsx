// components/layout/SafeAreaBottom.tsx
import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../hooks/useTheme'

interface SafeAreaBottomProps {
  /**
   * Background color override. Defaults to theme surface color
   */
  backgroundColor?: string
  /**
   * Additional height beyond safe area insets
   */
  extraHeight?: number
  /**
   * Whether to include tab bar height in calculations
   */
  includeTabBarHeight?: boolean
  /**
   * Custom style overrides
   */
  style?: any
}

/**
 * SafeAreaBottom - A static safe area component that always sits at the bottom
 * of the screen to prevent UI elements from overlapping with system controls.
 * 
 * This component calculates the appropriate height based on:
 * - Device safe area insets
 * - Tab navigation height (if applicable)
 * - Platform-specific adjustments for Android navigation
 * - Additional height buffer for better UX
 */
const SafeAreaBottom: React.FC<SafeAreaBottomProps> = ({
  backgroundColor,
  extraHeight = 0,
  includeTabBarHeight = true,
  style,
}) => {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  // Calculate the total height needed for the safe area
  const calculateSafeAreaHeight = () => {
    // Base safe area from device
    let height = insets.bottom

    // Add tab bar height if needed (matches TabNavigator.tsx calculations)
    if (includeTabBarHeight) {
      const baseTabHeight = 60
      const tabExtraPadding = Platform.OS === 'android' ? 80 : 20
      const totalTabHeight = baseTabHeight + Math.max(insets.bottom, tabExtraPadding)
      height = Math.max(height, totalTabHeight)
    }

    // Platform-specific adjustments
    if (Platform.OS === 'android') {
      // Android often needs extra space for gesture navigation
      height = Math.max(height, 100)
    } else {
      // iOS safe area handling
      height = Math.max(height, 34) // Minimum for home indicator
    }

    // Add any extra height requested
    height += extraHeight

    return height
  }

  const safeAreaHeight = calculateSafeAreaHeight()
  const bgColor = backgroundColor || theme.colors.surface

  const styles = StyleSheet.create({
    safeArea: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: safeAreaHeight,
      backgroundColor: bgColor,
      zIndex: 999, // Ensure it's above other content
      pointerEvents: 'none', // Allow touches to pass through
    },
  })

  return <View style={[styles.safeArea, style]} />
}

export default SafeAreaBottom