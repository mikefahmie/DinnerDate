// components/wizard/MealTypeStep.tsx - Updated with FontAwesome Pro icons
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button } from '@rneui/themed'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'
import AppIcons from '../../utils/fontAwesome'

interface MealTypeStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface MealOption {
  id: string
  label: string
  icon: [IconPrefix, IconName]
  description: string
  maps_to: string // Database field mapping
}

const MEAL_OPTIONS: MealOption[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    icon: AppIcons.BREAKFAST,
    description: 'Morning meal',
    maps_to: 'serves_breakfast'
  },
  {
    id: 'lunch',
    label: 'Lunch',
    icon: AppIcons.LUNCH,
    description: 'Midday meal',
    maps_to: 'serves_lunch'
  },
  {
    id: 'dinner',
    label: 'Dinner',
    icon: AppIcons.DINNER,
    description: 'Evening meal',
    maps_to: 'serves_dinner'
  },
  {
    id: 'coffee',
    label: 'Coffee',
    icon: AppIcons.COFFEE,
    description: 'Coffee shops and cafes',
    maps_to: 'serves_coffee'
  },
  {
    id: 'dessert',
    label: 'Dessert',
    icon: AppIcons.DESSERT,
    description: 'Sweet treats',
    maps_to: 'serves_dessert'
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

  const renderSelectionSummary = () => {
    const selectedCount = wizardState.mealTypes?.length || 0
    if (selectedCount === 0) return null

    return (
      <View style={styles.selectionSummary}>
        <Text style={styles.selectionText}>
          {selectedCount} meal type{selectedCount !== 1 ? 's' : ''} selected
        </Text>
      </View>
    )
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
            isSelected && styles.selectedMealIconContainer
          ]}>
            <FontAwesomeIcon
              icon={meal.icon}
              size={24}
              color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
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
            <FontAwesomeIcon
              icon={AppIcons.CHECK}
              size={20}
              color={theme.colors.primary}
            />
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderInfoBox = () => {
    return (
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Select all meal types you're interested in. This helps us show relevant restaurants and cuisines.
        </Text>
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    header: {
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    infoBox: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    infoText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    selectionSummary: {
      backgroundColor: theme.colors.primary + '15',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      alignItems: 'center',
    },
    selectionText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    mealGrid: {
      flex: 1,
    },
    mealCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedMealCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    mealContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: theme.spacing.lg,
    },
    mealIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedMealIconContainer: {
      backgroundColor: theme.colors.primary + '20',
    },
    mealInfo: {
      flex: 1,
    },
    mealLabel: {
      fontSize: theme.typography.fontSize.body,
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
      lineHeight: theme.typography.fontSize.secondary * 1.3,
    },
    selectedMealDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
    },
    footer: {
      paddingVertical: 10,
      paddingBottom: 100,
    },
    continueButton: {
      marginBottom: 10,
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
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          What meal are you planning? You can select multiple options.
        </Text>
      </View>

      <ScrollView 
        style={styles.mealGrid}
        showsVerticalScrollIndicator={false}
      >
        {renderInfoBox()}
        {renderSelectionSummary()}
        {MEAL_OPTIONS.map(renderMealCard)}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          buttonStyle={styles.continueButton}
          titleStyle={styles.continueButtonText}
        />
      </View>
    </View>
  )
}

export default MealTypeStep