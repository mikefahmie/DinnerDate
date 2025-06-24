// components/wizard/CuisineStep.tsx - New cuisine filtering step
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface CuisineStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface CuisineOption {
  id: string
  label: string
  icon: { name: string; type: string }
  description: string
  availableFor: string[] // Which meal types this cuisine is available for
  minPriceLevel: number // Minimum price level for this cuisine
}

// All available cuisine options
const ALL_CUISINE_OPTIONS: CuisineOption[] = [
  {
    id: 'african_restaurant',
    label: 'African',
    icon: { name: 'globe', type: 'feather' },
    description: 'Traditional African dishes',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'american_restaurant',
    label: 'American',
    icon: { name: 'flag', type: 'feather' },
    description: 'Classic American fare',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'bagel_shop',
    label: 'Bagels',
    icon: { name: 'circle', type: 'feather' },
    description: 'Fresh bagels and spreads',
    availableFor: ['breakfast', 'lunch'],
    minPriceLevel: 1
  },
  {
    id: 'bakery',
    label: 'Bakery',
    icon: { name: 'cake', type: 'font-awesome' },
    description: 'Fresh baked goods',
    availableFor: ['breakfast', 'lunch', 'dessert'],
    minPriceLevel: 1
  },
  {
    id: 'bar_and_grill',
    label: 'Bar & Grill',
    icon: { name: 'beer', type: 'font-awesome' },
    description: 'Casual dining with drinks',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'barbecue_restaurant',
    label: 'BBQ',
    icon: { name: 'fire', type: 'feather' },
    description: 'Smoked meats and sides',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'breakfast_restaurant',
    label: 'Breakfast',
    icon: { name: 'sun', type: 'feather' },
    description: 'All-day breakfast',
    availableFor: ['breakfast', 'lunch'],
    minPriceLevel: 1
  },
  {
    id: 'brunch_restaurant',
    label: 'Brunch',
    icon: { name: 'coffee', type: 'feather' },
    description: 'Weekend brunch specials',
    availableFor: ['breakfast', 'lunch'],
    minPriceLevel: 2
  },
  {
    id: 'chinese_restaurant',
    label: 'Chinese',
    icon: { name: 'bowl', type: 'font-awesome' },
    description: 'Traditional Chinese cuisine',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'fast_food_restaurant',
    label: 'Fast Food',
    icon: { name: 'zap', type: 'feather' },
    description: 'Quick service dining',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'french_restaurant',
    label: 'French',
    icon: { name: 'wine', type: 'font-awesome' },
    description: 'French cuisine',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 3
  },
  {
    id: 'greek_restaurant',
    label: 'Greek',
    icon: { name: 'star', type: 'feather' },
    description: 'Greek specialties',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'hamburger_restaurant',
    label: 'Burgers',
    icon: { name: 'circle', type: 'feather' },
    description: 'Gourmet burgers',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'ice_cream_shop',
    label: 'Ice Cream',
    icon: { name: 'snowflake', type: 'feather' },
    description: 'Ice cream and desserts',
    availableFor: ['dessert'],
    minPriceLevel: 1
  },
  {
    id: 'indian_restaurant',
    label: 'Indian',
    icon: { name: 'pepper-hot', type: 'font-awesome' },
    description: 'Authentic Indian cuisine',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'italian_restaurant',
    label: 'Italian',
    icon: { name: 'pizza-slice', type: 'font-awesome' },
    description: 'Italian classics',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'japanese_restaurant',
    label: 'Japanese',
    icon: { name: 'fish', type: 'feather' },
    description: 'Japanese specialties',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'korean_restaurant',
    label: 'Korean',
    icon: { name: 'bowl', type: 'font-awesome' },
    description: 'Korean favorites',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'mediterranean_restaurant',
    label: 'Mediterranean',
    icon: { name: 'olives', type: 'font-awesome' },
    description: 'Mediterranean flavors',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'middle_eastern_restaurant',
    label: 'Middle Eastern',
    icon: { name: 'star', type: 'feather' },
    description: 'Middle Eastern cuisine',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'pizza_restaurant',
    label: 'Pizza',
    icon: { name: 'pizza-slice', type: 'font-awesome' },
    description: 'Fresh pizza',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'ramen_restaurant',
    label: 'Ramen',
    icon: { name: 'bowl-food', type: 'font-awesome' },
    description: 'Authentic ramen bowls',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'sandwich_shop',
    label: 'Sandwiches',
    icon: { name: 'sandwich', type: 'font-awesome' },
    description: 'Fresh sandwiches',
    availableFor: ['breakfast', 'lunch'],
    minPriceLevel: 1
  },
  {
    id: 'seafood_restaurant',
    label: 'Seafood',
    icon: { name: 'fish', type: 'feather' },
    description: 'Fresh seafood dishes',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 3
  },
  {
    id: 'steak_house',
    label: 'Steakhouse',
    icon: { name: 'utensils', type: 'feather' },
    description: 'Premium steaks',
    availableFor: ['dinner'],
    minPriceLevel: 4
  },
  {
    id: 'sushi_restaurant',
    label: 'Sushi',
    icon: { name: 'fish', type: 'feather' },
    description: 'Fresh sushi and sashimi',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 3
  },
  {
    id: 'thai_restaurant',
    label: 'Thai',
    icon: { name: 'pepper-hot', type: 'font-awesome' },
    description: 'Authentic Thai dishes',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'vietnamese_restaurant',
    label: 'Vietnamese',
    icon: { name: 'bowl', type: 'font-awesome' },
    description: 'Vietnamese specialties',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  }
]

const CuisineStep: React.FC<CuisineStepProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const { theme } = useTheme()
  const [availableCuisines, setAvailableCuisines] = useState<CuisineOption[]>([])

  // Filter cuisines based on selected meal types and budget
  useEffect(() => {
    const selectedMealTypes = wizardState.mealTypes || []
    const selectedBudget = wizardState.budget || [1, 2, 3, 4]
    const maxBudget = Math.max(...selectedBudget)

    const filtered = ALL_CUISINE_OPTIONS.filter(cuisine => {
      // Check if cuisine is available for at least one selected meal type
      const mealTypeMatch = selectedMealTypes.some(mealType => 
        cuisine.availableFor.includes(mealType)
      )
      
      // Check if cuisine fits within budget
      const budgetMatch = cuisine.minPriceLevel <= maxBudget
      
      return mealTypeMatch && budgetMatch
    })

    setAvailableCuisines(filtered)
  }, [wizardState.mealTypes, wizardState.budget])

  const toggleCuisineType = (cuisineId: string) => {
    const currentCuisineTypes = wizardState.cuisineTypes || []
    const updatedCuisineTypes = currentCuisineTypes.includes(cuisineId)
      ? currentCuisineTypes.filter(id => id !== cuisineId)
      : [...currentCuisineTypes, cuisineId]
    
    updateWizardState({ cuisineTypes: updatedCuisineTypes })
  }

  const handleContinue = () => {
    onNext()
  }

  const handleSelectAll = () => {
    const allCuisineIds = availableCuisines.map(cuisine => cuisine.id)
    updateWizardState({ cuisineTypes: allCuisineIds })
  }

  const handleClearAll = () => {
    updateWizardState({ cuisineTypes: [] })
  }

  const isCuisineSelected = (cuisineId: string): boolean => {
    return (wizardState.cuisineTypes || []).includes(cuisineId)
  }

  const renderSelectionSummary = () => {
    const selectedCount = (wizardState.cuisineTypes || []).length
    const totalCount = availableCuisines.length
    
    if (selectedCount === 0) return null

    return (
      <View style={styles.selectionSummary}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryCount}>{selectedCount}</Text>
          <Text style={styles.summaryText}>
            of {totalCount} cuisines selected
          </Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleClearAll}
          >
            <Text style={styles.quickActionText}>Clear</Text>
          </TouchableOpacity>
          {selectedCount < totalCount && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleSelectAll}
            >
              <Text style={styles.quickActionText}>All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  const renderCuisineCard = (cuisine: CuisineOption) => {
    const isSelected = isCuisineSelected(cuisine.id)
    
    return (
      <TouchableOpacity
        key={cuisine.id}
        style={[
          styles.cuisineCard,
          isSelected && styles.selectedCuisineCard
        ]}
        onPress={() => toggleCuisineType(cuisine.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cuisineContent}>
          <View style={[
            styles.cuisineIconContainer,
            isSelected && styles.selectedCuisineIconContainer
          ]}>
            <Icon
              name={cuisine.icon.name}
              type={cuisine.icon.type}
              size={20}
              color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary}
            />
          </View>
          
          <View style={styles.cuisineInfo}>
            <Text style={[
              styles.cuisineLabel,
              isSelected && styles.selectedCuisineLabel
            ]}>
              {cuisine.label}
            </Text>
            <Text style={[
              styles.cuisineDescription,
              isSelected && styles.selectedCuisineDescription
            ]}>
              {cuisine.description}
            </Text>
          </View>
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

  const renderInfoBox = () => {
    const selectedMealTypes = wizardState.mealTypes || []
    const selectedBudget = wizardState.budget || []
    const budgetLabels = selectedBudget.map(level => '$'.repeat(level)).join(', ')
    
    return (
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Showing cuisines available for {selectedMealTypes.join(', ')} 
          {budgetLabels && ` within ${budgetLabels} budget`}
        </Text>
      </View>
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
      color: theme.colors.textSecondary,
      lineHeight: 22,
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
    quickActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    quickActionButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    quickActionText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    cuisineGrid: {
      flex: 1,
      paddingBottom: 120, // Extra padding for safe area and tabs
    },
    cuisineCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
      position: 'relative',
    },
    selectedCuisineCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    cuisineContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: theme.spacing.lg,
    },
    cuisineIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedCuisineIconContainer: {
      backgroundColor: theme.colors.primary,
    },
    cuisineInfo: {
      flex: 1,
    },
    cuisineLabel: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedCuisineLabel: {
      color: theme.colors.primary,
    },
    cuisineDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.fontSize.secondary * 1.3,
    },
    selectedCuisineDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
    },
    // Footer button styling - positioned above safe area
    footer: {
      paddingVertical: 10,
      paddingBottom: 100, // Much more padding for tabs + safe area
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
      {/* Compact header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          What type of cuisine are you in the mood for? You can select multiple options.
        </Text>
      </View>

      <ScrollView 
        style={styles.cuisineGrid}
        showsVerticalScrollIndicator={false}
      >
        {renderInfoBox()}
        {renderSelectionSummary()}
        {availableCuisines.map(renderCuisineCard)}
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

export default CuisineStep