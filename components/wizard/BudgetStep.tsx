// components/wizard/BudgetStep.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Button, Slider } from '@rneui/themed'
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
  description: string
  range: string
}

const PRICE_LEVELS: PriceLevel[] = [
  {
    level: 1,
    symbol: '$',
    label: 'Budget-Friendly',
    description: 'Quick bites and casual spots',
    range: 'Under $15'
  },
  {
    level: 2,
    symbol: '$$',
    label: 'Moderate',
    description: 'Good value dining',
    range: '$15 - $30'
  },
  {
    level: 3,
    symbol: '$$$',
    label: 'Upscale',
    description: 'Fine dining experience',
    range: '$30 - $60'
  },
  {
    level: 4,
    symbol: '$$$$',
    label: 'Luxury',
    description: 'Premium establishments',
    range: '$60+'
  }
]

const BudgetStep: React.FC<BudgetStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()

  const handleBudgetChange = (value: number) => {
    // For now, just update the max value, keep min at 1
    updateWizardState({ budget: [1, value] })
  }

  const handlePresetSelect = (minLevel: number, maxLevel: number) => {
    updateWizardState({ budget: [minLevel, maxLevel] })
  }

  const handleContinue = () => {
    onNext()
  }

  const getBudgetRangeText = () => {
    const [min, max] = wizardState.budget || [1, 4]
    if (min === max) {
      const level = PRICE_LEVELS.find(p => p.level === min)
      return `${level?.symbol} ${level?.label}`
    }
    
    const minLevel = PRICE_LEVELS.find(p => p.level === min)
    const maxLevel = PRICE_LEVELS.find(p => p.level === max)
    return `${minLevel?.symbol} to ${maxLevel?.symbol}`
  }

  const renderPriceLevelCard = (priceLevel: PriceLevel) => {
    const [min, max] = wizardState.budget || [1, 4]
    const isInRange = priceLevel.level >= min && priceLevel.level <= max
    
    return (
      <TouchableOpacity
        key={priceLevel.level}
        style={[
          styles.priceLevelCard,
          isInRange && styles.selectedPriceLevelCard
        ]}
        onPress={() => handlePresetSelect(priceLevel.level, priceLevel.level)}
        activeOpacity={0.7}
      >
        <View style={styles.priceLevelHeader}>
          <View style={[
            styles.symbolContainer,
            isInRange && styles.selectedSymbolContainer
          ]}>
            <Text style={[
              styles.priceSymbol,
              isInRange && styles.selectedPriceSymbol
            ]}>
              {priceLevel.symbol}
            </Text>
          </View>
          
          <View style={styles.priceLevelContent}>
            <Text style={[
              styles.priceLevelLabel,
              isInRange && styles.selectedPriceLevelLabel
            ]}>
              {priceLevel.label}
            </Text>
            <Text style={[
              styles.priceLevelDescription,
              isInRange && styles.selectedPriceLevelDescription
            ]}>
              {priceLevel.description}
            </Text>
            <Text style={[
              styles.priceRange,
              isInRange && styles.selectedPriceRange
            ]}>
              {priceLevel.range}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderQuickPresets = () => {
    const presets = [
      { label: 'Any Budget', min: 1, max: 4 },
      { label: 'Budget & Moderate', min: 1, max: 2 },
      { label: 'Moderate & Upscale', min: 2, max: 3 },
      { label: 'Upscale Only', min: 3, max: 3 },
    ]

    return (
      <View style={styles.presetsContainer}>
        <Text style={styles.presetsTitle}>Quick Selections</Text>
        <View style={styles.presetsGrid}>
          {presets.map((preset, index) => {
            const [min, max] = wizardState.budget || [1, 4]
            const isSelected = min === preset.min && max === preset.max
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetChip,
                  isSelected && styles.selectedPresetChip
                ]}
                onPress={() => handlePresetSelect(preset.min, preset.max)}
              >
                <Text style={[
                  styles.presetChipText,
                  isSelected && styles.selectedPresetChipText
                ]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
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
    sliderContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.small,
    },
    sliderTitle: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    budgetRangeText: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    sliderWrapper: {
      marginHorizontal: theme.spacing.md,
    },
    sliderLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    sliderLabel: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
    },
    presetsContainer: {
      marginBottom: theme.spacing.lg,
    },
    presetsTitle: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    presetsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    presetChip: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: '48%',
      alignItems: 'center',
    },
    selectedPresetChip: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    presetChipText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    selectedPresetChipText: {
      color: theme.colors.textOnPrimary,
    },
    priceLevelsContainer: {
      marginBottom: theme.spacing.lg,
    },
    priceLevelsTitle: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    priceLevelCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectedPriceLevelCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
    },
    priceLevelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    symbolContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedSymbolContainer: {
      backgroundColor: theme.colors.primary,
    },
    priceSymbol: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    selectedPriceSymbol: {
      color: theme.colors.textOnPrimary,
    },
    priceLevelContent: {
      flex: 1,
    },
    priceLevelLabel: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedPriceLevelLabel: {
      color: theme.colors.primary,
    },
    priceLevelDescription: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    selectedPriceLevelDescription: {
      color: theme.colors.textPrimary,
    },
    priceRange: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },
    selectedPriceRange: {
      color: theme.colors.primary,
    },
    buttonContainer: {
      paddingTop: theme.spacing.lg,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      height: theme.spacing.buttonHeight,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          What's your budget range? You can adjust this to see restaurants that fit your spending comfort.
        </Text>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderTitle}>Budget Range</Text>
          <Text style={styles.budgetRangeText}>{getBudgetRangeText()}</Text>
          
          <View style={styles.sliderWrapper}>
          <Slider
            value={wizardState.budget?.[1] || 4}
            onValueChange={handleBudgetChange}
            minimumValue={1}
            maximumValue={4}
            step={1}
            allowTouchTrack
            trackStyle={{ height: 6, backgroundColor: theme.colors.border }}
            thumbStyle={{ backgroundColor: theme.colors.primary, width: 20, height: 20 }}
          />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>$</Text>
              <Text style={styles.sliderLabel}>$$</Text>
              <Text style={styles.sliderLabel}>$$$</Text>
              <Text style={styles.sliderLabel}>$$$$</Text>
            </View>
          </View>
        </View>

        {renderQuickPresets()}

        <View style={styles.priceLevelsContainer}>
          <Text style={styles.priceLevelsTitle}>Price Level Guide</Text>
          {PRICE_LEVELS.map(renderPriceLevelCard)}
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

export default BudgetStep