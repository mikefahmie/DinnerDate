// screens/RestaurantDiscoveryScreen.tsx
import React, { useState, useEffect } from 'react'
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native'
import { Header } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useRestaurants } from '../hooks/useRestaurants'
import { WizardState } from './DiscoveryWizard'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import FilterChips from '../components/filters/FilterChips'
import SortOptions from '../components/search/SortOptions'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import FilterModal from '../components/filters/FilterModal'

type RouteParams = {
  RestaurantDiscovery: {
    filters?: WizardState
  }
}

type RestaurantDiscoveryRouteProp = RouteProp<RouteParams, 'RestaurantDiscovery'>

export type SortOption = 'distance' | 'rating' | 'price' | 'openNow'

const RestaurantDiscoveryScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<RestaurantDiscoveryRouteProp>()
  
  const [filters, setFilters] = useState<WizardState>(
    route.params?.filters || {
      location: 'Ann Arbor, MI',
      mealTypes: [],
      serviceStyles: [],
      timing: 'now',
      budget: [1, 4],
      dietary: [],
      features: []
    }
  )
  
  const [sortBy, setSortBy] = useState<SortOption>('distance')
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const {
    restaurants,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  } = useRestaurants(filters, sortBy)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('RestaurantDetail', { restaurantId })
  }

  const handleEditFilters = () => {
    setFilterModalVisible(true)
  }

  const handleFiltersUpdate = (newFilters: WizardState) => {
    setFilters(newFilters)
    setFilterModalVisible(false)
  }

  const handleClearFilters = () => {
    setFilters({
      location: 'Ann Arbor, MI',
      mealTypes: [],
      serviceStyles: [],
      timing: 'now',
      budget: [1, 4],
      dietary: [],
      features: []
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.mealTypes.length > 0) count++
    if (filters.serviceStyles.length > 0) count++
    if (filters.budget[0] > 1 || filters.budget[1] < 4) count++
    if (filters.dietary.length > 0) count++
    if (filters.features.length > 0) count++
    return count
  }

  const renderRestaurantCard = ({ item }: { item: any }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item.id)}
    />
  )

  const renderEmptyState = () => {
    if (loading) return <LoadingSpinner />
    
    return (
      <EmptyState
        title="No restaurants found"
        message="Try adjusting your filters to see more options"
        actionText="Edit Filters"
        onAction={handleEditFilters}
        secondaryActionText="View All Restaurants"
        onSecondaryAction={handleClearFilters}
      />
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    filterSection: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.screenPadding,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    sortContainer: {
      marginBottom: theme.spacing.sm,
    },
    listContainer: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: theme.spacing.screenPadding,
      paddingBottom: theme.spacing.xl,
    },
    loadingFooter: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  })

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{
          text: 'Discover Restaurants',
          style: {
            color: theme.colors.textOnPrimary,
            fontSize: theme.typography.fontSize.h2,
            fontWeight: '700',
          },
        }}
        rightComponent={{
          icon: 'tune',
          type: 'material',
          color: theme.colors.textOnPrimary,
          onPress: handleEditFilters,
          ...(getActiveFiltersCount() > 0 && {
            badge: {
              value: getActiveFiltersCount(),
              status: 'warning',
            },
          }),
        }}
        backgroundColor={theme.colors.primary}
      />

      <View style={styles.filterSection}>
        <View style={styles.sortContainer}>
          <SortOptions
            selectedSort={sortBy}
            onSortChange={setSortBy}
          />
        </View>
        
        <FilterChips
          filters={filters}
          onEditFilters={handleEditFilters}
          onClearFilters={handleClearFilters}
        />
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            loading && restaurants.length > 0 ? (
              <View style={styles.loadingFooter}>
                <LoadingSpinner size="small" />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        onFiltersUpdate={handleFiltersUpdate}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  )
}

export default RestaurantDiscoveryScreen