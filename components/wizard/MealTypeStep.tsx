// components/wizard/MealTypeStep.tsx - Added coffee/dessert + fixed layout
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
    id: 'coffee',
    label: 'Coffee & Drinks',
    icon: { name: 'coffee', type: 'feather' },
    description: 'Cafés and coffee shops',
    timeRange: 'All day'
  },
  {
    id: 'dessert',
    label: 'Dessert',
    icon: { name: 'gift', type: 'feather' },
    description: 'Sweet treats and desserts',
    timeRange: 'After meals'
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
        <View style={[
          styles.mealIconContainer,
          isSelected && styles.selectedIconContainer
        ]}>
          <Icon
            name={meal.icon.name}
            type={meal.icon.type}
            size={24}
            color={isSelected ? theme.colors.textOnPrimary : theme.colors.textPrimary}
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

        {isSelected && (
          <View style={styles.checkIconContainer}>
            <Icon
              name="check-circle"
              type="feather"
              size={24}
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
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    content: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: theme.typography.fontSize.body * 1.5,
      paddingHorizontal: theme.spacing.md,
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
    selectedIconContainer: {
      backgroundColor: theme.colors.primary,
    },
    mealContent: {
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
    checkIconContainer: {
      marginLeft: theme.spacing.md,
    },
    buttonContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
    },
    continueButtonText: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
  })

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.subtitle}>
          What meal are you planning? You can select multiple options to see more restaurant choices.
        </Text>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Tip: Select all meals you might be interested in to see more restaurant options
          </Text>
        </View>

        <View style={styles.mealGrid}>
          {MEAL_OPTIONS.map(renderMealCard)}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
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