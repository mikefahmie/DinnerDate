// components/wizard/MealTypeStep.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface MealTypeStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface MealOption {
  id: string
  label: string
  icon: { name: string; type: string }
  description: string
  timeRange: string
}

const MEAL_OPTIONS: MealOption[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    icon: { name: 'coffee', type: 'font-awesome' },
    description: 'Start your day right',
    timeRange: '6:00 AM - 11:00 AM'
  },
  {
    id: 'lunch',
    label: 'Lunch',
    icon: { name: 'cutlery', type: 'font-awesome' },
    description: 'Midday fuel',
    timeRange: '11:00 AM - 3:00 PM'
  },
  {
    id: 'dinner',
    label: 'Dinner',
    icon: { name: 'glass', type: 'font-awesome' },
    description: 'Evening dining',
    timeRange: '5:00 PM - 10:00 PM'
  },
  {
    id: 'latenight',
    label: 'Late Night',
    icon: { name: 'moon-o', type: 'font-awesome' },
    description: 'After hours',
    timeRange: '10:00 PM - 2:00 AM'
  }
]

const MealTypeStep: React.FC<MealTypeStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()

  const toggleMealType = (mealId: string) => {
    const currentMealTypes = wizardState.mealTypes || []
    const updatedMealTypes = currentMealTypes.includes(mealId)
      ? currentMealTypes.filter(id => id !== mealId)
      : [...currentMealTypes, mealId]
    
    updateWizardState({ mealTypes: updatedMealTypes })
  }

  const handleContinue = () => {
    onNext()
  }

  const renderMealCard = (meal: MealOption) => {
    const isSelected = wizardState.mealTypes?.includes(meal.id) || false

    return (
      <TouchableOpacity
        key={meal.id}
        style={[
          styles.mealCard,
          isSelected && styles.selectedMealCard
        ]}
        onPress={() => toggleMealType(meal.id)}
        activeOpacity={0.7}
      >
        <View style={styles.mealIconContainer}>
          <Icon
            name={meal.icon.name}
            type={meal.icon.type}
            size={24}
            color={theme.colors.textPrimary}
          />
        </View>
        
        <View style={styles.mealContent}>
          <Text style={[
            styles.mealLabel,
            isSelected && styles.selectedMealLabel
          ]}>
            {meal.label}
          </Text>
          <Text style={[
            styles.mealDescription,
            isSelected && styles.selectedMealDescription
          ]}>
            {meal.description}
          </Text>
          <Text style={[
            styles.mealTimeRange,
            isSelected && styles.selectedMealTimeRange
          ]}>
            {meal.timeRange}
          </Text>
        </View>

        <View style={[
          styles.selectionIndicator,
          isSelected && styles.selectedIndicator
        ]}>
          <Text style={styles.checkmark}>
            {isSelected ? '✓' : ''}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.screenPadding,
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    mealGrid: {
      marginBottom: theme.spacing.xl,
    },
    mealCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedMealCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    mealIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    mealIcon: {
      // Removed - now using Icon component
    },
    mealContent: {
      flex: 1,
    },
    mealLabel: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedMealLabel: {
      color: theme.colors.primary,
    },
    mealDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    selectedMealDescription: {
      color: theme.colors.textPrimary,
    },
    mealTimeRange: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
    },
    selectedMealTimeRange: {
      color: theme.colors.primary,
    },
    selectionIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedIndicator: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkmark: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    buttonContainer: {
      paddingTop: theme.spacing.lg,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      height: theme.spacing.buttonHeight,
    },
    note: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    noteText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          What meal are you planning? You can select multiple options.
        </Text>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Tip: Select all meals you might be interested in to see more restaurant options
          </Text>
        </View>

        <View style={styles.mealGrid}>
          {MEAL_OPTIONS.map(renderMealCard)}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          buttonStyle={styles.continueButton}
        />
      </View>
    </View>
  )
}

export default MealTypeStep