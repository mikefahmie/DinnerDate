// components/wizard/FeaturesStep.tsx - Updated with FontAwesome Pro icons
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button } from '@rneui/themed'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'
import AppIcons from '../../utils/fontAwesome'

interface FeaturesStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface FeatureOption {
  id: string
  label: string
  icon: [IconPrefix, IconName]
  description: string
  category: 'beverages' | 'amenities' | 'accessibility'
  availableFor?: string[] // Which meal types this feature is available for
  minPriceLevel?: number // Minimum price level for this feature
}

// All available feature options with updated FontAwesome Pro icons
const ALL_FEATURE_OPTIONS: FeatureOption[] = [
  // Beverages
  {
    id: 'serves_wine',
    label: 'Serves Wine',
    icon: AppIcons.WINE,
    description: 'Wine selection available',
    category: 'beverages',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'serves_cocktails',
    label: 'Serves Cocktails',
    icon: AppIcons.COCKTAILS,
    description: 'Cocktail menu available',
    category: 'beverages',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'serves_beer',
    label: 'Serves Beer',
    icon: AppIcons.BEER,
    description: 'Beer selection available',
    category: 'beverages',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'serves_coffee',
    label: 'Serves Coffee',
    icon: AppIcons.COFFEE_SERVICE,
    description: 'Coffee and espresso drinks',
    category: 'beverages',
    minPriceLevel: 1
  },

  // Amenities
  {
    id: 'outdoor_seating',
    label: 'Outdoor Seating',
    icon: AppIcons.OUTDOOR_SEATING,
    description: 'Patio or outdoor dining',
    category: 'amenities',
    minPriceLevel: 1
  },
  {
    id: 'reservable',
    label: 'Takes Reservations',
    icon: AppIcons.RESERVATIONS,
    description: 'Accepts reservations',
    category: 'amenities',
    minPriceLevel: 2
  },
  {
    id: 'live_music',
    label: 'Live Music',
    icon: AppIcons.LIVE_MUSIC,
    description: 'Live performances',
    category: 'amenities',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'allows_dogs',
    label: 'Dog Friendly',
    icon: AppIcons.DOG_FRIENDLY,
    description: 'Pets welcome',
    category: 'amenities',
    minPriceLevel: 1
  },
  {
    id: 'good_for_groups',
    label: 'Good for Groups',
    icon: AppIcons.GROUP_DINING,
    description: 'Accommodates large parties',
    category: 'amenities',
    minPriceLevel: 1
  },
  {
    id: 'family_friendly',
    label: 'Family Friendly',
    icon: AppIcons.FAMILY_FRIENDLY,
    description: 'Great for families with kids',
    category: 'amenities',
    minPriceLevel: 1
  },
  {
    id: 'good_for_sports',
    label: 'Good for Sports',
    icon: AppIcons.SPORTS,
    description: 'TVs and sports viewing',
    category: 'amenities',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  
  // Accessibility
  {
    id: 'wheelchair_accessible',
    label: 'Wheelchair Accessible',
    icon: AppIcons.WHEELCHAIR,
    description: 'Accessible entrance and seating',
    category: 'accessibility',
    minPriceLevel: 1
  },
  {
    id: 'parking_available',
    label: 'Parking Available',
    icon: AppIcons.PARKING,
    description: 'Parking on-site or nearby',
    category: 'accessibility',
    minPriceLevel: 1
  },
  {
    id: 'wifi_available',
    label: 'WiFi Available',
    icon: AppIcons.WIFI,
    description: 'Free WiFi for customers',
    category: 'accessibility',
    minPriceLevel: 1
  },
  {
    id: 'takeout',
    label: 'Takeout Available',
    icon: AppIcons.TAKEOUT,
    description: 'Food available for takeout',
    category: 'accessibility',
    minPriceLevel: 1
  },
  {
    id: 'delivery',
    label: 'Delivery Available',
    icon: AppIcons.DELIVERY,
    description: 'Delivery service available',
    category: 'accessibility',
    minPriceLevel: 1
  }
]

const FeaturesStep: React.FC<FeaturesStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()
  const [availableFeatures, setAvailableFeatures] = useState<FeatureOption[]>([])
  const [showAllFeatures, setShowAllFeatures] = useState(false)

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
      
      // Check budget requirement
      if (feature.minPriceLevel) {
        const budgetMatch = feature.minPriceLevel <= maxBudget
        if (!budgetMatch) return false
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

  const getFeaturesByCategory = (category: string) => {
    return availableFeatures.filter(feature => feature.category === category)
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
            isSelected && styles.selectedFeatureIconContainer
          ]}>
            <FontAwesomeIcon
              icon={feature.icon}
              size={24}
              color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          
          <View style={styles.featureInfo}>
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

  const renderCategorySection = (category: string, title: string) => {
    const categoryFeatures = getFeaturesByCategory(category)
    if (categoryFeatures.length === 0) return null

    // For accessibility category, only show if user wants to see all features
    if (category === 'accessibility' && !showAllFeatures) return null

    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{title}</Text>
        {categoryFeatures.map(renderFeatureCard)}
      </View>
    )
  }

  const renderInfoBox = () => {
    const totalAvailable = availableFeatures.length
    const beveragesCount = getFeaturesByCategory('beverages').length
    const amenitiesCount = getFeaturesByCategory('amenities').length
    const accessibilityCount = getFeaturesByCategory('accessibility').length

    return (
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {totalAvailable} features match your selections
        </Text>
        <Text style={styles.infoSubtext}>
          {beveragesCount} beverage • {amenitiesCount} amenity • {accessibilityCount} accessibility options
        </Text>
      </View>
    )
  }

  const renderSelectionSummary = () => {
    const selectedCount = wizardState.features?.length || 0
    if (selectedCount === 0) return null

    return (
      <View style={styles.selectionSummary}>
        <Text style={styles.selectionText}>
          {selectedCount} feature{selectedCount !== 1 ? 's' : ''} selected
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
      marginBottom: theme.spacing.xs,
    },
    infoSubtext: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      opacity: 0.7,
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
    featuresGrid: {
      flex: 1,
    },
    categorySection: {
      marginBottom: theme.spacing.lg,
    },
    categoryTitle: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      paddingLeft: theme.spacing.sm,
    },
    featureCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedFeatureCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    featureContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: theme.spacing.lg,
    },
    featureIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedFeatureIconContainer: {
      backgroundColor: theme.colors.primary + '20',
    },
    featureInfo: {
      flex: 1,
    },
    featureLabel: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedFeatureLabel: {
      color: theme.colors.primary,
    },
    featureDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.fontSize.secondary * 1.3,
    },
    selectedFeatureDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
    },
    showMoreButton: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    showMoreText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.primary,
      fontWeight: '600',
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
          Looking for anything specific? Select any features that matter to you.
        </Text>
      </View>

      <ScrollView 
        style={styles.featuresGrid}
        showsVerticalScrollIndicator={false}
      >
        {renderInfoBox()}
        {renderSelectionSummary()}
        
        {renderCategorySection('beverages', 'Beverages')}
        {renderCategorySection('amenities', 'Amenities')}
        
        {!showAllFeatures && getFeaturesByCategory('accessibility').length > 0 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllFeatures(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.showMoreText}>
              Show More Features ({getFeaturesByCategory('accessibility').length} more)
            </Text>
          </TouchableOpacity>
        )}
        
        {renderCategorySection('accessibility', 'Accessibility & Services')}
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

export default FeaturesStep