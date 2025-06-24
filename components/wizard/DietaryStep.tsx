// components/wizard/DietaryStep.tsx - Fixed layout and spacing
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
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
}

const DIETARY_OPTIONS: DietaryOption[] = [
  {
    id: 'vegetarian',
    label: 'Vegetarian Options',
    icon: { name: 'leaf', type: 'font-awesome' },
    description: 'Restaurants with vegetarian-friendly dishes'
  },
  {
    id: 'vegan',
    label: 'Vegan Options',
    icon: { name: 'heart', type: 'feather' },
    description: 'Restaurants with plant-based options'
  },
  {
    id: 'gluten_free',
    label: 'Gluten-Free Options',
    icon: { name: 'shield', type: 'feather' },
    description: 'Restaurants with gluten-free dishes'
  },
  {
    id: 'none',
    label: 'No Dietary Restrictions',
    icon: { name: 'check', type: 'feather' },
    description: 'Show all restaurants without filtering'
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
    
    if (optionId === 'none') {
      // If selecting "none", clear all other options
      updateWizardState({ dietary: ['none'] })
    } else {
      // If selecting a specific dietary option, remove "none"
      const filteredDietary = currentDietary.filter(id => id !== 'none')
      const updatedDietary = filteredDietary.includes(optionId)
        ? filteredDietary.filter(id => id !== optionId)
        : [...filteredDietary, optionId]
      
      updateWizardState({ dietary: updatedDietary })
    }
  }

  const handleContinue = () => {
    onNext()
  }

  const renderDietaryCard = (option: DietaryOption) => {
    const currentDietary = wizardState.dietary || []
    const isSelected = currentDietary.includes(option.id)
    const isDisabled = option.id !== 'none' && currentDietary.includes('none')

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
                  ? theme.colors.textMuted 
                  : isSelected 
                    ? theme.colors.textOnPrimary 
                    : theme.colors.textSecondary
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
          </View>
          
          {isSelected && !isDisabled && (
            <View style={styles.checkIconContainer}>
              <Icon
                name="check-circle"
                type="feather"
                size={20}
                color={theme.colors.primary}
              />
            </View>
          )}
        </View>
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
      textAlign: 'center',
      lineHeight: 22,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
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
    dietaryOptionsContainer: {
      flex: 1,
      paddingBottom: 120, // Extra padding for safe area and tabs
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
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedIconContainer: {
      backgroundColor: theme.colors.primary,
    },
    disabledIconContainer: {
      backgroundColor: theme.colors.border,
    },
    dietaryContent: {
      flex: 1,
    },
    dietaryLabel: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
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
      lineHeight: theme.typography.fontSize.secondary * 1.3,
    },
    selectedDietaryDescription: {
      color: theme.colors.textPrimary,
    },
    disabledDietaryDescription: {
      color: theme.colors.textMuted,
    },
    checkIconContainer: {
      marginLeft: theme.spacing.md,
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
  })

  return (
    <View style={styles.container}>
      {/* Compact header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Any dietary preferences? We'll help you find restaurants with suitable options.
        </Text>
      </View>

      <ScrollView 
        style={styles.dietaryOptionsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Select dietary needs to filter restaurants with appropriate options
          </Text>
        </View>

        {DIETARY_OPTIONS.map(renderDietaryCard)}
      </ScrollView>

      {/* Use original footer with proper safe area padding */}
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

export default DietaryStep