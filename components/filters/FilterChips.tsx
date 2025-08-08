// components/filters/FilterChips.tsx - Clean display with city and filter count
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
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

  const getActiveFilterCount = () => {
    let count = 0

    // Count meal types
    if (filters.mealTypes && filters.mealTypes.length > 0) {
      count += filters.mealTypes.length
    }

    // Count budget if not all levels selected (default is all 4)
    if (filters.budget && filters.budget.length > 0 && filters.budget.length < 4) {
      count += 1
    }

    // Count cuisine types
    if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
      count += filters.cuisineTypes.length
    }

    // Count dietary restrictions
    if (filters.dietary && filters.dietary.length > 0) {
      count += filters.dietary.length
    }

    // Count features
    if (filters.features && filters.features.length > 0) {
      count += filters.features.length
    }

    return count
  }

  const activeFilterCount = getActiveFilterCount()
  const hasActiveFilters = activeFilterCount > 0

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    locationChip: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    locationText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    filtersChip: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },
    filtersText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textOnPrimary,
      fontWeight: '600',
    },
    clearIcon: {
      marginLeft: theme.spacing.xs,
    },
    actionsContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
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
    },
    editButtonText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textPrimary,
      marginLeft: theme.spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      marginLeft: theme.spacing.md,
      flex: 1,
    },
  })

  return (
    <View style={styles.container}>
      {/* Location - Always shown */}
      <View style={styles.locationChip}>
        <Text style={styles.locationText}>
          {filters.location || 'Ann Arbor/Ypsilanti'}
        </Text>
      </View>

      {/* Filter Count - Only shown when there are active filters */}
      {hasActiveFilters && (
        <TouchableOpacity 
          style={styles.filtersChip}
          onPress={onEditFilters}
        >
          <Text style={styles.filtersText}>
            {activeFilterCount} Filter{activeFilterCount !== 1 ? 's' : ''} Selected
          </Text>
          <TouchableOpacity
            style={styles.clearIcon}
            onPress={onClearFilters}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Icon
              name="times-circle"
              type="font-awesome"
              size={14}
              color={theme.colors.textOnPrimary}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Actions Container */}
      <View style={styles.actionsContainer}>
        {!hasActiveFilters && (
          <Text style={styles.emptyText}>No filters applied</Text>
        )}
        
        {showEditButton && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEditFilters}
          >
            <Icon
              name="filter"
              type="font-awesome-5"
              size={12}
              color={theme.colors.textPrimary}
            />
            <Text style={styles.editButtonText}>
              {hasActiveFilters ? 'Edit' : 'Add Filters'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FilterChips