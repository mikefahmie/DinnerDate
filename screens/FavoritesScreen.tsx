// screens/FavoritesScreen.tsx
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
import { useNavigation } from '@react-navigation/native'
import { useFavorites } from '../hooks/useFavorites'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'

type FavoritesNavigationProp = NativeStackNavigationProp<RootStackParamList>


const FavoritesScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<FavoritesNavigationProp>()
  const [refreshing, setRefreshing] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const {
    favorites,
    loading,
    refresh,
    removeFavorite,
    getFavoriteRestaurants
  } = useFavorites()

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
      navigation.navigate('RestaurantDetail', { restaurantId })
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
    navigation.navigate('DiscoveryWizard')
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
      onAction={handleDiscoverMore}
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
          text: `Your Favorites${favoriteCount > 0 ? ` (${favoriteCount})` : ''}`,
          style: {
            color: theme.colors.textOnPrimary,
            fontSize: theme.typography.fontSize.h2,
            fontWeight: '700',
          },
        }}
        rightComponent={
          favoriteCount > 0 ? {
            icon: 'more-vert',
            type: 'material',
            color: theme.colors.textOnPrimary,
            onPress: () => {
              Alert.alert(
                'Favorites Options',
                'What would you like to do?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Share List', onPress: handleShare },
                  { text: 'Select Multiple', onPress: toggleSelectionMode },
                ]
              )
            },
          } : undefined
        }
        backgroundColor={theme.colors.primary}
      />
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      paddingHorizontal: theme.spacing.screenPadding,
      paddingBottom: theme.spacing.xl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionBar: {
      flexDirection: 'row',
      padding: theme.spacing.screenPadding,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    shareButton: {
      flex: 1,
      marginRight: theme.spacing.sm,
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
    },
    shareButtonTitle: {
      color: theme.colors.primary,
    },
    selectButton: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
    },
    selectButtonTitle: {
      color: theme.colors.textPrimary,
    },
  })

  if (loading && favoriteRestaurants.length === 0) {
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
      
      {favoriteRestaurants.length > 0 && !selectionMode && (
        <View style={styles.actionBar}>
          <Button
            title="Share List"
            buttonStyle={styles.shareButton}
            titleStyle={styles.shareButtonTitle}
            icon={{ name: 'share', type: 'material', color: theme.colors.primary }}
            onPress={handleShare}
          />
          <Button
            title="Select Multiple"
            buttonStyle={styles.selectButton}
            titleStyle={styles.selectButtonTitle}
            icon={{ name: 'check-circle', type: 'material', color: theme.colors.textPrimary }}
            onPress={toggleSelectionMode}
          />
        </View>
      )}

      <FlatList
        data={favoriteRestaurants}
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
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default FavoritesScreen