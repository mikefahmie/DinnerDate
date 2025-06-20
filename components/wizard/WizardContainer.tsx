// components/wizard/WizardContainer.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

interface WizardContainerProps {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
  title: string
  onBack?: () => void
  onSkip?: () => void
  canSkip?: boolean
  hideSkip?: boolean
}

const WizardContainer: React.FC<WizardContainerProps> = ({
  children,
  currentStep,
  totalSteps,
  title,
  onBack,
  onSkip,
  canSkip = false,
  hideSkip = false,
}) => {
  const { theme } = useTheme()

  const progressPercentage = (currentStep / totalSteps) * 100

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    backButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    backButtonDisabled: {
      opacity: 0.3,
    },
    stepIndicator: {
      alignItems: 'center',
    },
    stepText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    skipButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    skipText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    skipTextDisabled: {
      opacity: 0.3,
    },
    placeholder: {
      width: 40, // Same width as back button for balance
    },
    progressContainer: {
      marginBottom: theme.spacing.lg,
    },
    progressTrack: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
    },
    titleContainer: {
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.h2 * 1.2,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Top Navigation Row */}
        <View style={styles.topRow}>
          {/* Back Button */}
          <TouchableOpacity
            style={[
              styles.backButton,
              currentStep === 1 && styles.backButtonDisabled,
            ]}
            onPress={onBack}
            disabled={currentStep === 1}
            activeOpacity={0.7}
          >
            <Icon
              name="chevron-left"
              type="feather"
              size={20}
              color={currentStep === 1 ? theme.colors.textSecondary : theme.colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              Step {currentStep} of {totalSteps}
            </Text>
          </View>

          {/* Skip Button or Placeholder */}
          {!hideSkip && canSkip && onSkip ? (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      {/* Step Content */}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  )
}

export default WizardContainer