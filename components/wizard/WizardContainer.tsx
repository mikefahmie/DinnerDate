// components/wizard/WizardContainer.tsx
import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { Header, Button } from '@rneui/themed'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../hooks/useTheme'

interface WizardContainerProps {
  currentStep: number
  totalSteps: number
  title: string
  onBack: () => void
  onSkip?: () => void
  canSkip?: boolean
  hideSkip?: boolean
  children: React.ReactNode
}

const WizardContainer: React.FC<WizardContainerProps> = ({
  currentStep,
  totalSteps,
  title,
  onBack,
  onSkip,
  canSkip = false,
  hideSkip = false,
  children,
}) => {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  
  // Calculate bottom padding to account for tab navigation
  const getBottomPadding = () => {
    const tabHeight = Platform.OS === 'android' ? 140 : 80 // Match TabNavigator height
    return Math.max(insets.bottom, tabHeight)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    progressContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.divider,
      borderRadius: 2,
      marginBottom: theme.spacing.sm,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    stepText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    contentContainer: {
      flex: 1,
      paddingBottom: getBottomPadding(), // Add bottom padding here
    },
    titleContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: theme.typography.fontSize.h1,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.h1 * 1.2,
    },
  })

  const progress = currentStep / totalSteps

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        leftComponent={{
          icon: 'arrow-back',
          type: 'material',
          color: theme.colors.textOnPrimary,
          onPress: onBack,
        }}
        rightComponent={
          !hideSkip && canSkip ? {
            text: 'Skip',
            style: { 
              color: theme.colors.textOnPrimary, 
              fontSize: 16,
              fontWeight: '500',
            },
            onPress: onSkip,
          } : undefined
        }
        backgroundColor={theme.colors.primary}
      />

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.contentContainer}>
        {children}
      </View>
    </SafeAreaView>
  )
}

export default WizardContainer