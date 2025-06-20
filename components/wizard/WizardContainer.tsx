// components/wizard/WizardContainer.tsx - Fixed Android navigation bar padding
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, Dimensions } from 'react-native'
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

const { height: screenHeight } = Dimensions.get('window')

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

  // Calculate safe bottom padding for Android navigation
  const getBottomPadding = () => {
    if (Platform.OS === 'android') {
      // Android devices with gesture navigation or button navigation
      // Standard Android navigation bar is ~48dp, but we'll use 80 to be safe
      return 80
    }
    return 20 // iOS safe area is handled by SafeAreaView
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.background,
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
    navigationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface,
      minWidth: 80,
      justifyContent: 'center',
      ...theme.shadows.small,
    },
    backButtonDisabled: {
      opacity: 0.3,
    },
    backButtonText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textPrimary,
      fontWeight: '500',
      marginLeft: theme.spacing.xs,
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
      minWidth: 80,
      alignItems: 'center',
    },
    skipText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    skipTextDisabled: {
      opacity: 0.3,
    },
    placeholder: {
      width: 80, // Same width as back button for balance
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
      paddingHorizontal: theme.spacing.md,
    },
    content: {
      flex: 1,
      paddingBottom: getBottomPadding(), // Dynamic bottom padding for Android
    },
  })

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
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

          {/* Navigation Row - Now below progress bar */}
          <View style={styles.navigationRow}>
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
                size={16}
                color={currentStep === 1 ? theme.colors.textSecondary : theme.colors.textPrimary}
              />
              <Text style={styles.backButtonText}>Back</Text>
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

          {/* Title - More space from navigation */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>

        {/* Step Content - Scrollable with proper bottom padding */}
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  )
}

export default WizardContainer