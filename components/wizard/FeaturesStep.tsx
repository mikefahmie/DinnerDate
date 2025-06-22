// components/wizard/FeaturesStep.tsx - Updated with new features and conditional logic
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface FeaturesStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface FeatureOption {
  id: string
  label: string
  icon: { name: string; type: string }
  description: string
  category: 'beverages' | 'amenities' | 'accessibility'
  availableFor?: string[] // If specified, only show for these meal types
  minPriceLevel?: number // If specified, only show for these price levels and above
}

const ALL_FEATURE_OPTIONS: FeatureOption[] = [
  // Beverages
  {
    id: 'serves_beer',
    label: 'Serves Beer',
    icon: { name: 'beer', type: 'font-awesome' },
    description: 'Beer selection available',
    category: 'beverages',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'serves_wine',
    label: 'Serves Wine',
    icon: { name: 'wine-glass', type: 'font-awesome' },
    description: 'Wine list available',
    category: 'beverages',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'serves_cocktails',
    label: 'Serves Cocktails',
    icon: { name: 'cocktail', type: 'font-awesome' },
    description: 'Craft cocktails and mixed drinks',
    category: 'beverages',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'serves_coffee',
    label: 'Serves Coffee',
    icon: { name: 'coffee', type: 'feather' },
    description: 'Coffee and espresso drinks',
    category: 'beverages',
    minPriceLevel: 1
  },
  
  // Amenities
  {
    id: 'reservable',
    label: 'Takes Reservations',
    icon: { name: 'calendar', type: 'feather' },
    description: 'Can make reservations',
    category: 'amenities',
    minPriceLevel: 2
  },
  {
    id: 'outdoor_seating',
    label: 'Outdoor Seating',
    icon: { name: 'sun', type: 'feather' },
    description: 'Patio or outdoor dining',
    category: 'amenities',
    minPriceLevel: 1
  },
  {
    id: 'live_music',
    label: 'Live Music',
    icon: { name: 'music', type: 'feather' },
    description: 'Live entertainment',
    category: 'amenities',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'allows_dogs',
    label: 'Dog Friendly',
    icon: { name: 'heart', type: 'feather' },
    description: 'Pets welcome',
    category: 'amenities',
    minPriceLevel: 1
  },
  {
    id: 'good_for_groups',
    label: 'Good for Groups',
    icon: { name: 'users', type: 'feather' },
    description: 'Large tables and group-friendly',
    category: 'amenities',
    minPriceLevel: 1
  },
  {
    id: 'family_friendly',
    label: 'Family Friendly',
    icon: { name: 'home', type: 'feather' },
    description: 'Great for families with kids',
    category: 'amenities',
    minPriceLevel: 1
  },
  {
    id: 'good_for_sports',
    label: 'Good for Sports',
    icon: { name: 'tv', type: 'feather' },
    description: 'TVs and sports atmosphere',
    category: 'amenities',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  
  // Accessibility
  {
    id: 'wheelchair_accessible',
    label: 'Wheelchair Accessible',
    icon: { name: 'accessibility', type: 'material' },
    description: 'Accessible facilities',
    category: 'accessibility',
    minPriceLevel: 1
  },
  {
    id: 'parking_available',
    label: 'Parking Available',
    icon: { name: 'car', type: 'font-awesome' },
    description: 'Dedicated parking',
    category: 'accessibility',
    minPriceLevel: 1
  },
  {
    id: 'wifi_available',
    label: 'WiFi Available',
    icon: { name: 'wifi', type: 'font-awesome' },
    description: 'Free internet access',
    category: 'accessibility',
    minPriceLevel: 1
  }
]

const CATEGORIES = {
  beverages: 'Beverages',
  amenities: 'Amenities',
  accessibility: 'Accessibility'
}

const FeaturesStep: React.FC<FeaturesStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()
  const [showMoreFeatures, setShowMoreFeatures] = useState(false)
  const [availableFeatures, setAvailableFeatures] = useState<FeatureOption[]>([])

  // Filter features based on selected meal types and budget
  useEffect(() => {
    const selectedMealTypes = wizardState.mealTypes || []
    const selectedBudget = wizardState.budget || [1, 2, 3, 4]
    const maxBudget = Math.max(...selectedBudget)

    const filtered = ALL_FEATURE_OPTIONS.filter(feature => {
      // Check meal type availability
      if (feature.availableFor) {
        const mealTypeMatch = selectedMealTypes.some(mealType => 
          feature.availableFor!.includes(mealType)
        )
        if (!mealTypeMatch) return false
      }
      
      // Check budget compatibility
      if (feature.minPriceLevel && feature.minPriceLevel > maxBudget) {
        return false
      }
      
      return true
    })

    setAvailableFeatures(filtered)
  }, [wizardState.mealTypes, wizardState.budget])

  const toggleFeature = (featureId: string) => {
    const currentFeatures = wizardState.features || []
    const updatedFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter(id => id !== featureId)
      : [...currentFeatures, featureId]
    
    updateWizardState({ features: updatedFeatures })
  }

  const handleContinue = () => {
    onNext()
  }

  const clearAllFeatures = () => {
    updateWizardState({ features: [] })
  }

  const renderFeatureCard = (feature: FeatureOption) => {
    const isSelected = wizardState.features?.includes(feature.id) || false

    return (
      <TouchableOpacity
        key={feature.id}
        style={[
          styles.featureCard,
          isSelected && styles.selectedFeatureCard
        ]}
        onPress={() => toggleFeature(feature.id)}
        activeOpacity={0.7}
      >
        <View style={styles.featureContent}>
          <View style={[
            styles.featureIconContainer,
            isSelected && styles.selectedIconContainer
          ]}>
            <Icon
              name={feature.icon.name}
              type={feature.icon.type}
              size={20}
              color={isSelected ? theme.colors.textOnPrimary : theme.colors.textPrimary}
            />
          </View>
          
          <Text style={[
            styles.featureLabel,
            isSelected && styles.selectedFeatureLabel
          ]}>
            {feature.label}
          </Text>
          
          <Text style={[
            styles.featureDescription,
            isSelected && styles.selectedFeatureDescription
          ]}>
            {feature.description}
          </Text>
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

  const renderFeaturesByCategory = (category: keyof typeof CATEGORIES) => {
    const categoryFeatures = availableFeatures.filter(f => f.category === category)
    
    if (categoryFeatures.length === 0) return null

    return (
      <View key={category} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{CATEGORIES[category]}</Text>
        <View style={styles.featuresGrid}>
          {categoryFeatures.map(renderFeatureCard)}
        </View>
      </View>
    )
  }

  const getVisibleFeatures = () => {
    if (showMoreFeatures) {
      return Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>
    }
    // Show first two categories when collapsed
    return ['beverages', 'amenities']
  }

  const getSelectedCount = () => {
    return wizardState.features?.length || 0
  }

  const selectedCount = getSelectedCount()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.fontSize.body * 1.5,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    infoBox: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    infoText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.secondary * 1.4,
    },
    selectionSummary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    summaryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    summaryCount: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
      color: theme.colors.primary,
      marginRight: theme.spacing.xs,
    },
    summaryText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textPrimary,
    },
    clearButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.error,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    clearButtonTitle: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.error,
      fontWeight: '600',
    },
    categorySection: {
      marginBottom: theme.spacing.xl,
    },
    categoryTitle: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    featureCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
      position: 'relative',
    },
    selectedFeatureCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    featureContent: {
      alignItems: 'center',
      paddingRight: theme.spacing.sm,
    },
    featureIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    selectedIconContainer: {
      backgroundColor: theme.colors.primary,
    },
    featureLabel: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    selectedFeatureLabel: {
      color: theme.colors.primary,
    },
    featureDescription: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.caption * 1.3,
    },
    selectedFeatureDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
    },
    expandButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    expandButtonTitle: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textPrimary,
      fontWeight: '500',
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
          Looking for anything specific? These features match your meal choice and budget.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✨ Optional: Select features that matter to you, or skip to see all restaurants
          </Text>
        </View>

        {selectedCount > 0 && (
          <View style={styles.selectionSummary}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryCount}>{selectedCount}</Text>
              <Text style={styles.summaryText}>
                {selectedCount === 1 ? 'feature selected' : 'features selected'}
              </Text>
            </View>
            <Button
              title="Clear All"
              buttonStyle={styles.clearButton}
              titleStyle={styles.clearButtonTitle}
              onPress={clearAllFeatures}
            />
          </View>
        )}

        {getVisibleFeatures().map((category) => renderFeaturesByCategory(category as keyof typeof CATEGORIES))}

        {!showMoreFeatures && availableFeatures.some(f => f.category === 'accessibility') && (
          <Button
            title="Show More Features"
            buttonStyle={styles.expandButton}
            titleStyle={styles.expandButtonTitle}
            icon={{
              name: 'expand-more',
              type: 'material',
              color: theme.colors.textPrimary,
            }}
            onPress={() => setShowMoreFeatures(true)}
          />
        )}

        {availableFeatures.length === 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              No special features match your current selections. Try adjusting your previous choices or continue to see all restaurants.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Find Restaurants"
          onPress={handleContinue}
          buttonStyle={styles.continueButton}
          titleStyle={styles.continueButtonText}
        />
      </View>
    </View>
  )
}

export default FeaturesStep