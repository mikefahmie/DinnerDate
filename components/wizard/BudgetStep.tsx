// components/wizard/BudgetStep.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface BudgetStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface PriceLevel {
  level: number
  symbol: string
  label: string
  range: string
  examples: string[]
  description: string
}

const PRICE_LEVELS: PriceLevel[] = [
  {
    level: 1,
    symbol: '$',
    label: 'Budget-Friendly',
    range: 'Under $15',
    examples: ['Fast food', 'Food trucks', 'Quick bites'],
    description: 'Great for casual meals and quick eats'
  },
  {
    level: 2,
    symbol: '$$',
    label: 'Moderate',
    range: '$15 - $30',
    examples: ['Casual dining', 'Chain restaurants', 'Local favorites'],
    description: 'Perfect for everyday dining out'
  },
  {
    level: 3,
    symbol: '$$$',
    label: 'Upscale',
    range: '$30 - $50',
    examples: ['Fine dining', 'Specialty cuisine', 'Date night spots'],
    description: 'Special occasions and premium experiences'
  },
  {
    level: 4,
    symbol: '$$$$',
    label: 'Premium',
    range: '$50+',
    examples: ['High-end restaurants', 'Chef-driven', 'Luxury dining'],
    description: 'The finest dining experiences'
  }
]

const BudgetStep: React.FC<BudgetStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()

  const togglePriceLevel = (level: number) => {
    const currentBudget = wizardState.budget || []
    const isSelected = currentBudget.includes(level)
    
    if (isSelected) {
      // Remove the level if it's already selected
      const newBudget = currentBudget.filter(l => l !== level)
      updateWizardState({ budget: newBudget })
    } else {
      // Add the level if it's not selected
      const newBudget = [...currentBudget, level].sort((a, b) => a - b)
      updateWizardState({ budget: newBudget })
    }
  }

  const handleContinue = () => {
    // If no budget selected, default to all levels
    if (!wizardState.budget || wizardState.budget.length === 0) {
      updateWizardState({ budget: [1, 2, 3, 4] })
    }
    onNext()
  }

  const handleQuickSelect = (levels: number[]) => {
    updateWizardState({ budget: levels })
  }

  const isPriceLevelSelected = (level: number): boolean => {
    return (wizardState.budget || []).includes(level)
  }

  const renderQuickSelects = () => {
    const quickSelections = [
      { label: 'Budget-friendly', levels: [1, 2] },
      { label: 'All prices', levels: [1, 2, 3, 4] }
    ]

    return (
      <View style={styles.quickSelectsContainer}>
        {quickSelections.map((selection, index) => {
          const isActive = JSON.stringify(wizardState.budget?.sort()) === JSON.stringify(selection.levels.sort())
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickSelectChip,
                isActive && styles.activeQuickSelectChip
              ]}
              onPress={() => handleQuickSelect(selection.levels)}
            >
              <Text style={[
                styles.quickSelectText,
                isActive && styles.activeQuickSelectText
              ]}>
                {selection.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  const renderPriceLevelCard = (priceLevel: PriceLevel) => {
    const isSelected = isPriceLevelSelected(priceLevel.level)
    
    return (
      <TouchableOpacity
        key={priceLevel.level}
        style={[
          styles.priceLevelCard,
          isSelected && styles.selectedPriceLevelCard
        ]}
        onPress={() => togglePriceLevel(priceLevel.level)}
        activeOpacity={0.7}
      >
        <View style={styles.priceLevelHeader}>
          <View style={[
            styles.priceSymbolContainer,
            isSelected && styles.selectedPriceSymbolContainer
          ]}>
            <Text style={[
              styles.priceSymbol,
              isSelected && styles.selectedPriceSymbol
            ]}>
              {priceLevel.symbol}
            </Text>
          </View>
          
          <View style={styles.priceLevelInfo}>
            <View style={styles.priceLevelTitleRow}>
              <Text style={[
                styles.priceLevelLabel,
                isSelected && styles.selectedPriceLevelLabel
              ]}>
                {priceLevel.label}
              </Text>
              {isSelected && (
                <Icon
                  name="check-circle"
                  type="feather"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </View>
            <Text style={[
              styles.priceLevelRange,
              isSelected && styles.selectedPriceLevelRange
            ]}>
              {priceLevel.range}
            </Text>
          </View>
        </View>
        
        <Text style={[
          styles.priceLevelDescription,
          isSelected && styles.selectedPriceLevelDescription
        ]}>
          {priceLevel.description}
        </Text>
        
        <View style={styles.examplesContainer}>
          {priceLevel.examples.map((example, index) => (
            <View key={index} style={[
              styles.exampleChip,
              isSelected && styles.selectedExampleChip
            ]}>
              <Text style={[
                styles.exampleText,
                isSelected && styles.selectedExampleText
              ]}>
                {example}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
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
    quickSelectsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    quickSelectChip: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    activeQuickSelectChip: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    quickSelectText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    activeQuickSelectText: {
      color: theme.colors.textOnPrimary,
    },
    priceLevelsContainer: {
      flex: 1,
      paddingBottom: 120, // Extra padding for safe area and tabs
    },
    priceLevelCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedPriceLevelCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    priceLevelHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    priceSymbolContainer: {
      width: 50,
      height: 50,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedPriceSymbolContainer: {
      backgroundColor: theme.colors.primary,
    },
    priceSymbol: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    selectedPriceSymbol: {
      color: theme.colors.textOnPrimary,
    },
    priceLevelInfo: {
      flex: 1,
    },
    priceLevelTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    priceLevelLabel: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    selectedPriceLevelLabel: {
      color: theme.colors.primary,
    },
    priceLevelRange: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    selectedPriceLevelRange: {
      color: theme.colors.primary + '80', // 50% opacity
    },
    priceLevelDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      lineHeight: theme.typography.fontSize.secondary * 1.4,
    },
    selectedPriceLevelDescription: {
      color: theme.colors.textPrimary,
    },
    examplesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    exampleChip: {
      backgroundColor: theme.colors.border + '40', // 25% opacity
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    selectedExampleChip: {
      backgroundColor: theme.colors.primary + '20', // 12% opacity
    },
    exampleText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    selectedExampleText: {
      color: theme.colors.primary,
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
          What's your budget range? You can select multiple price levels to see more options.
        </Text>
      </View>

      <ScrollView 
        style={styles.priceLevelsContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderQuickSelects()}
        {PRICE_LEVELS.map(renderPriceLevelCard)}
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

export default BudgetStep