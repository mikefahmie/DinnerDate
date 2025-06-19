// components/wizard/FeaturesStep.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
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
  category: 'atmosphere' | 'amenities' | 'accessibility'
}

const FEATURE_OPTIONS: FeatureOption[] = [
  // Atmosphere
  {
    id: 'live_music',
    label: 'Live Music',
    icon: { name: 'music', type: 'font-awesome' },
    description: 'Entertainment while you dine',
    category: 'atmosphere'
  },
  {
    id: 'good_for_watching_sports',
    label: 'Good for Sports',
    icon: { name: 'tv', type: 'font-awesome' },
    description: 'TVs and sports atmosphere',
    category: 'atmosphere'
  },
  {
    id: 'good_for_groups',
    label: 'Good for Groups',
    icon: { name: 'users', type: 'font-awesome' },
    description: 'Large tables and group-friendly',
    category: 'atmosphere'
  },
  {
    id: 'good_for_children',
    label: 'Good for Kids',
    icon: { name: 'child', type: 'font-awesome' },
    description: 'Family-friendly environment',
    category: 'atmosphere'
  },
  
  // Amenities
  {
    id: 'outdoor_seating',
    label: 'Outdoor Seating',
    icon: { name: 'tree', type: 'font-awesome' },
    description: 'Patio or outdoor dining',
    category: 'amenities'
  },
  {
    id: 'allows_dogs',
    label: 'Dog Friendly',
    icon: { name: 'paw', type: 'font-awesome' },
    description: 'Pets welcome',
    category: 'amenities'
  },
  {
    id: 'reservable',
    label: 'Takes Reservations',
    icon: { name: 'calendar-check-o', type: 'font-awesome' },
    description: 'Can book ahead',
    category: 'amenities'
  },
  {
    id: 'parking_available',
    label: 'Parking Available',
    icon: { name: 'car', type: 'font-awesome' },
    description: 'Dedicated parking',
    category: 'amenities'
  },
  
  // Accessibility
  {
    id: 'wheelchair_accessible',
    label: 'Accessible',
    icon: { name: 'wheelchair', type: 'font-awesome' },
    description: 'Wheelchair accessible',
    category: 'accessibility'
  },
  {
    id: 'wifi_available',
    label: 'WiFi Available',
    icon: { name: 'wifi', type: 'font-awesome' },
    description: 'Free internet access',
    category: 'accessibility'
  }
]

const CATEGORIES = {
  atmosphere: 'Atmosphere',
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

        <View style={[
          styles.selectionIndicator,
          isSelected && styles.selectedIndicator
        ]}>
          <Text style={styles.checkmark}>
            {isSelected ? '✓' : ''}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderFeaturesByCategory = (category: keyof typeof CATEGORIES) => {
    const categoryFeatures = FEATURE_OPTIONS.filter(f => f.category === category)
    
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
    // Show first 6 features when collapsed
    return ['atmosphere']
  }

  const getSelectedCount = () => {
    return wizardState.features?.length || 0
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.screenPadding,
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    selectionSummary: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLeft: {
      flex: 1,
    },
    summaryCount: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    summaryText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
    },
    clearButton: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
    },
    clearButtonTitle: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.error,
    },
    categorySection: {
      marginBottom: theme.spacing.lg,
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
      paddingRight: theme.spacing.sm, // Make room for selection indicator
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
    featureIcon: {
      // Removed - now using Icon component
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
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 16,
    },
    selectedFeatureDescription: {
      color: theme.colors.textSecondary,
    },
    selectionIndicator: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedIndicator: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkmark: {
      color: theme.colors.textOnPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    expandButton: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    expandButtonTitle: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.fontSize.secondary,
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
  })

  const selectedCount = getSelectedCount()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Looking for anything specific? These features help us find restaurants that match your needs.
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

        {!showMoreFeatures && (
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
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Find Restaurants"
          onPress={handleContinue}
          buttonStyle={styles.continueButton}
        />
      </View>
    </View>
  )
}

export default FeaturesStep