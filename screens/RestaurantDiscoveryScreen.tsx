// screens/RestaurantDiscoveryScreen.tsx - Updated for new WizardState interface
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'

type RestaurantDiscoveryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantDiscovery'>

type RouteParams = {
  RestaurantDiscovery: {
    filters?: WizardState
  }
}

type RestaurantDiscoveryRouteProp = RouteProp<RouteParams, 'RestaurantDiscovery'>

export type SortOption = 'distance' | 'rating' | 'price' | 'openNow'

const RestaurantDiscoveryScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<RestaurantDiscoveryNavigationProp>()
  const route = useRoute<RestaurantDiscoveryRouteProp>()
  
  // Updated default filters to match new WizardState interface
  const [filters, setFilters] = useState<WizardState>(
    route.params?.filters || {
      location: 'Ann Arbor/Ypsilanti',
      mealTypes: [],
      budget: [1, 2, 3, 4], // Default to all price levels
      cuisineTypes: [],
      dietary: [],
      features: []
    }
  )
  
  const [sortBy, setSortBy] = useState<SortOption>('rating')
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
    const clearedFilters: WizardState = {
      location: filters.location, // Keep location
      mealTypes: [],
      budget: [1, 2, 3, 4], // Reset to all price levels
      cuisineTypes: [],
      dietary: [],
      features: []
    }
    setFilters(clearedFilters)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
  }

  const renderRestaurant = ({ item }: { item: any }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item.id)}
    />
  )

  const renderFooter = () => {
    if (!hasMore) return null
    return <LoadingSpinner style={styles.footerLoader} />
  }

  const getActiveFilterCount = (): number => {
    let count = 0
    if (filters.mealTypes.length > 0) count++
    if (filters.budget.length < 4) count++ // Less than all price levels
    if (filters.cuisineTypes.length > 0) count++
    if (filters.dietary.length > 0) count++
    if (filters.features.length > 0) count++
    return count
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    filterSection: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sortSection: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listContainer: {
      flex: 1,
    },
    restaurantList: {
      paddingHorizontal: theme.spacing.md,
    },
    footerLoader: {
      marginVertical: theme.spacing.lg,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  if (loading && restaurants.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          centerComponent={{
            text: 'Restaurants',
            style: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold' }
          }}
          backgroundColor={theme.colors.surface}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header
          centerComponent={{
            text: 'Restaurants',
            style: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold' }
          }}
          backgroundColor={theme.colors.surface}
        />
        <View style={styles.emptyContainer}>
          <EmptyState
            title="Connection Error"
            message={error}
            actionText="Try Again"
            onAction={handleRefresh}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{
          text: `${restaurants.length} Restaurants`,
          style: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold' }
        }}
        backgroundColor={theme.colors.surface}
      />
      
      {/* Filter Chips Section */}
      <View style={styles.filterSection}>
        <FilterChips
          filters={filters}
          onEditFilters={handleEditFilters}
          onClearFilters={handleClearFilters}
          showEditButton={true}
        />
      </View>

      {/* Sort Options Section */}
      <View style={styles.sortSection}>
        <SortOptions
          selectedSort={sortBy}
          onSortChange={handleSortChange}
        />
      </View>

      {/* Restaurant List */}
      <View style={styles.listContainer}>
        {restaurants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="No restaurants found"
              message="Try adjusting your filters to see more options"
              actionText="Edit Filters"
              onAction={handleEditFilters}
            />
          </View>
        ) : (
          <FlatList
            data={restaurants}
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.id}
            style={styles.restaurantList}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Filter Modal */}
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