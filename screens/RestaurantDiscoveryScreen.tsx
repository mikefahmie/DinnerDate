// screens/RestaurantDiscoveryScreen.tsx - Updated to handle search results
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
    filters?: WizardState & {
      searchResults?: string[]  // Array of restaurant IDs from search
      searchResultsData?: any[]  // Full restaurant objects from search
    }
  }
}

type RestaurantDiscoveryRouteProp = RouteProp<RouteParams, 'RestaurantDiscovery'>

export type SortOption = 'distance' | 'rating' | 'price' | 'openNow'

const RestaurantDiscoveryScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<RestaurantDiscoveryNavigationProp>()
  const route = useRoute<RestaurantDiscoveryRouteProp>()
  
  // Check if this is a search results view
  const isSearchResults = (route.params?.filters?.searchResults && route.params.filters.searchResults.length > 0) ||
                         (route.params?.filters?.searchResultsData && route.params.filters.searchResultsData.length > 0)
  
  // Updated default filters to match new WizardState interface
  const [filters, setFilters] = useState<WizardState & { searchResults?: string[]; searchResultsData?: any[] }>(
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
  const [searchResultsRestaurants, setSearchResultsRestaurants] = useState<any[]>([])

  // Use search results data directly if available, otherwise use useRestaurants hook
  const shouldUseSearchResults = filters.searchResultsData && filters.searchResultsData.length > 0

  const {
    restaurants: hookRestaurants,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  } = useRestaurants(filters, sortBy)

  // Use search results data if available, otherwise use hook results
  const restaurants = shouldUseSearchResults ? searchResultsRestaurants : hookRestaurants

  // Handle search results data
  useEffect(() => {
    if (filters.searchResultsData && filters.searchResultsData.length > 0) {
      setSearchResultsRestaurants(filters.searchResultsData)
    }
  }, [filters.searchResultsData])

  // Sort search results when sortBy changes
  useEffect(() => {
    if (shouldUseSearchResults && filters.searchResultsData) {
      const sortedResults = [...filters.searchResultsData].sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0)
          case 'price':
            return (a.price_level || 0) - (b.price_level || 0)
          case 'distance':
            // For now, sort by name since we don't have distance calculation
            return (a.name || '').localeCompare(b.name || '')
          case 'openNow':
            // Fall back to rating for now
            return (b.rating || 0) - (a.rating || 0)
          default:
            return (b.rating || 0) - (a.rating || 0)
        }
      })
      setSearchResultsRestaurants(sortedResults)
    }
  }, [sortBy, shouldUseSearchResults, filters.searchResultsData])

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
    if (!hasMore || shouldUseSearchResults) return null
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

  const getHeaderTitle = () => {
    if (isSearchResults) {
      return 'Search Results'
    }
    return restaurants.length > 0 ? `${restaurants.length} Restaurants` : 'Restaurants'
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

  if (loading && restaurants.length === 0 && !shouldUseSearchResults) {
    return (
      <View style={styles.container}>
        <Header
          centerComponent={{
            text: getHeaderTitle(),
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

  if (error && !shouldUseSearchResults) {
    return (
      <View style={styles.container}>
        <Header
          centerComponent={{
            text: getHeaderTitle(),
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
          text: getHeaderTitle(),
          style: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold' }
        }}
        backgroundColor={theme.colors.surface}
      />
      
      {/* Filter Chips Section - Hide for search results */}
      {!isSearchResults && (
        <View style={styles.filterSection}>
          <FilterChips
            filters={filters}
            onEditFilters={handleEditFilters}
            onClearFilters={handleClearFilters}
            showEditButton={true}
          />
        </View>
      )}

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
              title={isSearchResults ? "No search results" : "No restaurants found"}
              message={
                isSearchResults 
                  ? "Try adjusting your search terms or browse all restaurants."
                  : "Try adjusting your filters to see more options"
              }
              actionText={isSearchResults ? "New Search" : "Edit Filters"}
              onAction={isSearchResults ? () => navigation.goBack() : handleEditFilters}
            />
          </View>
        ) : (
          <FlatList
            data={restaurants}
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.id}
            style={styles.restaurantList}
            onEndReached={shouldUseSearchResults ? undefined : (hasMore ? loadMore : undefined)}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* Filter Modal - Hide for search results */}
      {!isSearchResults && (
        <FilterModal
          visible={filterModalVisible}
          filters={filters}
          onFiltersUpdate={handleFiltersUpdate}
          onClose={() => setFilterModalVisible(false)}
        />
      )}
    </View>
  )
}

export default RestaurantDiscoveryScreen