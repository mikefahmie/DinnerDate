// components/search/SearchResults.tsx
import React from 'react'
import { 
  View, 
  FlatList, 
  StyleSheet, 
  RefreshControl,
  ListRenderItem 
} from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import RestaurantCard from '../restaurant/RestaurantCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'

interface SearchResultsProps {
  restaurants: any[] // TODO: Add proper Restaurant type
  loading: boolean
  refreshing: boolean
  hasMore: boolean
  onRefresh: () => void
  onLoadMore: () => void
  onRestaurantPress: (restaurantId: string) => void
  onRestaurantLongPress?: (restaurantId: string) => void
  emptyStateConfig?: {
    title?: string
    message?: string
    actionText?: string
    onAction?: () => void
    secondaryActionText?: string
    onSecondaryAction?: () => void
  }
  showFavoriteButtons?: boolean
  selectionMode?: boolean
  selectedItems?: string[]
  onItemSelect?: (restaurantId: string) => void
}

const SearchResults: React.FC<SearchResultsProps> = ({
  restaurants,
  loading,
  refreshing,
  hasMore,
  onRefresh,
  onLoadMore,
  onRestaurantPress,
  onRestaurantLongPress,
  emptyStateConfig,
  showFavoriteButtons = true,
  selectionMode = false,
  selectedItems = [],
  onItemSelect,
}) => {
  const { theme } = useTheme()

  const handleRestaurantPress = (restaurant: any) => {
    if (selectionMode && onItemSelect) {
      onItemSelect(restaurant.id)
    } else {
      onRestaurantPress(restaurant.id)
    }
  }

  const handleRestaurantLongPress = (restaurant: any) => {
    if (onRestaurantLongPress) {
      onRestaurantLongPress(restaurant.id)
    }
  }

  const renderRestaurant: ListRenderItem<any> = ({ item: restaurant, index }) => (
    <RestaurantCard
      restaurant={restaurant}
      onPress={() => handleRestaurantPress(restaurant)}
      onLongPress={() => handleRestaurantLongPress(restaurant)}
      showFavoriteButton={showFavoriteButtons && !selectionMode}
      isSelected={selectionMode && selectedItems.includes(restaurant.id)}
      selectionMode={selectionMode}
    />
  )

  const renderLoadingFooter = () => {
    if (!loading || restaurants.length === 0) return null
    
    return (
      <View style={styles.loadingFooter}>
        <LoadingSpinner size="small" />
      </View>
    )
  }

  const renderEmptyState = () => {
    if (loading && restaurants.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      )
    }

    const defaultEmptyConfig = {
      title: 'No restaurants found',
      message: 'Try adjusting your filters to see more options',
      actionText: 'Edit Filters',
      onAction: undefined,
      secondaryActionText: 'View All Restaurants',
      onSecondaryAction: undefined,
    }

    const config = { ...defaultEmptyConfig, ...emptyStateConfig }

    return (
      <EmptyState
        title={config.title}
        message={config.message}
        actionText={config.actionText}
        onAction={config.onAction}
        secondaryActionText={config.secondaryActionText}
        onSecondaryAction={config.onSecondaryAction}
        icon="search"
      />
    )
  }

  const handleEndReached = () => {
    if (hasMore && !loading) {
      onLoadMore()
    }
  }

  const keyExtractor = (item: any, index: number) => {
    return item.id || index.toString()
  }

  const getItemLayout = (data: any, index: number) => ({
    length: 350, // Approximate height of restaurant card
    offset: 350 * index,
    index,
  })

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.screenPadding,
      paddingBottom: theme.spacing.xl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    loadingFooter: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    separator: {
      height: theme.spacing.md,
    },
  })

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.contentContainer,
          restaurants.length === 0 && { flex: 1 }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadingFooter}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        getItemLayout={getItemLayout}
        // Performance optimizations
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  )
}

export default SearchResults