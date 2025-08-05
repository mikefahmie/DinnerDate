// components/filters/ModalStepComponents.tsx
// Modal-specific versions of wizard steps without footers and with proper flex styling

import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface ModalStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
}

// Modal Meal Type Step
export const ModalMealTypeStep: React.FC<ModalStepProps> = ({ wizardState, updateWizardState }) => {
  const { theme } = useTheme()

  const mealTypes = [
    {
      id: 'breakfast',
      label: 'Breakfast',
      description: 'Morning meals, pancakes, eggs, coffee',
      icon: 'coffee',
    },
    {
      id: 'brunch',
      label: 'Brunch',
      description: 'Late morning comfort food',
      icon: 'sun',
    },
    {
      id: 'lunch',
      label: 'Lunch',
      description: 'Midday meals, salads, sandwiches',
      icon: 'sun',
    },
    {
      id: 'dinner',
      label: 'Dinner',
      description: 'Evening meals, full entrees',
      icon: 'moon',
    },
    {
      id: 'dessert',
      label: 'Dessert',
      description: 'Sweet treats and pastries',
      icon: 'heart',
    },
    {
      id: 'coffee',
      label: 'Coffee & Light Bites',
      description: 'Coffee shops, pastries, light snacks',
      icon: 'coffee',
    },
    {
      id: 'drinks',
      label: 'Drinks & Appetizers',
      description: 'Bars, cocktails, small plates',
      icon: 'wine',
    },
  ]

  const handleMealToggle = (mealId: string) => {
    const currentMeals = wizardState.mealTypes || []
    const newMeals = currentMeals.includes(mealId)
      ? currentMeals.filter(id => id !== mealId)
      : [...currentMeals, mealId]
    
    updateWizardState({ mealTypes: newMeals })
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
    scrollView: {
      flex: 1,
    },
    mealCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedMealCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
    },
    mealContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mealIconContainer: {
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
    mealInfo: {
      flex: 1,
    },
    mealLabel: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedMealLabel: {
      color: theme.colors.primary,
    },
    mealDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
    },
    selectedMealDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          What type of meal are you planning? You can select multiple options.
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {mealTypes.map((meal) => {
          const isSelected = wizardState.mealTypes?.includes(meal.id) || false
          
          return (
            <TouchableOpacity
              key={meal.id}
              style={[
                styles.mealCard,
                isSelected && styles.selectedMealCard
              ]}
              onPress={() => handleMealToggle(meal.id)}
              activeOpacity={0.7}
            >
              <View style={styles.mealContent}>
                <View style={[
                  styles.mealIconContainer,
                  isSelected && styles.selectedIconContainer
                ]}>
                  <Icon
                    name={meal.icon}
                    type="feather"
                    size={20}
                    color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary}
                  />
                </View>
                
                <View style={styles.mealInfo}>
                  <Text style={[
                    styles.mealLabel,
                    isSelected && styles.selectedMealLabel
                  ]}>
                    {meal.label}
                  </Text>
                  <Text style={[
                    styles.mealDescription,
                    isSelected && styles.selectedMealDescription
                  ]}>
                    {meal.description}
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
        })}
      </ScrollView>
    </View>
  )
}

// Modal Budget Step
export const ModalBudgetStep: React.FC<ModalStepProps> = ({ wizardState, updateWizardState }) => {
  const { theme } = useTheme()

  const budgetOptions = [
    { level: 1, label: '$', description: 'Under $15 per person' },
    { level: 2, label: '$$', description: '$15-30 per person' },
    { level: 3, label: '$$$', description: '$30-60 per person' },
    { level: 4, label: '$$$$', description: '$60+ per person' },
  ]

  const handleBudgetToggle = (level: number) => {
    const currentBudget = wizardState.budget || []
    const newBudget = currentBudget.includes(level)
      ? currentBudget.filter(l => l !== level)
      : [...currentBudget, level].sort()
    
    updateWizardState({ budget: newBudget })
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
    scrollView: {
      flex: 1,
    },
    budgetCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    selectedBudgetCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.primary,
    },
    budgetContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    budgetIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedBudgetIconContainer: {
      backgroundColor: theme.colors.primary,
    },
    budgetInfo: {
      flex: 1,
    },
    budgetLabel: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    selectedBudgetLabel: {
      color: theme.colors.primary,
    },
    budgetDescription: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
    },
    selectedBudgetDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          What's your budget range? You can select multiple price levels.
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {budgetOptions.map((budget) => {
          const isSelected = wizardState.budget?.includes(budget.level) || false
          
          return (
            <TouchableOpacity
              key={budget.level}
              style={[
                styles.budgetCard,
                isSelected && styles.selectedBudgetCard
              ]}
              onPress={() => handleBudgetToggle(budget.level)}
              activeOpacity={0.7}
            >
              <View style={styles.budgetContent}>
                <View style={[
                  styles.budgetIconContainer,
                  isSelected && styles.selectedBudgetIconContainer
                ]}>
                  <Icon
                    name="dollar-sign"
                    type="feather"
                    size={20}
                    color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary}
                  />
                </View>
                
                <View style={styles.budgetInfo}>
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
        })}
      </ScrollView>
    </View>
  )
}

// Modal Cuisine Step - UPDATED WITH ALL 27 OPTIONS FROM WIZARD
export const ModalCuisineStep: React.FC<ModalStepProps> = ({ wizardState, updateWizardState }) => {
  const { theme } = useTheme()

  // Complete list of all 27 cuisine options from the wizard
  const cuisineOptions = [
    {
      id: 'african_restaurant',
      label: 'African',
      description: 'Traditional African dishes',
      icon: 'globe',
    },
    {
      id: 'american_restaurant',
      label: 'American',
      description: 'Classic American fare',
      icon: 'flag',
    },
    {
      id: 'bagel_shop',
      label: 'Bagels',
      description: 'Fresh bagels and spreads',
      icon: 'circle',
    },
    {
      id: 'bakery',
      label: 'Bakery',
      description: 'Fresh baked goods',
      icon: 'heart',
    },
    {
      id: 'bar_and_grill',
      label: 'Bar & Grill',
      description: 'Casual dining with drinks',
      icon: 'home',
    },
    {
      id: 'barbecue_restaurant',
      label: 'BBQ',
      description: 'Smoked meats and sides',
      icon: 'fire',
    },
    {
      id: 'breakfast_restaurant',
      label: 'Breakfast',
      description: 'All-day breakfast',
      icon: 'sun',
    },
    {
      id: 'brunch_restaurant',
      label: 'Brunch',
      description: 'Weekend brunch specials',
      icon: 'coffee',
    },
    {
      id: 'chinese_restaurant',
      label: 'Chinese',
      description: 'Traditional Chinese cuisine',
      icon: 'globe',
    },
    {
      id: 'fast_food_restaurant',
      label: 'Fast Food',
      description: 'Quick service dining',
      icon: 'zap',
    },
    {
      id: 'french_restaurant',
      label: 'French',
      description: 'French cuisine',
      icon: 'wine',
    },
    {
      id: 'greek_restaurant',
      label: 'Greek',
      description: 'Greek specialties',
      icon: 'star',
    },
    {
      id: 'hamburger_restaurant',
      label: 'Burgers',
      description: 'Gourmet burgers',
      icon: 'circle',
    },
    {
      id: 'ice_cream_shop',
      label: 'Ice Cream',
      description: 'Ice cream and desserts',
      icon: 'hexagon',
    },
    {
      id: 'indian_restaurant',
      label: 'Indian',
      description: 'Authentic Indian cuisine',
      icon: 'globe',
    },
    {
      id: 'italian_restaurant',
      label: 'Italian',
      description: 'Italian classics',
      icon: 'globe',
    },
    {
      id: 'japanese_restaurant',
      label: 'Japanese',
      description: 'Japanese specialties',
      icon: 'fish',
    },
    {
      id: 'korean_restaurant',
      label: 'Korean',
      description: 'Korean favorites',
      icon: 'globe',
    },
    {
      id: 'mediterranean_restaurant',
      label: 'Mediterranean',
      description: 'Mediterranean flavors',
      icon: 'globe',
    },
    {
      id: 'middle_eastern_restaurant',
      label: 'Middle Eastern',
      description: 'Middle Eastern cuisine',
      icon: 'star',
    },
    {
      id: 'pizza_restaurant',
      label: 'Pizza',
      description: 'Fresh pizza',
      icon: 'circle',
    },
    {
      id: 'ramen_restaurant',
      label: 'Ramen',
      description: 'Authentic ramen bowls',
      icon: 'globe',
    },
    {
      id: 'sandwich_shop',
      label: 'Sandwiches',
      description: 'Fresh sandwiches',
      icon: 'square',
    },
    {
      id: 'seafood_restaurant',
      label: 'Seafood',
      description: 'Fresh seafood dishes',
      icon: 'fish',
    },
    {
      id: 'steak_house',
      label: 'Steakhouse',
      description: 'Premium steaks and chops',
      icon: 'square',
    },
    {
      id: 'thai_restaurant',
      label: 'Thai',
      description: 'Authentic Thai dishes',
      icon: 'globe',
    },
    {
      id: 'vietnamese_restaurant',
      label: 'Vietnamese',
      description: 'Vietnamese specialties',
      icon: 'globe',
    },
  ]

  const handleCuisineToggle = (cuisineId: string) => {
    const currentCuisines = wizardState.cuisineTypes || []
    const newCuisines = currentCuisines.includes(cuisineId)
      ? currentCuisines.filter(id => id !== cuisineId)
      : [...currentCuisines, cuisineId]
    
    updateWizardState({ cuisineTypes: newCuisines })
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
    scrollView: {
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
    },
    cuisineContent: {
      flexDirection: 'row',
      alignItems: 'center',
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
    },
    selectedCuisineDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          What type of cuisine are you in the mood for? You can select multiple options.
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {cuisineOptions.map((cuisine) => {
          const isSelected = wizardState.cuisineTypes?.includes(cuisine.id) || false
          
          return (
            <TouchableOpacity
              key={cuisine.id}
              style={[
                styles.cuisineCard,
                isSelected && styles.selectedCuisineCard
              ]}
              onPress={() => handleCuisineToggle(cuisine.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cuisineContent}>
                <View style={[
                  styles.cuisineIconContainer,
                  isSelected && styles.selectedCuisineIconContainer
                ]}>
                  <Icon
                    name={cuisine.icon}
                    type="feather"
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
        })}
      </ScrollView>
    </View>
  )
}

// Modal Dietary Step
export const ModalDietaryStep: React.FC<ModalStepProps> = ({ wizardState, updateWizardState }) => {
  const { theme } = useTheme()

  const dietaryOptions = [
    {
      id: 'vegetarian',
      label: 'Vegetarian Options',
      description: 'Plant-based dishes available',
      icon: 'leaf',
    },
    {
      id: 'vegan',
      label: 'Vegan Options',
      description: 'Completely plant-based options',
      icon: 'leaf',
    },
    {
      id: 'gluten-free',
      label: 'Gluten-Free Options',
      description: 'Dishes without gluten',
      icon: 'shield',
    },
    {
      id: 'dairy-free',
      label: 'Dairy-Free Options',
      description: 'Options without dairy products',
      icon: 'droplet',
    },
    {
      id: 'keto-friendly',
      label: 'Keto-Friendly',
      description: 'Low-carb, high-fat options',
      icon: 'zap',
    },
    {
      id: 'halal',
      label: 'Halal Options',
      description: 'Halal-certified dishes',
      icon: 'star',
    },
    {
      id: 'kosher',
      label: 'Kosher Options',
      description: 'Kosher-certified dishes',
      icon: 'star',
    },
  ]

  const handleDietaryToggle = (dietaryId: string) => {
    const currentDietary = wizardState.dietary || []
    const newDietary = currentDietary.includes(dietaryId)
      ? currentDietary.filter(id => id !== dietaryId)
      : [...currentDietary, dietaryId]
    
    updateWizardState({ dietary: newDietary })
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
    scrollView: {
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
    },
    dietaryContent: {
      flexDirection: 'row',
      alignItems: 'center',
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
      backgroundColor: theme.colors.primary,
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
    },
    selectedDietaryDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Any dietary preferences or restrictions? Select what applies to you.
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {dietaryOptions.map((dietary) => {
          const isSelected = wizardState.dietary?.includes(dietary.id) || false
          
          return (
            <TouchableOpacity
              key={dietary.id}
              style={[
                styles.dietaryCard,
                isSelected && styles.selectedDietaryCard
              ]}
              onPress={() => handleDietaryToggle(dietary.id)}
              activeOpacity={0.7}
            >
              <View style={styles.dietaryContent}>
                <View style={[
                  styles.dietaryIconContainer,
                  isSelected && styles.selectedDietaryIconContainer
                ]}>
                  <Icon
                    name={dietary.icon}
                    type="feather"
                    size={20}
                    color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary}
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
        })}
      </ScrollView>
    </View>
  )
}

// Modal Features Step
export const ModalFeaturesStep: React.FC<ModalStepProps> = ({ wizardState, updateWizardState }) => {
  const { theme } = useTheme()

  const featureOptions = [
    {
      id: 'outdoor_seating',
      label: 'Outdoor Seating',
      description: 'Patio, terrace, or sidewalk dining',
      icon: 'sun',
    },
    {
      id: 'serves_wine',
      label: 'Serves Wine',
      description: 'Wine selection available',
      icon: 'wine',
    },
    {
      id: 'serves_beer',
      label: 'Serves Beer',
      description: 'Beer selection available',
      icon: 'coffee',
    },
    {
      id: 'good_for_groups',
      label: 'Good for Groups',
      description: 'Large parties welcome',
      icon: 'users',
    },
    {
      id: 'reservable',
      label: 'Reservations',
      description: 'Accept table reservations',
      icon: 'calendar',
    },
    {
      id: 'takeout',
      label: 'Takeout',
      description: 'Food available for pickup',
      icon: 'shopping-bag',
    },
    {
      id: 'delivery',
      label: 'Delivery',
      description: 'Food delivery available',
      icon: 'truck',
    },
    {
      id: 'good_for_children',
      label: 'Family-Friendly',
      description: 'Kids menu, high chairs, welcoming to families',
      icon: 'heart',
    },
    {
      id: 'allows_dogs',
      label: 'Dog-Friendly',
      description: 'Pets welcome',
      icon: 'heart',
    },
    {
      id: 'live_music',
      label: 'Live Music',
      description: 'Live performances or entertainment',
      icon: 'music',
    },
    {
      id: 'wifi',
      label: 'WiFi Available',
      description: 'Good for working or studying',
      icon: 'wifi',
    },
    {
      id: 'parking',
      label: 'Parking Available',
      description: 'On-site or nearby parking',
      icon: 'navigation',
    },
    {
      id: 'accessible',
      label: 'Wheelchair Accessible',
      description: 'ADA compliant, accessible entrance',
      icon: 'shield',
    },
  ]

  const handleFeatureToggle = (featureId: string) => {
    const currentFeatures = wizardState.features || []
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter(id => id !== featureId)
      : [...currentFeatures, featureId]
    
    updateWizardState({ features: newFeatures })
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
    scrollView: {
      flex: 1,
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
    },
    featureContent: {
      flexDirection: 'row',
      alignItems: 'center',
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
      backgroundColor: theme.colors.primary,
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
    },
    selectedFeatureDescription: {
      color: theme.colors.textPrimary,
    },
    checkIconContainer: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Looking for anything specific? Select features that matter to you.
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {featureOptions.map((feature) => {
          const isSelected = wizardState.features?.includes(feature.id) || false
          
          return (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                isSelected && styles.selectedFeatureCard
              ]}
              onPress={() => handleFeatureToggle(feature.id)}
              activeOpacity={0.7}
            >
              <View style={styles.featureContent}>
                <View style={[
                  styles.featureIconContainer,
                  isSelected && styles.selectedFeatureIconContainer
                ]}>
                  <Icon
                    name={feature.icon}
                    type="feather"
                    size={20}
                    color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary}
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
        })}
      </ScrollView>
    </View>
  )
}