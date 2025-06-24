// components/wizard/WizardContainer.tsx - Updated with ButtonContainer
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Header, Button } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../hooks/useTheme'
import ButtonContainer from '../layout/ButtonContainer'

interface WizardContainerProps {
  currentStep: number
  totalSteps: number
  title: string
  onBack: () => void
  onNext?: () => void
  onSkip?: () => void
  canSkip?: boolean
  hideSkip?: boolean
  nextButtonText?: string
  nextButtonDisabled?: boolean
  children: React.ReactNode
}

const WizardContainer: React.FC<WizardContainerProps> = ({
  currentStep,
  totalSteps,
  title,
  onBack,
  onNext,
  onSkip,
  canSkip = false,
  hideSkip = false,
  nextButtonText = 'Next',
  nextButtonDisabled = false,
  children,
}) => {
  const { theme } = useTheme()

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
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
    },
    titleContainer: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize.h1,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.h1 * 1.2,
    },
    // Button styles for ButtonContainer
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      height: theme.spacing.buttonHeight,
      flex: 1,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      height: theme.spacing.buttonHeight,
      flex: 1,
    },
    primaryButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
    },
    secondaryButtonText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
    },
  })

  const progress = currentStep / totalSteps

  const renderButtons = () => {
    const buttons = []

    // Skip button (if applicable)
    if (!hideSkip && canSkip && onSkip) {
      buttons.push(
        <Button
          key="skip"
          title="Skip"
          type="outline"
          buttonStyle={styles.secondaryButton}
          titleStyle={styles.secondaryButtonText}
          onPress={onSkip}
        />
      )
    }

    // Next/Continue button (if applicable)
    if (onNext) {
      buttons.push(
        <Button
          key="next"
          title={nextButtonText}
          buttonStyle={[
            styles.primaryButton,
            nextButtonDisabled && { backgroundColor: theme.colors.disabled }
          ]}
          titleStyle={[
            styles.primaryButtonText,
            nextButtonDisabled && { color: theme.colors.disabled }
          ]}
          onPress={onNext}
          disabled={nextButtonDisabled}
        />
      )
    }

    if (buttons.length === 0) return null

    return (
      <ButtonContainer
        direction={buttons.length > 1 ? 'row' : 'column'}
        spacing={theme.spacing.md}
        hasTabBar={false} // Wizards typically don't have tab bars
        withBorder={true}
      >
        {buttons}
      </ButtonContainer>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        leftComponent={{
          icon: 'arrow-back',
          type: 'material',
          color: theme.colors.textOnPrimary,
          onPress: onBack,
        }}
        backgroundColor={theme.colors.primary}
        style={{
          borderBottomWidth: 0,
          ...theme.shadows.header,
        }}
      />

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        {children}
      </View>

      {/* Bottom buttons */}
      {renderButtons()}
    </SafeAreaView>
  )
}

export default WizardContainer