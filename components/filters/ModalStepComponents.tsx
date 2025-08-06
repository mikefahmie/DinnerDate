// components/filters/ModalStepComponents.tsx - Complete file with FontAwesome Pro icons
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'
import AppIcons from '../../utils/fontAwesome'

interface ModalStepProps {
  wizardState: WizardState
  updateWizardState: (updates: Partial<WizardState>) => void
}

interface FeatureOption {
  id: string
  label: string
  icon: [IconPrefix, IconName]
  description: string
  category: 'beverages' | 'amenities' | 'accessibility'
  availableFor?: string[]
  minPriceLevel?: number
}

// Modal Meal Type Step
export const ModalMealTypeStep: React.FC<ModalStepProps> = ({ wizardState, updateWizardState }) => {
  const { theme } = useTheme()

  const mealOptions = [
    { id: 'breakfast', label: 'Breakfast', description: 'Morning meals and brunch', icon: AppIcons.BREAKFAST },
    { id: 'lunch', label: 'Lunch', description: 'Midday dining', icon: AppIcons.LUNCH },
    { id: 'dinner', label: 'Dinner', description: 'Evening meals', icon: AppIcons.DINNER },
    { id: 'coffee', label: 'Coffee', description: 'Coffee shops and cafes', icon: AppIcons.COFFEE },
    { id: 'dessert', label: 'Dessert', description: 'Sweets and desserts', icon: AppIcons.DESSERT },
  ]

  const handleMealTypeToggle = (mealTypeId: string) => {
    const currentMealTypes = wizardState.mealTypes || []
    const newMealTypes = currentMealTypes.includes(mealTypeId)
      ? currentMealTypes.filter(id => id !== mealTypeId)
      : [...currentMealTypes, mealTypeId]
    updateWizardState({ mealTypes: newMealTypes })
  }

  const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: theme.spacing.lg },
    header: { paddingVertical: theme.spacing.md, alignItems: 'center' },
    subtitle: { fontSize: theme.typography.fontSize.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.md },
    scrollView: { flex: 1 },
    mealCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 2, borderColor: theme.colors.border, ...theme.shadows.small },
    selectedMealCard: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.primary },
    mealContent: { flexDirection: 'row', alignItems: 'center' },
    mealIconContainer: { width: 40, height: 40, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surfaceElevated, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    selectedMealIconContainer: { backgroundColor: theme.colors.primary },
    mealInfo: { flex: 1 },
    mealLabel: { fontSize: theme.typography.fontSize.body, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
    selectedMealLabel: { color: theme.colors.primary },
    mealDescription: { fontSize: theme.typography.fontSize.secondary, color: theme.colors.textSecondary },
    selectedMealDescription: { color: theme.colors.textPrimary },
    checkIconContainer: { position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Select the type of meal you're planning.</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {mealOptions.map((meal) => {
          const isSelected = wizardState.mealTypes?.includes(meal.id) || false
          return (
            <TouchableOpacity key={meal.id} style={[styles.mealCard, isSelected && styles.selectedMealCard]} onPress={() => handleMealTypeToggle(meal.id)} activeOpacity={0.7}>
              <View style={styles.mealContent}>
                <View style={[styles.mealIconContainer, isSelected && styles.selectedMealIconContainer]}>
                  <FontAwesomeIcon icon={meal.icon} size={20} color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary} />
                </View>
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealLabel, isSelected && styles.selectedMealLabel]}>{meal.label}</Text>
                  <Text style={[styles.mealDescription, isSelected && styles.selectedMealDescription]}>{meal.description}</Text>
                </View>
              </View>
              {isSelected && (
                <View style={styles.checkIconContainer}>
                  <FontAwesomeIcon icon={AppIcons.CHECK} size={20} color={theme.colors.primary} />
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
    { level: 1, label: '$', range: 'Under $15', description: 'Fast food, coffee shops', icon: AppIcons.DOLLAR },
    { level: 2, label: '$$', range: '$15-30', description: 'Casual dining, cafes', icon: AppIcons.DOLLAR },
    { level: 3, label: '$$$', range: '$30-50', description: 'Fine dining, steakhouses', icon: AppIcons.DOLLAR },
    { level: 4, label: '$$$$', range: '$50+', description: 'Premium restaurants', icon: AppIcons.DOLLAR },
  ]

  const handleBudgetToggle = (level: number) => {
    const currentBudget = wizardState.budget || []
    const newBudget = currentBudget.includes(level) ? currentBudget.filter(l => l !== level) : [...currentBudget, level].sort()
    updateWizardState({ budget: newBudget })
  }

  const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: theme.spacing.lg },
    header: { paddingVertical: theme.spacing.md, alignItems: 'center' },
    subtitle: { fontSize: theme.typography.fontSize.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.md },
    scrollView: { flex: 1 },
    budgetCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 2, borderColor: theme.colors.border, ...theme.shadows.small },
    selectedBudgetCard: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.primary },
    budgetContent: { flexDirection: 'row', alignItems: 'center' },
    budgetIconContainer: { width: 40, height: 40, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surfaceElevated, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    selectedBudgetIconContainer: { backgroundColor: theme.colors.primary },
    budgetInfo: { flex: 1 },
    budgetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs },
    budgetLabel: { fontSize: theme.typography.fontSize.body, fontWeight: '600', color: theme.colors.textPrimary, marginRight: theme.spacing.sm },
    selectedBudgetLabel: { color: theme.colors.primary },
    budgetRange: { fontSize: theme.typography.fontSize.secondary, color: theme.colors.textSecondary },
    budgetDescription: { fontSize: theme.typography.fontSize.secondary, color: theme.colors.textSecondary },
    selectedBudgetDescription: { color: theme.colors.textPrimary },
    checkIconContainer: { position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Select your budget range per person.</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {budgetOptions.map((budget) => {
          const isSelected = wizardState.budget?.includes(budget.level) || false
          return (
            <TouchableOpacity key={budget.level} style={[styles.budgetCard, isSelected && styles.selectedBudgetCard]} onPress={() => handleBudgetToggle(budget.level)} activeOpacity={0.7}>
              <View style={styles.budgetContent}>
                <View style={[styles.budgetIconContainer, isSelected && styles.selectedBudgetIconContainer]}>
                  <FontAwesomeIcon icon={budget.icon} size={20} color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary} />
                </View>
                <View style={styles.budgetInfo}>
                  <View style={styles.budgetHeader}>
                    <Text style={[styles.budgetLabel, isSelected && styles.selectedBudgetLabel]}>{budget.label}</Text>
                    <Text style={styles.budgetRange}>{budget.range}</Text>
                  </View>
                  <Text style={[styles.budgetDescription, isSelected && styles.selectedBudgetDescription]}>{budget.description}</Text>
                </View>
              </View>
              {isSelected && (
                <View style={styles.checkIconContainer}>
                  <FontAwesomeIcon icon={AppIcons.CHECK} size={20} color={theme.colors.primary} />
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

  const cuisineOptions = [
    { id: 'italian_restaurant', label: 'Italian', icon: AppIcons.ITALIAN },
    { id: 'chinese_restaurant', label: 'Chinese', icon: AppIcons.CHINESE },
    { id: 'mexican_restaurant', label: 'Mexican', icon: AppIcons.MEXICAN },
    { id: 'japanese_restaurant', label: 'Japanese', icon: AppIcons.JAPANESE },
    { id: 'french_restaurant', label: 'French', icon: AppIcons.FRENCH },
    { id: 'thai_restaurant', label: 'Thai', icon: AppIcons.THAI },
    { id: 'indian_restaurant', label: 'Indian', icon: AppIcons.INDIAN },
    { id: 'american_restaurant', label: 'American', icon: AppIcons.AMERICAN },
    { id: 'mediterranean_restaurant', label: 'Mediterranean', icon: AppIcons.MEDITERRANEAN },
    { id: 'korean_restaurant', label: 'Korean', icon: AppIcons.KOREAN },
    { id: 'vietnamese_restaurant', label: 'Vietnamese', icon: AppIcons.VIETNAMESE },
    { id: 'greek_restaurant', label: 'Greek', icon: AppIcons.GREEK },
    { id: 'spanish_restaurant', label: 'Spanish', icon: AppIcons.SPANISH },
    { id: 'lebanese_restaurant', label: 'Lebanese', icon: AppIcons.LEBANESE },
    { id: 'turkish_restaurant', label: 'Turkish', icon: AppIcons.TURKISH },
    { id: 'german_restaurant', label: 'German', icon: AppIcons.GERMAN },
    { id: 'british_restaurant', label: 'British', icon: AppIcons.BRITISH },
    { id: 'brazilian_restaurant', label: 'Brazilian', icon: AppIcons.BRAZILIAN },
    { id: 'ethiopian_restaurant', label: 'Ethiopian', icon: AppIcons.ETHIOPIAN },
    { id: 'barbecue_restaurant', label: 'BBQ', icon: AppIcons.BBQ },
    { id: 'seafood_restaurant', label: 'Seafood', icon: AppIcons.SEAFOOD },
    { id: 'steakhouse', label: 'Steakhouse', icon: AppIcons.STEAKHOUSE },
    { id: 'pizza_restaurant', label: 'Pizza', icon: AppIcons.PIZZA },
    { id: 'sushi_restaurant', label: 'Sushi', icon: AppIcons.SUSHI },
    { id: 'fast_food_restaurant', label: 'Fast Food', icon: AppIcons.FAST_FOOD },
    { id: 'sandwich_shop', label: 'Sandwiches', icon: AppIcons.SANDWICH },
    { id: 'bakery', label: 'Bakery', icon: AppIcons.BAKERY },
  ]

  const handleCuisineToggle = (cuisineId: string) => {
    const currentCuisines = wizardState.cuisineTypes || []
    const newCuisines = currentCuisines.includes(cuisineId) ? currentCuisines.filter(id => id !== cuisineId) : [...currentCuisines, cuisineId]
    updateWizardState({ cuisineTypes: newCuisines })
  }

  const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: theme.spacing.lg },
    header: { paddingVertical: theme.spacing.md, alignItems: 'center' },
    subtitle: { fontSize: theme.typography.fontSize.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.md },
    scrollView: { flex: 1 },
    cuisinesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    cuisineCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 2, borderColor: theme.colors.border, width: '48%', minHeight: 80, alignItems: 'center', justifyContent: 'center', ...theme.shadows.small },
    selectedCuisineCard: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.primary },
    cuisineIconContainer: { marginBottom: theme.spacing.xs },
    cuisineLabel: { fontSize: theme.typography.fontSize.secondary, fontWeight: '600', color: theme.colors.textPrimary, textAlign: 'center' },
    selectedCuisineLabel: { color: theme.colors.primary },
    checkIconContainer: { position: 'absolute', top: theme.spacing.xs, right: theme.spacing.xs },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Select cuisine types you're in the mood for.</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.cuisinesGrid}>
          {cuisineOptions.map((cuisine) => {
            const isSelected = wizardState.cuisineTypes?.includes(cuisine.id) || false
            return (
              <TouchableOpacity key={cuisine.id} style={[styles.cuisineCard, isSelected && styles.selectedCuisineCard]} onPress={() => handleCuisineToggle(cuisine.id)} activeOpacity={0.7}>
                <View style={styles.cuisineIconContainer}>
                  <FontAwesomeIcon icon={cuisine.icon} size={24} color={isSelected ? theme.colors.primary : theme.colors.textSecondary} />
                </View>
                <Text style={[styles.cuisineLabel, isSelected && styles.selectedCuisineLabel]}>{cuisine.label}</Text>
                {isSelected && (
                  <View style={styles.checkIconContainer}>
                    <FontAwesomeIcon icon={AppIcons.CHECK} size={16} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

// Modal Dietary Step
export const ModalDietaryStep: React.FC<ModalStepProps> = ({ wizardState, updateWizardState }) => {
  const { theme } = useTheme()

  const dietaryOptions = [
    { id: 'vegetarian_friendly', label: 'Vegetarian Options', description: 'Plant-based meal options available', icon: AppIcons.VEGETARIAN },
    { id: 'vegan_options', label: 'Vegan Options', description: 'No animal products', icon: AppIcons.VEGAN },
    { id: 'gluten_free_options', label: 'Gluten-Free Options', description: 'Gluten-free meals available', icon: AppIcons.GLUTEN_FREE },
    { id: 'halal', label: 'Halal Options', description: 'Halal certified meals', icon: AppIcons.HALAL },
    { id: 'kosher', label: 'Kosher Options', description: 'Kosher certified meals', icon: AppIcons.KOSHER },
    { id: 'no_dietary_restrictions', label: 'No Dietary Restrictions', description: 'Open to all options', icon: AppIcons.CHECK },
  ]

  const handleDietaryToggle = (dietaryId: string) => {
    const currentDietary = wizardState.dietary || []
    if (dietaryId === 'no_dietary_restrictions') {
      const hasNoRestrictions = currentDietary.includes('no_dietary_restrictions')
      updateWizardState({ dietary: hasNoRestrictions ? [] : ['no_dietary_restrictions'] })
      return
    }
    const filteredDietary = currentDietary.filter(id => id !== 'no_dietary_restrictions')
    const newDietary = filteredDietary.includes(dietaryId) ? filteredDietary.filter(id => id !== dietaryId) : [...filteredDietary, dietaryId]
    updateWizardState({ dietary: newDietary })
  }

  const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: theme.spacing.lg },
    header: { paddingVertical: theme.spacing.md, alignItems: 'center' },
    subtitle: { fontSize: theme.typography.fontSize.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.md },
    scrollView: { flex: 1 },
    dietaryCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 2, borderColor: theme.colors.border, ...theme.shadows.small },
    selectedDietaryCard: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.primary },
    dietaryContent: { flexDirection: 'row', alignItems: 'center' },
    dietaryIconContainer: { width: 40, height: 40, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surfaceElevated, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    selectedDietaryIconContainer: { backgroundColor: theme.colors.primary },
    dietaryInfo: { flex: 1 },
    dietaryLabel: { fontSize: theme.typography.fontSize.body, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
    selectedDietaryLabel: { color: theme.colors.primary },
    dietaryDescription: { fontSize: theme.typography.fontSize.secondary, color: theme.colors.textSecondary },
    selectedDietaryDescription: { color: theme.colors.textPrimary },
    checkIconContainer: { position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Any dietary preferences or restrictions?</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {dietaryOptions.map((dietary) => {
          const isSelected = wizardState.dietary?.includes(dietary.id) || false
          return (
            <TouchableOpacity key={dietary.id} style={[styles.dietaryCard, isSelected && styles.selectedDietaryCard]} onPress={() => handleDietaryToggle(dietary.id)} activeOpacity={0.7}>
              <View style={styles.dietaryContent}>
                <View style={[styles.dietaryIconContainer, isSelected && styles.selectedDietaryIconContainer]}>
                  <FontAwesomeIcon icon={dietary.icon} size={20} color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary} />
                </View>
                <View style={styles.dietaryInfo}>
                  <Text style={[styles.dietaryLabel, isSelected && styles.selectedDietaryLabel]}>{dietary.label}</Text>
                  <Text style={[styles.dietaryDescription, isSelected && styles.selectedDietaryDescription]}>{dietary.description}</Text>
                </View>
              </View>
              {isSelected && (
                <View style={styles.checkIconContainer}>
                  <FontAwesomeIcon icon={AppIcons.CHECK} size={20} color={theme.colors.primary} />
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

  const ALL_FEATURE_OPTIONS: FeatureOption[] = [
    // Beverages
    { id: 'serves_wine', label: 'Serves Wine', icon: AppIcons.WINE, description: 'Wine selection available', category: 'beverages', availableFor: ['lunch', 'dinner'], minPriceLevel: 2 },
    { id: 'serves_cocktails', label: 'Serves Cocktails', icon: AppIcons.COCKTAILS, description: 'Cocktail menu available', category: 'beverages', availableFor: ['lunch', 'dinner'], minPriceLevel: 2 },
    { id: 'serves_beer', label: 'Serves Beer', icon: AppIcons.BEER, description: 'Beer selection available', category: 'beverages', availableFor: ['lunch', 'dinner'], minPriceLevel: 1 },
    { id: 'serves_coffee', label: 'Serves Coffee', icon: AppIcons.COFFEE_SERVICE, description: 'Coffee and espresso drinks', category: 'beverages', minPriceLevel: 1 },
    // Amenities
    { id: 'outdoor_seating', label: 'Outdoor Seating', icon: AppIcons.OUTDOOR_SEATING, description: 'Patio or outdoor dining', category: 'amenities', minPriceLevel: 1 },
    { id: 'reservable', label: 'Takes Reservations', icon: AppIcons.RESERVATIONS, description: 'Accepts reservations', category: 'amenities', minPriceLevel: 2 },
    { id: 'live_music', label: 'Live Music', icon: AppIcons.LIVE_MUSIC, description: 'Live performances', category: 'amenities', availableFor: ['dinner'], minPriceLevel: 2 },
    { id: 'good_for_groups', label: 'Good for Groups', icon: AppIcons.GROUPS, description: 'Large parties welcome', category: 'amenities', minPriceLevel: 1 },
    { id: 'good_for_children', label: 'Family-Friendly', icon: AppIcons.FAMILY, description: 'Kids menu and welcoming', category: 'amenities', minPriceLevel: 1 },
    { id: 'allows_dogs', label: 'Dog-Friendly', icon: AppIcons.PET_FRIENDLY, description: 'Pets welcome', category: 'amenities', minPriceLevel: 1 },
    { id: 'takeout', label: 'Takeout Available', icon: AppIcons.TAKEOUT, description: 'Food available for pickup', category: 'amenities', minPriceLevel: 1 },
    { id: 'delivery', label: 'Delivery Available', icon: AppIcons.DELIVERY, description: 'Food delivery service', category: 'amenities', minPriceLevel: 1 },
    { id: 'wifi', label: 'WiFi Available', icon: AppIcons.WIFI, description: 'Good for working or studying', category: 'amenities', availableFor: ['coffee', 'lunch'], minPriceLevel: 1 },
    { id: 'parking', label: 'Parking Available', icon: AppIcons.PARKING, description: 'On-site or nearby parking', category: 'amenities', minPriceLevel: 1 },
    // Accessibility
    { id: 'wheelchair_accessible', label: 'Wheelchair Accessible', icon: AppIcons.ACCESSIBILITY, description: 'ADA compliant entrance', category: 'accessibility', minPriceLevel: 1 },
  ]

  const getFilteredFeatures = (): FeatureOption[] => {
    const mealTypes = wizardState.mealTypes || []
    const budget = wizardState.budget || []
    const maxPriceLevel = budget.length > 0 ? Math.max(...budget) : 4

    return ALL_FEATURE_OPTIONS.filter(feature => {
      if (feature.minPriceLevel && feature.minPriceLevel > maxPriceLevel) return false
      if (feature.availableFor && mealTypes.length > 0) {
        return feature.availableFor.some(mealType => mealTypes.includes(mealType))
      }
      return true
    })
  }

  const handleFeatureToggle = (featureId: string) => {
    const currentFeatures = wizardState.features || []
    const newFeatures = currentFeatures.includes(featureId) ? currentFeatures.filter(id => id !== featureId) : [...currentFeatures, featureId]
    updateWizardState({ features: newFeatures })
  }

  const renderFeaturesByCategory = () => {
    const filteredFeatures = getFilteredFeatures()
    const categories: { [key: string]: FeatureOption[] } = { beverages: [], amenities: [], accessibility: [] }
    
    filteredFeatures.forEach(feature => { categories[feature.category].push(feature) })

    return Object.entries(categories).map(([categoryName, features]) => {
      if (features.length === 0) return null
      const categoryTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1)

      return (
        <View key={categoryName} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{categoryTitle}</Text>
          {features.map((feature) => {
            const isSelected = wizardState.features?.includes(feature.id) || false
            return (
              <TouchableOpacity key={feature.id} style={[styles.featureCard, isSelected && styles.selectedFeatureCard]} onPress={() => handleFeatureToggle(feature.id)} activeOpacity={0.7}>
                <View style={styles.featureContent}>
                  <View style={[styles.featureIconContainer, isSelected && styles.selectedFeatureIconContainer]}>
                    <FontAwesomeIcon icon={feature.icon} size={20} color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary} />
                  </View>
                  <View style={styles.featureInfo}>
                    <Text style={[styles.featureLabel, isSelected && styles.selectedFeatureLabel]}>{feature.label}</Text>
                    <Text style={[styles.featureDescription, isSelected && styles.selectedFeatureDescription]}>{feature.description}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={styles.checkIconContainer}>
                    <FontAwesomeIcon icon={AppIcons.CHECK} size={20} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      )
    }).filter(Boolean)
  }

  const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: theme.spacing.lg },
    header: { paddingVertical: theme.spacing.md, alignItems: 'center' },
    subtitle: { fontSize: theme.typography.fontSize.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.md },
    scrollView: { flex: 1 },
    categorySection: { marginBottom: theme.spacing.lg },
    categoryTitle: { fontSize: theme.typography.fontSize.body, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: theme.spacing.md, paddingLeft: theme.spacing.sm },
    featureCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 2, borderColor: theme.colors.border, ...theme.shadows.small },
    selectedFeatureCard: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.primary },
    featureContent: { flexDirection: 'row', alignItems: 'center' },
    featureIconContainer: { width: 40, height: 40, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surfaceElevated, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    selectedFeatureIconContainer: { backgroundColor: theme.colors.primary },
    featureInfo: { flex: 1 },
    featureLabel: { fontSize: theme.typography.fontSize.body, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
    selectedFeatureLabel: { color: theme.colors.primary },
    featureDescription: { fontSize: theme.typography.fontSize.secondary, color: theme.colors.textSecondary },
    selectedFeatureDescription: { color: theme.colors.textPrimary },
    checkIconContainer: { position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Looking for anything specific? Select features that matter to you.</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderFeaturesByCategory()}
      </ScrollView>
    </View>
  )
}