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
      location: 'Ann Arbor, MI',
      mealTypes: [],
      budget: [1, 2, 3, 4], // Default to all price levels
      cuisineTypes: [],
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

  // Updated clear filters to match new interface
  const handleClearFilters = () => {
    setFilters({
      location: 'Ann Arbor, MI',
      mealTypes: [],
      budget: [1, 2, 3, 4],
      cuisineTypes: [],
      dietary: [],
      features: []
    })
  }

  const removeFilter = (filterType: string, value: string) => {
    switch (filterType) {
      case 'mealType':
        setFilters(prev => ({
          ...prev,
          mealTypes: prev.mealTypes.filter(type => type !== value)
        }))
        break
      case 'budget':
        const budgetLevel = parseInt(value)
        setFilters(prev => ({
          ...prev,
          budget: prev.budget.filter(level => level !== budgetLevel)
        }))
        break
      case 'cuisine':
        setFilters(prev => ({
          ...prev,
          cuisineTypes: prev.cuisineTypes.filter(type => type !== value)
        }))
        break
      case 'dietary':
        setFilters(prev => ({
          ...prev,
          dietary: prev.dietary.filter(restriction => restriction !== value)
        }))
        break
      case 'feature':
        setFilters(prev => ({
          ...prev,
          features: prev.features.filter(feature => feature !== value)
        }))
        break
    }
  }

  const renderRestaurantItem = ({ item }: { item: any }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item.id)}
    />
  )

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <FilterChips
        filters={filters}
        onClearFilters={handleClearFilters}
        onEditFilters={handleEditFilters}
      />
      <SortOptions
        selectedSort={sortBy}
        onSortChange={setSortBy}
      />
    </View>
  )

  const renderFooter = () => {
    if (!hasMore) return null
    return <LoadingSpinner style={styles.footerLoader} />
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    list: {
      flex: 1,
    },
    contentContainer: {
      padding: theme.spacing.md,
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg,
    },
  })

  if (loading && restaurants.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <LoadingSpinner />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <EmptyState
          title="Something went wrong"
          message="We couldn't load restaurants right now. Please try again."
          actionText="Retry"
          onAction={handleRefresh}
        />
      </View>
    )
  }

  if (restaurants.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <EmptyState
          title="No restaurants found"
          message="Try adjusting your filters to see more options."
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

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