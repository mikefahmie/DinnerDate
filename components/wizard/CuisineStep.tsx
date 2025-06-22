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
    id: 'brazilian_restaurant',
    label: 'Brazilian',
    icon: { name: 'sun', type: 'feather' },
    description: 'Brazilian specialties',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'cafe',
    label: 'Cafe',
    icon: { name: 'coffee', type: 'feather' },
    description: 'Coffee and light meals',
    availableFor: ['breakfast', 'lunch', 'coffee'],
    minPriceLevel: 1
  },
  {
    id: 'deli',
    label: 'Deli',
    icon: { name: 'sandwich', type: 'font-awesome' },
    description: 'Sandwiches and salads',
    availableFor: ['breakfast', 'lunch'],
    minPriceLevel: 1
  },
  {
    id: 'dessert_shop',
    label: 'Dessert Shop',
    icon: { name: 'ice-cream', type: 'font-awesome' },
    description: 'Sweet treats and desserts',
    availableFor: ['dessert'],
    minPriceLevel: 1
  },
  {
    id: 'diner',
    label: 'Diner',
    icon: { name: 'utensils', type: 'font-awesome' },
    description: 'All-day comfort food',
    availableFor: ['breakfast', 'lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'donut_shop',
    label: 'Donuts',
    icon: { name: 'donut', type: 'font-awesome' },
    description: 'Fresh donuts and coffee',
    availableFor: ['breakfast', 'coffee', 'dessert'],
    minPriceLevel: 1
  },
  {
    id: 'french_restaurant',
    label: 'French',
    icon: { name: 'wine', type: 'font-awesome' },
    description: 'Classic French cuisine',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 3
  },
  {
    id: 'greek_restaurant',
    label: 'Greek',
    icon: { name: 'leaf', type: 'feather' },
    description: 'Mediterranean Greek dishes',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'hamburger_restaurant',
    label: 'Burgers',
    icon: { name: 'hamburger', type: 'font-awesome' },
    description: 'Burgers and fries',
    availableFor: ['lunch', 'dinner'],
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
    const allAvailableIds = availableCuisines.map(cuisine => cuisine.id)
    updateWizardState({ cuisineTypes: allAvailableIds })
  }

  const handleClearAll = () => {
    updateWizardState({ cuisineTypes: [] })
  }

  const renderCuisineCard = (cuisine: CuisineOption) => {
    const isSelected = wizardState.cuisineTypes?.includes(cuisine.id) || false

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
            isSelected && styles.selectedIconContainer
          ]}>
            <Icon
              name={cuisine.icon.name}
              type={cuisine.icon.type}
              size={20}
              color={isSelected ? theme.colors.textOnPrimary : theme.colors.textPrimary}
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

  const selectedCount = wizardState.cuisineTypes?.length || 0

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
    note: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    noteText: {
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
    selectedIconContainer: {
      backgroundColor: theme.colors.primary,
    },
    cuisineInfo: {
      flex: 1,
    },
    cuisineLabel: {
      fontSize: theme.typography.fontSize.secondary,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedCuisineLabel: {
      color: theme.colors.primary,
    },
    cuisineDescription: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textSecondary,
    },
    selectedCuisineDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
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
          In the mood for anything specific? These cuisines match your meal choice and budget.
        </Text>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Leave blank to see all restaurants, or select specific cuisines you're craving
          </Text>
        </View>

        {selectedCount > 0 && (
          <View style={styles.selectionSummary}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryCount}>{selectedCount}</Text>
              <Text style={styles.summaryText}>
                {selectedCount === 1 ? 'cuisine selected' : 'cuisines selected'}
              </Text>
            </View>
            <View style={styles.quickActions}>
              <Button
                title="Select All"
                buttonStyle={styles.quickActionButton}
                titleStyle={styles.quickActionText}
                onPress={handleSelectAll}
              />
              <Button
                title="Clear"
                buttonStyle={styles.quickActionButton}
                titleStyle={styles.quickActionText}
                onPress={handleClearAll}
              />
            </View>
          </View>
        )}

        <View style={styles.cuisineGrid}>
          {availableCuisines.map(renderCuisineCard)}
        </View>

        {availableCuisines.length === 0 && (
          <View style={styles.note}>
            <Text style={styles.noteText}>
              No cuisines match your current meal and budget selections. Try adjusting your previous choices or continue to see all restaurants.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
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