// components/layout/ScreenLayout.tsx - Fixed version with safe area handling
import React from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ViewStyle,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Header as RNEHeader } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

interface ScreenLayoutProps {
  children: React.ReactNode
  // Header options
  showHeader?: boolean
  headerTitle?: string
  headerLeft?: any
  headerRight?: any
  headerCenter?: any
  headerBackgroundColor?: string
  // Layout options
  padding?: boolean
  scrollable?: boolean
  keyboardAvoid?: boolean
  backgroundColor?: string
  statusBarStyle?: 'light-content' | 'dark-content'
  statusBarBackground?: string
  // Style overrides
  style?: ViewStyle
  contentStyle?: ViewStyle
  headerStyle?: ViewStyle
  // Safe area props
  hasTabBar?: boolean
  hasBottomButtons?: boolean
  bottomButtonHeight?: number
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  showHeader = false,
  headerTitle,
  headerLeft,
  headerRight,
  headerCenter,
  headerBackgroundColor,
  padding = true,
  scrollable = false,
  keyboardAvoid = false,
  backgroundColor,
  statusBarStyle = 'dark-content',
  statusBarBackground,
  style,
  contentStyle,
  headerStyle,
  hasTabBar = false,
  hasBottomButtons = false,
  bottomButtonHeight = 0,
}) => {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  // Calculate safe area considerations
  const calculateBottomPadding = () => {
    let bottomPadding = 0

    // Add tab bar height if present
    if (hasTabBar) {
      const baseTabHeight = 60
      const tabExtraPadding = Platform.OS === 'android' ? 80 : 20
      const totalTabHeight = baseTabHeight + Math.max(insets.bottom, tabExtraPadding)
      bottomPadding = Math.max(bottomPadding, totalTabHeight)
    }

    // Add bottom button height if present
    if (hasBottomButtons) {
      const buttonContainerHeight = bottomButtonHeight || (
        // Estimate button container height
        theme.spacing.buttonHeight + // Button height
        (theme.spacing.lg * 2) + // Top and bottom padding
        Math.max(insets.bottom, Platform.OS === 'android' ? 100 : 34) // Safe area
      )
      bottomPadding = Math.max(bottomPadding, buttonContainerHeight)
    }

    // Minimum safe area for platform
    if (!hasTabBar && !hasBottomButtons) {
      bottomPadding = Math.max(bottomPadding, insets.bottom)
    }

    return bottomPadding
  }

  const screenBackgroundColor = backgroundColor || theme.colors.background
  const headerBgColorFinal = headerBackgroundColor || theme.colors.primary
  const statusBgColorFinal = statusBarBackground || headerBgColorFinal
  const bottomPadding = calculateBottomPadding()

  const renderHeader = () => {
    if (!showHeader) return null

    const centerComponent = headerCenter || (headerTitle ? {
      text: headerTitle,
      style: {
        color: theme.colors.textOnPrimary,
        fontSize: theme.typography.fontSize.h2,
        fontWeight: '600' as const,
      },
    } : undefined)

    return (
      <RNEHeader
        leftComponent={headerLeft}
        centerComponent={centerComponent}
        rightComponent={headerRight}
        backgroundColor={headerBgColorFinal}
        style={[
          {
            borderBottomWidth: 0,
            ...theme.shadows.header,
          },
          headerStyle,
        ]}
      />
    )
  }

  const renderContent = () => {
    const contentProps = {
      style: [
        styles.content,
        padding && styles.contentPadding,
        { 
          backgroundColor: screenBackgroundColor,
          paddingBottom: bottomPadding,
        },
        contentStyle,
      ],
    }

    if (scrollable) {
      return (
        <ScrollView
          {...contentProps}
          contentContainerStyle={[
            padding && styles.contentPadding,
            { 
              paddingBottom: bottomPadding + theme.spacing.lg,
            },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      )
    }

    return (
      <View {...contentProps}>
        {children}
      </View>
    )
  }

  const renderLayout = () => {
    const layoutContent = (
      <>
        {renderHeader()}
        {renderContent()}
      </>
    )

    if (keyboardAvoid) {
      return (
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: screenBackgroundColor }, style]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {layoutContent}
        </KeyboardAvoidingView>
      )
    }

    return (
      <View style={[styles.container, { backgroundColor: screenBackgroundColor }, style]}>
        {layoutContent}
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    contentPadding: {
      paddingHorizontal: theme.spacing.screenPadding,
    },
  })

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBackgroundColor }, style]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBgColorFinal}
        translucent={false}
      />
      {renderLayout()}
    </SafeAreaView>
  )
}

export default ScreenLayout