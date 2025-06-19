// components/wizard/DietaryStep.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface DietaryStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface DietaryOption {
  id: string
  label: string
  icon: { name: string; type: string }
  description: string
  note?: string
}

const DIETARY_OPTIONS: DietaryOption[] = [
  {
    id: 'vegetarian',
    label: 'Vegetarian Options',
    icon: { name: 'leaf', type: 'font-awesome' },
    description: 'Plant-based dishes available',
    note: 'Restaurants with dedicated vegetarian menu items'
  },
  {
    id: 'vegan',
    label: 'Vegan Options',
    icon: { name: 'envira', type: 'font-awesome' },
    description: 'Completely plant-based meals',
    note: 'No animal products or byproducts'
  },
  {
    id: 'gluten_free',
    label: 'Gluten-Free Options',
    icon: { name: 'ban', type: 'font-awesome' },
    description: 'Gluten-free menu items',
    note: 'Suitable for celiac and gluten sensitivity'
  },
  {
    id: 'none',
    label: 'No Specific Needs',
    icon: { name: 'cutlery', type: 'font-awesome' },
    description: 'All menu options work for me',
    note: 'Show all restaurants regardless of dietary options'
  }
]

const DietaryStep: React.FC<DietaryStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()

  const toggleDietaryOption = (optionId: string) => {
    const currentDietary = wizardState.dietary || []
    
    // If selecting "none", clear all others
    if (optionId === 'none') {
      updateWizardState({ dietary: ['none'] })
      return
    }
    
    // If selecting any specific option, remove "none"
    const filteredDietary = currentDietary.filter(id => id !== 'none')
    
    const updatedDietary = filteredDietary.includes(optionId)
      ? filteredDietary.filter(id => id !== optionId)
      : [...filteredDietary, optionId]
    
    updateWizardState({ dietary: updatedDietary })
  }

  const handleContinue = () => {
    onNext()
  }

  const renderDietaryCard = (option: DietaryOption) => {
    const isSelected = wizardState.dietary?.includes(option.id) || false
    const isNoneSelected = wizardState.dietary?.includes('none') || false
    const isDisabled = isNoneSelected && option.id !== 'none'

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.dietaryCard,
          isSelected && styles.selectedDietaryCard,
          isDisabled && styles.disabledDietaryCard
        ]}
        onPress={() => !isDisabled && toggleDietaryOption(option.id)}
        activeOpacity={isDisabled ? 1 : 0.7}
        disabled={isDisabled}
      >
        <View style={styles.dietaryHeader}>
          <View style={[
            styles.dietaryIconContainer,
            isSelected && styles.selectedIconContainer,
            isDisabled && styles.disabledIconContainer
          ]}>
            <Icon
              name={option.icon.name}
              type={option.icon.type}
              size={24}
              color={
                isDisabled 
                  ? theme.colors.disabled 
                  : isSelected 
                    ? theme.colors.textOnPrimary 
                    : theme.colors.textPrimary
              }
            />
          </View>
          
          <View style={styles.dietaryContent}>
            <Text style={[
              styles.dietaryLabel,
              isSelected && styles.selectedDietaryLabel,
              isDisabled && styles.disabledDietaryLabel
            ]}>
              {option.label}
            </Text>
            <Text style={[
              styles.dietaryDescription,
              isSelected && styles.selectedDietaryDescription,
              isDisabled && styles.disabledDietaryDescription
            ]}>
              {option.description}
            </Text>
            {option.note && (
              <Text style={[
                styles.dietaryNote,
                isSelected && styles.selectedDietaryNote,
                isDisabled && styles.disabledDietaryNote
              ]}>
                {option.note}
              </Text>
            )}
          </View>

          <View style={[
            styles.selectionIndicator,
            isSelected && styles.selectedIndicator,
            isDisabled && styles.disabledIndicator
          ]}>
            <Text style={styles.checkmark}>
              {isSelected ? '✓' : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const getSelectedCount = () => {
    const dietary = wizardState.dietary || []
    return dietary.includes('none') ? 0 : dietary.length
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
    dietaryGrid: {
      marginBottom: theme.spacing.xl,
    },
    dietaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedDietaryCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    disabledDietaryCard: {
      opacity: 0.5,
      backgroundColor: theme.colors.surfaceElevated,
    },
    dietaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dietaryIconContainer: {
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
    disabledIconContainer: {
      backgroundColor: theme.colors.disabled,
    },
    dietaryIcon: {
      // Removed - now using Icon component
    },
    dietaryContent: {
      flex: 1,
    },
    dietaryLabel: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedDietaryLabel: {
      color: theme.colors.primary,
    },
    disabledDietaryLabel: {
      color: theme.colors.textMuted,
    },
    dietaryDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    selectedDietaryDescription: {
      color: theme.colors.textPrimary,
    },
    disabledDietaryDescription: {
      color: theme.colors.textMuted,
    },
    dietaryNote: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      fontStyle: 'italic',
    },
    selectedDietaryNote: {
      color: theme.colors.textSecondary,
    },
    disabledDietaryNote: {
      color: theme.colors.disabled,
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
    disabledIndicator: {
      borderColor: theme.colors.disabled,
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
    infoBox: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    infoText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
    selectionSummary: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    summaryCount: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
  })

  const selectedCount = getSelectedCount()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Do you have any dietary preferences or restrictions? This helps us show relevant menu options.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Select "No Specific Needs" to see all restaurants, or choose dietary options to filter for suitable places
          </Text>
        </View>

        {selectedCount > 0 && (
          <View style={styles.selectionSummary}>
            <Text style={styles.summaryCount}>{selectedCount}</Text>
            <Text style={styles.summaryText}>
              dietary {selectedCount === 1 ? 'preference' : 'preferences'} selected
            </Text>
          </View>
        )}

        <View style={styles.dietaryGrid}>
          {DIETARY_OPTIONS.map(renderDietaryCard)}
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

export default DietaryStep