// components/wizard/CuisineStep.tsx - Fixed and Complete
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button } from '@rneui/themed'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'
import AppIcons from '../../utils/fontAwesome'

interface CuisineStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
  onNext: () => void
}

interface CuisineOption {
  id: string
  label: string
  icon: [IconPrefix, IconName] | { emoji: string }
  description: string
  availableFor: string[]
  minPriceLevel: number
}

// Complete cuisine options array
const ALL_CUISINE_OPTIONS: CuisineOption[] = [
  // Food types with FontAwesome Pro icons
  {
    id: 'african_restaurant',
    label: 'African',
    icon: AppIcons.AFRICAN,
    description: 'Traditional African dishes',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'bagel_shop',
    label: 'Bagels',
    icon: AppIcons.BAGEL,
    description: 'Fresh bagels and spreads',
    availableFor: ['breakfast', 'lunch'],
    minPriceLevel: 1
  },
  {
    id: 'bakery',
    label: 'Bakery',
    icon: AppIcons.BAKERY,
    description: 'Fresh baked goods',
    availableFor: ['breakfast', 'lunch', 'dessert'],
    minPriceLevel: 1
  },
  {
    id: 'bar_and_grill',
    label: 'Bar & Grill',
    icon: AppIcons.BAR_GRILL,
    description: 'Casual dining with drinks',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'barbecue_restaurant',
    label: 'BBQ',
    icon: AppIcons.BBQ,
    description: 'Smoked meats and sides',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'breakfast_restaurant',
    label: 'Breakfast',
    icon: AppIcons.BREAKFAST_FOOD,
    description: 'All-day breakfast',
    availableFor: ['breakfast', 'lunch'],
    minPriceLevel: 1
  },
  {
    id: 'brunch_restaurant',
    label: 'Brunch',
    icon: AppIcons.BRUNCH,
    description: 'Weekend brunch specials',
    availableFor: ['breakfast', 'lunch'],
    minPriceLevel: 2
  },
  {
    id: 'chinese_restaurant',
    label: 'Chinese',
    icon: AppIcons.CHINESE,
    description: 'Traditional Chinese cuisine',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'fast_food_restaurant',
    label: 'Fast Food',
    icon: AppIcons.FAST_FOOD,
    description: 'Quick service dining',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'hamburger_restaurant',
    label: 'Burgers',
    icon: AppIcons.BURGER,
    description: 'Gourmet burgers',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'mediterranean_restaurant',
    label: 'Mediterranean',
    icon: AppIcons.MEDITERRANEAN,
    description: 'Mediterranean flavors',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'middle_eastern_restaurant',
    label: 'Middle Eastern',
    icon: AppIcons.MIDDLE_EASTERN,
    description: 'Middle Eastern cuisine',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'pizza_restaurant',
    label: 'Pizza',
    icon: AppIcons.PIZZA,
    description: 'Fresh pizza',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'ramen_restaurant',
    label: 'Ramen',
    icon: AppIcons.RAMEN,
    description: 'Authentic ramen bowls',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'sandwich_shop',
    label: 'Sandwiches',
    icon: AppIcons.SANDWICH,
    description: 'Fresh sandwiches',
    availableFor: ['breakfast', 'lunch'],
    minPriceLevel: 1
  },
  {
    id: 'seafood_restaurant',
    label: 'Seafood',
    icon: AppIcons.SEAFOOD,
    description: 'Fresh seafood dishes',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 3
  },
  {
    id: 'sushi_restaurant',
    label: 'Sushi',
    icon: AppIcons.SUSHI,
    description: 'Fresh sushi and sashimi',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 3
  },
  {
    id: 'ice_cream_shop',
    label: 'Ice Cream',
    icon: AppIcons.ICE_CREAM,
    description: 'Ice cream and desserts',
    availableFor: ['dessert'],
    minPriceLevel: 1
  },
  {
    id: 'steak_house',
    label: 'Steakhouse',
    icon: AppIcons.STEAK,
    description: 'Premium steaks',
    availableFor: ['dinner'],
    minPriceLevel: 4
  },
  // Cuisines with country flags
  {
    id: 'american_restaurant',
    label: 'American',
    icon: { emoji: '🇺🇸' },
    description: 'Classic American fare',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 1
  },
  {
    id: 'french_restaurant',
    label: 'French',
    icon: { emoji: '🇫🇷' },
    description: 'French cuisine and pastries',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 3
  },
  {
    id: 'italian_restaurant',
    label: 'Italian',
    icon: { emoji: '🇮🇹' },
    description: 'Italian classics and pasta',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'greek_restaurant',
    label: 'Greek',
    icon: { emoji: '🇬🇷' },
    description: 'Greek specialties',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'japanese_restaurant',
    label: 'Japanese',
    icon: { emoji: '🇯🇵' },
    description: 'Japanese cuisine',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'korean_restaurant',
    label: 'Korean',
    icon: { emoji: '🇰🇷' },
    description: 'Korean favorites',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'indian_restaurant',
    label: 'Indian',
    icon: { emoji: '🇮🇳' },
    description: 'Authentic Indian cuisine',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'thai_restaurant',
    label: 'Thai',
    icon: { emoji: '🇹🇭' },
    description: 'Authentic Thai dishes',
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'vietnamese_restaurant',
    label: 'Vietnamese',
    icon: { emoji: '🇻🇳' },
    description: 'Vietnamese specialties',  
    availableFor: ['lunch', 'dinner'],
    minPriceLevel: 2
  },
  {
    id: 'mexican_restaurant',
    label: 'Mexican',
    icon: { emoji: '🇲🇽' },
    description: 'Mexican cuisine and tacos',
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
      const mealTypeMatch = selectedMealTypes.some(mealType => 
        cuisine.availableFor.includes(mealType)
      )
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

  // Render the appropriate icon based on type
  const renderCuisineIcon = (cuisine: CuisineOption, isSelected: boolean) => {
    if ('emoji' in cuisine.icon) {
      return (
        <Text style={styles.flagEmoji}>
          {cuisine.icon.emoji}
        </Text>
      )
    } else {
      return (
        <FontAwesomeIcon
          icon={cuisine.icon}
          size={24}
          color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
        />
      )
    }
  }

  const renderInfoBox = () => {
    if (availableCuisines.length === 0) {
      return (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            No cuisines match your current selections. Try expanding your budget or meal types.
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {availableCuisines.length} cuisines match your meal choice and budget
        </Text>
      </View>
    )
  }

  const renderSelectionSummary = () => {
    const selectedCount = wizardState.cuisineTypes?.length || 0
    if (selectedCount === 0) return null

    return (
      <View style={styles.selectionSummary}>
        <Text style={styles.selectionText}>
          {selectedCount} cuisine{selectedCount !== 1 ? 's' : ''} selected
        </Text>
      </View>
    )
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
            isSelected && styles.selectedCuisineIconContainer
          ]}>
            {renderCuisineIcon(cuisine, isSelected)}
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
      backgroundColor: theme.colors.primary + '20',
    },
    flagEmoji: {
      fontSize: 24,
      textAlign: 'center',
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