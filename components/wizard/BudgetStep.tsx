// components/wizard/BudgetStep.tsx - Clean version with no syntax errors
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button } from '@rneui/themed'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'
import AppIcons from '../../utils/fontAwesome'

interface BudgetStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface BudgetOption {
  id: number
  label: string
  icon: [IconPrefix, IconName]
  description: string
  range: string
  examples: string[]
}

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    id: 1,
    label: '$r',
    icon: AppIcons.DOLLAR,
    description: 'Budget-friendly',
    range: 'Under $15 per person',
    examples: ['Fast food', 'Coffee shops', 'Casual dining']
  },
  {
    id: 2,
    label: '$$',
    icon: AppIcons.MONEY,
    description: 'Moderate',
    range: '$15-30 per person',
    examples: ['Family restaurants', 'Pubs', 'Chain restaurants']
  },
  {
    id: 3,
    label: '$$$',
    icon: AppIcons.MONEY,
    description: 'Higher-end',
    range: '$30-50 per person',
    examples: ['Fine dining', 'Steakhouses', 'Upscale bistros']
  },
  {
    id: 4,
    label: '$$$$',
    icon: AppIcons.MONEY,
    description: 'Premium',
    range: '$50+ per person',
    examples: ['Luxury dining', 'High-end steakhouses', 'Celebrity chef restaurants']
  }
]

const BudgetStep: React.FC<BudgetStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()

  const toggleBudgetLevel = (budgetId: number) => {
    const currentBudget = wizardState.budget || []
    const updatedBudget = currentBudget.includes(budgetId)
      ? currentBudget.filter(id => id !== budgetId)
      : [...currentBudget, budgetId].sort()
    
    updateWizardState({ budget: updatedBudget })
  }

  const handleSelectAll = () => {
    updateWizardState({ budget: [1, 2, 3, 4] })
  }

  const handleContinue = () => {
    onNext()
  }

  const renderSelectionSummary = () => {
    const selectedCount = wizardState.budget?.length || 0
    if (selectedCount === 0) return null

    const selectedLabels = wizardState.budget
      ?.sort()
      .map(id => BUDGET_OPTIONS.find(opt => opt.id === id)?.label)
      .join(', ')

    return (
      <View style={styles.selectionSummary}>
        <Text style={styles.selectionText}>
          Selected: {selectedLabels}
        </Text>
      </View>
    )
  }

  const renderBudgetCard = (budget: BudgetOption) => {
    const isSelected = wizardState.budget?.includes(budget.id) || false

    return (
      <TouchableOpacity
        key={budget.id}
        style={[
          styles.budgetCard,
          isSelected && styles.selectedBudgetCard
        ]}
        onPress={() => toggleBudgetLevel(budget.id)}
        activeOpacity={0.7}
      >
        <View style={styles.budgetContent}>
          <View style={[
            styles.budgetIconContainer,
            isSelected && styles.selectedBudgetIconContainer
          ]}>
            <FontAwesomeIcon
              icon={budget.icon}
              size={24}
              color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          
          <View style={styles.budgetInfo}>
            <View style={styles.budgetHeader}>
              <Text style={[
                styles.budgetLabel,
                isSelected && styles.selectedBudgetLabel
              ]}>
                {budget.label}
              </Text>
              <Text style={[
                styles.budgetDescription,
                isSelected && styles.selectedBudgetDescription
              ]}>
                {budget.description}
              </Text>
            </View>
            
            <Text style={[
              styles.budgetRange,
              isSelected && styles.selectedBudgetRange
            ]}>
              {budget.range}
            </Text>
            
            <Text style={[
              styles.budgetExamples,
              isSelected && styles.selectedBudgetExamples
            ]}>
              {budget.examples.join(' • ')}
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
          Select your price range(s) per person. You can choose multiple levels to see more options.
        </Text>
      </View>
    )
  }

  const renderQuickActions = () => {
    return (
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleSelectAll}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionText}>Select All Prices</Text>
        </TouchableOpacity>
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
    quickActions: {
      marginBottom: theme.spacing.md,
      alignItems: 'center',
    },
    quickActionButton: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quickActionText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    budgetGrid: {
      flex: 1,
    },
    budgetCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedBudgetCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    budgetContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingRight: theme.spacing.lg,
    },
    budgetIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    selectedBudgetIconContainer: {
      backgroundColor: theme.colors.primary + '20',
    },
    budgetInfo: {
      flex: 1,
    },
    budgetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    budgetLabel: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginRight: theme.spacing.sm,
    },
    selectedBudgetLabel: {
      color: theme.colors.primary,
    },
    budgetDescription: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    selectedBudgetDescription: {
      color: theme.colors.primary,
    },
    budgetRange: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
      fontWeight: '500',
    },
    selectedBudgetRange: {
      color: theme.colors.primary,
    },
    budgetExamples: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.fontSize.secondary * 1.3,
    },
    selectedBudgetExamples: {
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
          What's your budget per person?
        </Text>
      </View>

      <ScrollView 
        style={styles.budgetGrid}
        showsVerticalScrollIndicator={false}
      >
        {renderInfoBox()}
        {renderSelectionSummary()}
        {renderQuickActions()}
        {BUDGET_OPTIONS.map(renderBudgetCard)}
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

export default BudgetStep