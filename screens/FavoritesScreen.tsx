// screens/FavoritesScreen.tsx - Fixed to work with actual useFavorites hook
import React, { useState, useEffect } from 'react'
import { 
  View, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  Alert,
  Share
} from 'react-native'
import { Header, Button } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { useFavorites } from '../hooks/useFavorites'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { MainTabParamList } from '../types/navigation'

// Use the tab navigation type to ensure we stay within tabs
type FavoritesNavigationProp = NavigationProp<MainTabParamList>

const FavoritesScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<FavoritesNavigationProp>()
  const [refreshing, setRefreshing] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Get functions from useFavorites hook
  const {
    favorites,
    loading,
    refresh,
    removeFavorite,
    getFavoriteRestaurants,
    isFavorite
  } = useFavorites()

  // Local state for favorite restaurants with full details
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<any[]>([])

  useEffect(() => {
    loadFavoriteRestaurants()
  }, [favorites])

  const loadFavoriteRestaurants = async () => {
    try {
      const restaurants = await getFavoriteRestaurants()
      setFavoriteRestaurants(restaurants)
    } catch (error) {
      console.error('Error loading favorite restaurants:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    await loadFavoriteRestaurants()
    setRefreshing(false)
  }

  const handleRestaurantPress = (restaurantId: string) => {
    if (selectionMode) {
      toggleSelection(restaurantId)
    } else {
      // For restaurant detail, you might need to navigate to the stack navigator
      // This depends on your navigation structure - you may need to adjust this
      console.log('Navigate to restaurant detail:', restaurantId)
      // navigation.navigate('RestaurantDetail', { restaurantId })
    }
  }

  const handleRemoveFavorite = (restaurantId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this restaurant from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFavorite(restaurantId)
        }
      ]
    )
  }

  const toggleSelection = (restaurantId: string) => {
    setSelectedItems(prev => 
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    )
  }

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedItems([])
  }

  const handleBulkRemove = () => {
    if (selectedItems.length === 0) return

    Alert.alert(
      'Remove Favorites',
      `Remove ${selectedItems.length} restaurant${selectedItems.length > 1 ? 's' : ''} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            selectedItems.forEach(id => removeFavorite(id))
            setSelectedItems([])
            setSelectionMode(false)
          }
        }
      ]
    )
  }

  const handleShare = async () => {
    if (favoriteRestaurants.length === 0) return

    try {
      const restaurantList = favoriteRestaurants
        .map(restaurant => `${restaurant.display_name} - ${restaurant.formatted_address}`)
        .join('\n\n')

      await Share.share({
        message: `My favorite restaurants:\n\n${restaurantList}`,
        title: 'My DinnerDate Favorites',
      })
    } catch (error) {
      // Share was cancelled or failed
    }
  }

  const handleDiscoverMore = () => {
    // Navigate to the Home tab (which contains DiscoveryWizard)
    // This keeps the tab bar visible
    navigation.navigate('Home')
  }

  const renderRestaurantCard = ({ item }: { item: any }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item.id)}
      onLongPress={() => !selectionMode && handleRemoveFavorite(item.id)}
      showFavoriteButton={!selectionMode}
      isSelected={selectionMode && selectedItems.includes(item.id)}
      selectionMode={selectionMode}
    />
  )

  const renderEmptyState = () => (
    <EmptyState
      title="No favorites yet"
      message="Start saving restaurants you love!"
      actionText="Discover Restaurants"
      onAction={handleDiscoverMore} // This now navigates to Home tab
      icon="❤️"
    />
  )

  const renderHeader = () => {
    const favoriteCount = favoriteRestaurants.length
    
    if (selectionMode) {
      return (
        <Header
          leftComponent={{
            text: 'Cancel',
            style: { color: theme.colors.textOnPrimary, fontSize: 16 },
            onPress: toggleSelectionMode,
          }}
          centerComponent={{
            text: `${selectedItems.length} selected`,
            style: {
              color: theme.colors.textOnPrimary,
              fontSize: theme.typography.fontSize.h2,
              fontWeight: '700',
            },
          }}
          rightComponent={{
            text: 'Remove',
            style: { 
              color: selectedItems.length > 0 ? theme.colors.error : theme.colors.textMuted,
              fontSize: 16 
            },
            onPress: selectedItems.length > 0 ? handleBulkRemove : undefined,
          }}
          backgroundColor={theme.colors.primary}
        />
      )
    }

    return (
      <Header
        centerComponent={{
          text: `Your Favorites (${favoriteCount})`,
          style: {
            color: theme.colors.textOnPrimary,
            fontSize: theme.typography.fontSize.h2,
            fontWeight: '700',
          },
        }}
        rightComponent={{
          icon: favoriteCount > 0 ? 'more-horiz' : 'share',
          type: 'material',
          color: theme.colors.textOnPrimary,
          onPress: favoriteCount > 0 ? () => {
            // Show options menu
            Alert.alert(
              'Options',
              'Choose an action',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Select Multiple', onPress: toggleSelectionMode },
                { text: 'Share List', onPress: handleShare },
              ]
            )
          } : handleShare,
        }}
        backgroundColor={theme.colors.primary}
      />
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {favoriteRestaurants.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favoriteRestaurants}
          renderItem={renderRestaurantCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          contentContainerStyle={{ 
            paddingHorizontal: theme.spacing.md,
            paddingBottom: 100, // Add bottom padding for tab navigation
            paddingTop: theme.spacing.md,
          }}
        />
      )}
    </View>
  )
}

export default FavoritesScreen