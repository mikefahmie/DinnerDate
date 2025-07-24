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
              style={[styles.mealCard, isSelected && styles.selectedMealCard]}
              onPress={() => handleMealToggle(meal.id)}
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
    {
      level: 1,
      label: 'Budget-Friendly',
      description: 'Under $15 per person',
      symbol: '$',
    },
    {
      level: 2,
      label: 'Moderate',
      description: '$15-30 per person',
      symbol: '$$',
    },
    {
      level: 3,
      label: 'Upscale',
      description: '$30-60 per person',
      symbol: '$$$',
    },
    {
      level: 4,
      label: 'Fine Dining',
      description: '$60+ per person',
      symbol: '$$$$',
    },
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
    budgetSymbolContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    selectedSymbolContainer: {
      backgroundColor: theme.colors.primary,
    },
    budgetSymbol: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    selectedBudgetSymbol: {
      color: theme.colors.textOnPrimary,
    },
    budgetInfo: {
      flex: 1,
    },
    budgetLabel: {
      fontSize: theme.typography.fontSize.body,
      fontWeight: '600',
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
              style={[styles.budgetCard, isSelected && styles.selectedBudgetCard]}
              onPress={() => handleBudgetToggle(budget.level)}
            >
              <View style={styles.budgetContent}>
                <View style={[
                  styles.budgetSymbolContainer,
                  isSelected && styles.selectedSymbolContainer
                ]}>
                  <Text style={[
                    styles.budgetSymbol,
                    isSelected && styles.selectedBudgetSymbol
                  ]}>
                    {budget.symbol}
                  </Text>
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

// Modal Cuisine Step
export const ModalCuisineStep: React.FC<ModalStepProps> = ({ wizardState, updateWizardState }) => {
  const { theme } = useTheme()

  // Available cuisines based on meal types and budget
  const availableCuisines = [
    { id: 'american', label: 'American', description: 'Burgers, steaks, comfort food', icon: 'flag' },
    { id: 'italian', label: 'Italian', description: 'Pizza, pasta, Mediterranean', icon: 'globe' },
    { id: 'asian', label: 'Asian', description: 'Chinese, Japanese, Thai, Vietnamese', icon: 'globe' },
    { id: 'mexican', label: 'Mexican', description: 'Tacos, burritos, authentic dishes', icon: 'globe' },
    { id: 'indian', label: 'Indian', description: 'Curry, spices, traditional dishes', icon: 'globe' },
    { id: 'mediterranean', label: 'Mediterranean', description: 'Greek, Middle Eastern, fresh ingredients', icon: 'globe' },
    { id: 'french', label: 'French', description: 'Classic French cuisine, pastries', icon: 'globe' },
    { id: 'seafood', label: 'Seafood', description: 'Fresh fish, shellfish, coastal cuisine', icon: 'anchor' },
    { id: 'steakhouse', label: 'Steakhouse', description: 'Premium cuts, traditional sides', icon: 'knife' },
    { id: 'vegetarian', label: 'Vegetarian/Vegan', description: 'Plant-based, healthy options', icon: 'leaf' },
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
        {availableCuisines.map((cuisine) => {
          const isSelected = wizardState.cuisineTypes?.includes(cuisine.id) || false
          
          return (
            <TouchableOpacity
              key={cuisine.id}
              style={[styles.cuisineCard, isSelected && styles.selectedCuisineCard]}
              onPress={() => handleCuisineToggle(cuisine.id)}
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
      label: 'Vegetarian',
      description: 'No meat, but may include dairy and eggs',
      icon: 'leaf',
    },
    {
      id: 'vegan',
      label: 'Vegan',
      description: 'No animal products whatsoever',
      icon: 'leaf',
    },
    {
      id: 'gluten-free',
      label: 'Gluten-Free',
      description: 'No wheat, barley, rye, or gluten',
      icon: 'shield',
    },
    {
      id: 'dairy-free',
      label: 'Dairy-Free',
      description: 'No milk, cheese, or dairy products',
      icon: 'shield',
    },
    {
      id: 'nut-free',
      label: 'Nut-Free',
      description: 'No tree nuts or peanuts',
      icon: 'shield',
    },
    {
      id: 'kosher',
      label: 'Kosher',
      description: 'Follows Jewish dietary laws',
      icon: 'star',
    },
    {
      id: 'halal',
      label: 'Halal',
      description: 'Follows Islamic dietary laws',
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
          Any dietary restrictions or preferences? Select all that apply.
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {dietaryOptions.map((dietary) => {
          const isSelected = wizardState.dietary?.includes(dietary.id) || false
          
          return (
            <TouchableOpacity
              key={dietary.id}
              style={[styles.dietaryCard, isSelected && styles.selectedDietaryCard]}
              onPress={() => handleDietaryToggle(dietary.id)}
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
      id: 'outdoor-seating',
      label: 'Outdoor Seating',
      description: 'Patio, terrace, or sidewalk dining',
      icon: 'sun',
    },
    {
      id: 'live-music',
      label: 'Live Music',
      description: 'Live performances or entertainment',
      icon: 'music',
    },
    {
      id: 'romantic',
      label: 'Romantic Atmosphere',
      description: 'Intimate setting, dim lighting',
      icon: 'heart',
    },
    {
      id: 'family-friendly',
      label: 'Family-Friendly',
      description: 'Kids menu, high chairs, welcoming to families',
      icon: 'users',
    },
    {
      id: 'bar',
      label: 'Full Bar',
      description: 'Cocktails, wine, extensive drink menu',
      icon: 'wine',
    },
    {
      id: 'quick-service',
      label: 'Quick Service',
      description: 'Fast casual, counter service',
      icon: 'clock',
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
      icon: 'car',
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
              style={[styles.featureCard, isSelected && styles.selectedFeatureCard]}
              onPress={() => handleFeatureToggle(feature.id)}
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