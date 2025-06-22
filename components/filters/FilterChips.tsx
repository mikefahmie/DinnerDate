// components/filters/FilterChips.tsx - Updated for new WizardState interface
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { WizardState } from '../../screens/DiscoveryWizard'

interface FilterChipsProps {
  filters: WizardState
  onEditFilters: () => void
  onClearFilters: () => void
  showEditButton?: boolean
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onEditFilters,
  onClearFilters,
  showEditButton = true,
}) => {
  const { theme } = useTheme()

  const getActiveFilterChips = () => {
    const chips: Array<{ id: string; label: string; removable: boolean }> = []

    // Location (not removable, just informational)
    if (filters.location) {
      chips.push({
        id: 'location',
        label: filters.location,
        removable: false,
      })
    }

    // Meal Types
    if (filters.mealTypes && filters.mealTypes.length > 0) {
      const mealLabels = {
        breakfast: 'Breakfast',
        lunch: 'Lunch', 
        dinner: 'Dinner',
        coffee: 'Coffee',
        dessert: 'Dessert',
      }
      
      filters.mealTypes.forEach(meal => {
        chips.push({
          id: `meal-${meal}`,
          label: mealLabels[meal as keyof typeof mealLabels] || meal,
          removable: true,
        })
      })
    }

    // Budget (Price Levels)
    if (filters.budget && filters.budget.length > 0 && filters.budget.length < 4) {
      const budgetLabels = {
        1: '$',
        2: '$$',
        3: '$$$',
        4: '$$$$',
      }
      
      const budgetString = filters.budget
        .sort((a, b) => a - b)
        .map(level => budgetLabels[level as keyof typeof budgetLabels])
        .join(', ')
      
      chips.push({
        id: 'budget',
        label: `Budget: ${budgetString}`,
        removable: true,
      })
    }

    // Cuisine Types
    if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
      const cuisineLabels = {
        american_restaurant: 'American',
        italian_restaurant: 'Italian',
        japanese_restaurant: 'Japanese',
        chinese_restaurant: 'Chinese',
        mexican_restaurant: 'Mexican',
        thai_restaurant: 'Thai',
        indian_restaurant: 'Indian',
        french_restaurant: 'French',
        pizza_restaurant: 'Pizza',
        burger_restaurant: 'Burgers',
        seafood_restaurant: 'Seafood',
        steakhouse: 'Steakhouse',
        cafe: 'Cafe',
        bakery: 'Bakery',
        deli: 'Deli',
        // Add more as needed
      }
      
      if (filters.cuisineTypes.length <= 3) {
        // Show individual cuisines if 3 or fewer
        filters.cuisineTypes.forEach(cuisine => {
          chips.push({
            id: `cuisine-${cuisine}`,
            label: cuisineLabels[cuisine as keyof typeof cuisineLabels] || cuisine,
            removable: true,
          })
        })
      } else {
        // Show count if more than 3
        chips.push({
          id: 'cuisines',
          label: `${filters.cuisineTypes.length} Cuisines`,
          removable: true,
        })
      }
    }

    // Dietary Restrictions
    if (filters.dietary && filters.dietary.length > 0) {
      const dietaryLabels = {
        vegetarian: 'Vegetarian',
        vegan: 'Vegan',
        gluten_free: 'Gluten-Free',
      }
      
      filters.dietary.forEach(restriction => {
        if (restriction !== 'none') {
          chips.push({
            id: `dietary-${restriction}`,
            label: dietaryLabels[restriction as keyof typeof dietaryLabels] || restriction,
            removable: true,
          })
        }
      })
    }

    // Features
    if (filters.features && filters.features.length > 0) {
      const featureLabels = {
        outdoor_seating: 'Outdoor Seating',
        live_music: 'Live Music',
        good_for_groups: 'Groups',
        family_friendly: 'Family',
        wheelchair_accessible: 'Accessible',
        parking_available: 'Parking',
        wifi_available: 'WiFi',
        serves_beer: 'Beer',
        serves_wine: 'Wine',
        serves_cocktails: 'Cocktails',
        serves_coffee: 'Coffee',
        reservable: 'Reservations',
        allows_dogs: 'Dog Friendly',
        good_for_sports: 'Sports',
      }
      
      if (filters.features.length <= 2) {
        // Show individual features if 2 or fewer
        filters.features.forEach(feature => {
          chips.push({
            id: `feature-${feature}`,
            label: featureLabels[feature as keyof typeof featureLabels] || feature,
            removable: true,
          })
        })
      } else {
        // Show count if more than 2
        chips.push({
          id: 'features',
          label: `${filters.features.length} Features`,
          removable: true,
        })
      }
    }

    return chips
  }

  const handleRemoveChip = (chipId: string) => {
    // This triggers the edit filters modal since individual removal 
    // is complex with the current state structure
    onEditFilters()
  }

  const renderChip = (chip: { id: string; label: string; removable: boolean }) => {
    const isLocation = chip.id === 'location'
    
    return (
      <View
        key={chip.id}
        style={[
          styles.chip,
          isLocation && styles.locationChip,
        ]}
      >
        <Text
          style={[
            styles.chipText,
            isLocation && styles.locationChipText,
          ]}
          numberOfLines={1}
        >
          {chip.label}
        </Text>
        
        {chip.removable && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveChip(chip.id)}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Icon
              name="times"
              type="font-awesome"
              size={12}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const activeChips = getActiveFilterChips()
  const removableChips = activeChips.filter(chip => chip.removable)

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chipsScrollView: {
      flex: 1,
    },
    chipsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: theme.spacing.md,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginRight: theme.spacing.xs,
      maxWidth: 120,
    },
    locationChip: {
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textOnPrimary,
      fontWeight: '500',
      flex: 1,
    },
    locationChipText: {
      color: theme.colors.textSecondary,
    },
    removeButton: {
      marginLeft: theme.spacing.xs,
      padding: 2,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginRight: theme.spacing.xs,
    },
    editButtonText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textPrimary,
      marginLeft: theme.spacing.xs,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    clearButtonText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.error,
      marginLeft: theme.spacing.xs,
    },
    emptyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
    },
    emptyText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      marginLeft: theme.spacing.sm,
      marginRight: theme.spacing.md,
    },
    addFiltersButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    addFiltersText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textOnPrimary,
      fontWeight: '600',
    },
  })

  if (activeChips.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="filter"
          type="font-awesome"
          size={16}
          color={theme.colors.textMuted}
        />
        <Text style={styles.emptyText}>No filters applied</Text>
        {showEditButton && (
          <TouchableOpacity
            style={styles.addFiltersButton}
            onPress={onEditFilters}
          >
            <Text style={styles.addFiltersText}>Add Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScrollView}
        contentContainerStyle={styles.chipsContainer}
      >
        {activeChips.map(renderChip)}
      </ScrollView>
      
      <View style={styles.actionsContainer}>
        {showEditButton && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEditFilters}
          >
            <Icon
              name="pencil"
              type="font-awesome"
              size={12}
              color={theme.colors.textPrimary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        
        {removableChips.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearFilters}
          >
            <Icon
              name="times-circle"
              type="font-awesome"
              size={12}
              color={theme.colors.error}
            />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FilterChips