// components/wizard/DietaryStep.tsx - Updated with FontAwesome Pro icons
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button } from '@rneui/themed'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'
import AppIcons from '../../utils/fontAwesome'

interface DietaryStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface DietaryOption {
  id: string
  label: string
  icon: [IconPrefix, IconName]
  description: string
  category: 'dietary' | 'none'
}

// All available dietary options with updated FontAwesome Pro icons (reordered)
const DIETARY_OPTIONS: DietaryOption[] = [
  {
    id: 'none',
    label: 'No Dietary Restrictions',
    icon: AppIcons.NO_RESTRICTIONS,
    description: 'I eat everything',
    category: 'none'
  },
  {
    id: 'vegetarian',
    label: 'Vegetarian Options',
    icon: AppIcons.VEGETARIAN,
    description: 'Restaurants with vegetarian dishes',
    category: 'dietary'
  },
  {
    id: 'vegan',
    label: 'Vegan Options',
    icon: AppIcons.VEGAN,
    description: 'Restaurants with plant-based options',
    category: 'dietary'
  },
  {
    id: 'gluten_free',
    label: 'Gluten-Free Options',
    icon: AppIcons.GLUTEN_FREE,
    description: 'Restaurants with gluten-free dishes',
    category: 'dietary'
  }
]

const DietaryStep: React.FC<DietaryStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()

  const toggleDietaryPreference = (dietaryId: string) => {
    const currentDietary = wizardState.dietary || []
    
    // If selecting "none", clear all other selections
    if (dietaryId === 'none') {
      const updatedDietary = currentDietary.includes('none') ? [] : ['none']
      updateWizardState({ dietary: updatedDietary })
      return
    }
    
    // If selecting a dietary restriction, remove "none" if it's selected
    let updatedDietary = currentDietary.filter(id => id !== 'none')
    
    // Toggle the selected dietary preference
    if (updatedDietary.includes(dietaryId)) {
      updatedDietary = updatedDietary.filter(id => id !== dietaryId)
    } else {
      updatedDietary = [...updatedDietary, dietaryId]
    }
    
    updateWizardState({ dietary: updatedDietary })
  }

  const handleContinue = () => {
    onNext()
  }

  const renderSelectionSummary = () => {
    const selectedCount = wizardState.dietary?.length || 0
    if (selectedCount === 0) return null

    const hasNone = wizardState.dietary?.includes('none')
    const displayText = hasNone 
      ? 'No dietary restrictions'
      : `${selectedCount} dietary preference${selectedCount !== 1 ? 's' : ''} selected`

    return (
      <View style={styles.selectionSummary}>
        <Text style={styles.selectionText}>
          {displayText}
        </Text>
      </View>
    )
  }

  const renderDietaryCard = (dietary: DietaryOption) => {
    const isSelected = wizardState.dietary?.includes(dietary.id) || false

    return (
      <TouchableOpacity
        key={dietary.id}
        style={[
          styles.dietaryCard,
          isSelected && styles.selectedDietaryCard
        ]}
        onPress={() => toggleDietaryPreference(dietary.id)}
        activeOpacity={0.7}
      >
        <View style={styles.dietaryContent}>
          <View style={[
            styles.dietaryIconContainer,
            isSelected && styles.selectedDietaryIconContainer
          ]}>
            <FontAwesomeIcon
              icon={dietary.icon}
              size={24}
              color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          
          <View style={styles.dietaryInfo}>
            <Text style={[
              styles.dietaryLabel,
              isSelected && styles.selectedDietaryLabel
            ]}>
              {dietary.label}
            </Text>
            <Text style={[
              styles.dietaryDescription,
              isSelected && styles.selectedDietaryDescription
            ]}>
              {dietary.description}
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
          We'll show restaurants that accommodate your dietary needs
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
    dietaryGrid: {
      flex: 1,
    },
    dietaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedDietaryCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    dietaryContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: theme.spacing.lg,
    },
    dietaryIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedDietaryIconContainer: {
      backgroundColor: theme.colors.primary + '20',
    },
    dietaryInfo: {
      flex: 1,
    },
    dietaryLabel: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedDietaryLabel: {
      color: theme.colors.primary,
    },
    dietaryDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.fontSize.secondary * 1.3,
    },
    selectedDietaryDescription: {
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
          Any dietary preferences we should know about?
        </Text>
      </View>

      <ScrollView 
        style={styles.dietaryGrid}
        showsVerticalScrollIndicator={false}
      >
        {renderInfoBox()}
        {renderSelectionSummary()}
        {DIETARY_OPTIONS.map(renderDietaryCard)}
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

export default DietaryStep