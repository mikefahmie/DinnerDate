// components/filters/FilterChips.tsx
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
        latenight: 'Late Night',
      }
      
      filters.mealTypes.forEach(meal => {
        chips.push({
          id: `meal-${meal}`,
          label: mealLabels[meal as keyof typeof mealLabels] || meal,
          removable: true,
        })
      })
    }

    // Service Styles
    if (filters.serviceStyles && filters.serviceStyles.length > 0) {
      const serviceLabels = {
        dine_in: 'Dine In',
        takeout: 'Takeout',
        delivery: 'Delivery',
      }
      
      filters.serviceStyles.forEach(service => {
        chips.push({
          id: `service-${service}`,
          label: serviceLabels[service as keyof typeof serviceLabels] || service,
          removable: true,
        })
      })
    }

    // Timing
    if (filters.timing === 'later' && filters.scheduledTime) {
      const date = new Date(filters.scheduledTime)
      const timeStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
      chips.push({
        id: 'timing',
        label: `Scheduled: ${timeStr}`,
        removable: true,
      })
    } else if (filters.timing === 'now') {
      chips.push({
        id: 'timing',
        label: 'Right Now',
        removable: true,
      })
    }

    // Budget
    if (filters.budget && (filters.budget[0] > 1 || filters.budget[1] < 4)) {
      const [min, max] = filters.budget
      const priceSymbols = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }
      
      if (min === max) {
        chips.push({
          id: 'budget',
          label: priceSymbols[min as keyof typeof priceSymbols],
          removable: true,
        })
      } else {
        chips.push({
          id: 'budget',
          label: `${priceSymbols[min as keyof typeof priceSymbols]} - ${priceSymbols[max as keyof typeof priceSymbols]}`,
          removable: true,
        })
      }
    }

    // Dietary
    if (filters.dietary && filters.dietary.length > 0 && !filters.dietary.includes('none')) {
      const dietaryLabels = {
        vegetarian: 'Vegetarian',
        vegan: 'Vegan',
        gluten_free: 'Gluten-Free',
      }
      
      filters.dietary.forEach(diet => {
        chips.push({
          id: `dietary-${diet}`,
          label: dietaryLabels[diet as keyof typeof dietaryLabels] || diet,
          removable: true,
        })
      })
    }

    // Features
    if (filters.features && filters.features.length > 0) {
      const featureLabels = {
        live_music: 'Live Music',
        good_for_watching_sports: 'Sports',
        good_for_groups: 'Groups',
        good_for_children: 'Kid Friendly',
        outdoor_seating: 'Outdoor Seating',
        allows_dogs: 'Dog Friendly',
        reservable: 'Reservations',
        parking_available: 'Parking',
        wheelchair_accessible: 'Accessible',
        wifi_available: 'WiFi',
      }
      
      filters.features.forEach(feature => {
        chips.push({
          id: `feature-${feature}`,
          label: featureLabels[feature as keyof typeof featureLabels] || feature,
          removable: true,
        })
      })
    }

    return chips
  }

  const handleRemoveChip = (chipId: string) => {
    // This would need to be implemented based on your state management
    // For now, just trigger the edit filters modal
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