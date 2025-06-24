// components/wizard/MealTypeStep.tsx - Updated without time restrictions
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
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
}

const MEAL_OPTIONS: MealOption[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    icon: { name: 'coffee', type: 'feather' },
    description: 'Start your day right'
  },
  {
    id: 'lunch',
    label: 'Lunch',
    icon: { name: 'sun', type: 'feather' },
    description: 'Midday meals and quick bites'
  },
  {
    id: 'dinner',
    label: 'Dinner',
    icon: { name: 'moon', type: 'feather' },
    description: 'Evening dining experiences'
  },
  {
    id: 'coffee',
    label: 'Coffee',
    icon: { name: 'coffee', type: 'font-awesome' },
    description: 'Coffee shops and cafes'
  },
  {
    id: 'dessert',
    label: 'Dessert',
    icon: { name: 'birthday-cake', type: 'font-awesome' },
    description: 'Sweet treats and desserts'
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
    // Ensure at least one meal type is selected
    if (wizardState.mealTypes?.length > 0) {
      onNext()
    }
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
        <View style={styles.mealContent}>
          <View style={[
            styles.mealIconContainer,
            isSelected && styles.selectedIconContainer
          ]}>
            <Icon
              name={meal.icon.name}
              type={meal.icon.type}
              size={24}
              color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary}
            />
          </View>
          
          <View style={styles.mealInfo}>
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
          </View>
        </View>
        
        {isSelected && (
          <View style={styles.checkIconContainer}>
            <Icon
              name="check-circle"
              type="feather"
              size={20}
              color={theme.colors.primary}
            />
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    scrollContainer: {
      flex: 1,
    },
    // Compact header styling to match LocationStep
    header: {
      marginTop: 8,
      marginBottom: 12,
      alignItems: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    note: {
      backgroundColor: theme.colors.accent + '15',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    noteText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.caption * 1.4,
    },
    mealGrid: {
      flex: 1,
      paddingBottom: 120, // Extra padding for safe area and tabs
    },
    mealCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
      position: 'relative',
    },
    selectedMealCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    mealContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mealIconContainer: {
      width: 50,
      height: 50,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedIconContainer: {
      backgroundColor: theme.colors.primary,
    },
    mealInfo: {
      flex: 1,
    },
    mealLabel: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedMealLabel: {
      color: theme.colors.primary,
    },
    mealDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
    },
    selectedMealDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
    },
    // Footer button styling - positioned above safe area
    footer: {
      paddingVertical: 10,
      paddingBottom: 100, // Much more padding for tabs + safe area
    },
    continueButton: {
      marginBottom: 8,
      paddingHorizontal: 24,
      borderRadius: 12,
      minHeight: 52,
      backgroundColor: theme.colors.primary,
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
    continueButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    continueButtonTextDisabled: {
      color: theme.colors.textMuted,
    },
  })

  const hasSelection = wizardState.mealTypes?.length > 0

  return (
    <View style={styles.container}>
      {/* Compact header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          What meal are you planning? You can select multiple options to see more restaurant choices.
        </Text>
      </View>

      <ScrollView 
        style={styles.mealGrid}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Tip: Select all meals you might be interested in to see more restaurant options
          </Text>
        </View>

        {MEAL_OPTIONS.map(renderMealCard)}
      </ScrollView>

      {/* Use original footer with proper safe area padding */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!hasSelection}
          buttonStyle={[
            styles.continueButton,
            !hasSelection && styles.continueButtonDisabled
          ]}
          titleStyle={[
            styles.continueButtonText,
            !hasSelection && styles.continueButtonTextDisabled
          ]}
        />
      </View>
    </View>
  )
}

export default MealTypeStep