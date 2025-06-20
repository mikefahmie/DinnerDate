// components/layout/ScreenLayout.tsx
import React from 'react'
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
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
}) => {
  const { theme } = useTheme()

  const screenBackgroundColor = backgroundColor || theme.colors.background
  const headerBgColor = headerBackgroundColor || theme.colors.primary
  const statusBgColor = statusBarBackground || headerBgColor

  const renderHeader = () => {
    if (!showHeader) return null

    const centerComponent = headerCenter || (headerTitle ? {
      text: headerTitle,
      style: {
        color: theme.colors.textOnPrimary,
        fontSize: theme.typography.fontSize.h2,
        fontWeight: '600',
      },
    } : undefined)

    return (
      <RNEHeader
        leftComponent={headerLeft}
        centerComponent={centerComponent}
        rightComponent={headerRight}
        backgroundColor={headerBgColor}
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
        { backgroundColor: screenBackgroundColor },
        contentStyle,
      ],
    }

    if (scrollable) {
      return (
        <ScrollView
          {...contentProps}
          contentContainerStyle={[
            padding && styles.contentPadding,
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
        backgroundColor={statusBgColor}
        translucent={false}
      />
      {renderLayout()}
    </SafeAreaView>
  )
}

export default ScreenLayout