// screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react'
import { 
  View, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Text, 
  TouchableOpacity,
  ActivityIndicator,
  Alert 
} from 'react-native'
import { Header, Icon } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'
import { supabase } from '../lib/supabase'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface Restaurant {
  id: string
  google_place_id: string  // Required field from database schema
  name: string
  display_name?: string
  formatted_address?: string
  rating?: number
  price_level?: number
  photos: string[]
  primary_type?: string
  serves_dinner?: boolean
  serves_lunch?: boolean
  serves_breakfast?: boolean
  outdoor_seating?: boolean
  market?: string
}

type SearchNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantDiscovery'>

const SearchScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation<SearchNavigationProp>()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const searchRestaurants = async (query: string) => {
    if (!query.trim()) {
      setRestaurants([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      // Simple text search across restaurant names
      // Using ilike for case-insensitive partial matching
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          id,
          google_place_id,
          name,
          display_name,
          formatted_address,
          rating,
          price_level,
          photos,
          primary_type,
          serves_dinner,
          serves_lunch,
          serves_breakfast,
          outdoor_seating,
          market
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%, display_name.ilike.%${query}%`)
        .order('rating', { ascending: false })
        .limit(50) // Limit results for performance

      if (error) {
        console.error('Search error:', error)
        Alert.alert('Search Error', 'Unable to search restaurants. Please try again.')
        setRestaurants([])
      } else {
        setRestaurants(data || [])
      }
    } catch (error) {
      console.error('Unexpected search error:', error)
      Alert.alert('Search Error', 'An unexpected error occurred. Please try again.')
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search - wait 500ms after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchRestaurants(searchQuery)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('RestaurantDetail', { restaurantId })
  }

  const handleShowAllResults = () => {
    // Navigate to RestaurantDiscoveryScreen with full restaurant objects
    // instead of just IDs to preserve photos and other data
    navigation.navigate('RestaurantDiscovery', {
      filters: {
        location: '',
        mealTypes: [],
        budget: [1, 2, 3, 4],
        cuisineTypes: [],
        dietary: [],
        features: [],
        searchResultsData: restaurants // Pass full restaurant objects instead of just IDs
      }
    })
  }

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item.id)}
      showDistance={false}
    />
  )

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Icon 
            name="search" 
            type="feather" 
            size={48} 
            color={theme.colors.textSecondary} 
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
            Search for Restaurants
          </Text>
          <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
            Type a restaurant name to get started
          </Text>
        </View>
      )
    }

    if (restaurants.length === 0) {
      return (
        <EmptyState
          title="No restaurants found"
          message={`No restaurants match "${searchQuery}". Try a different search term.`}
          actionText="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      )
    }

    return null
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    searchInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    resultsHeader: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    resultsCount: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    showAllButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    showAllText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    listContainer: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: theme.spacing.xl,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.h3,
      fontWeight: 'bold',
      marginTop: theme.spacing.md,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: theme.typography.fontSize.body,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      lineHeight: 22,
    },
  })

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{
          text: 'Search Restaurants',
          style: { 
            color: theme.colors.textPrimary, 
            fontSize: 18, 
            fontWeight: 'bold' 
          }
        }}
        backgroundColor={theme.colors.surface}
      />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Restaurant name..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {/* Results Header */}
      {restaurants.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
          </Text>
          {restaurants.length > 10 && (
            <TouchableOpacity 
              style={styles.showAllButton}
              onPress={handleShowAllResults}
            >
              <Text style={styles.showAllText}>View All Results</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results List */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.emptyMessage, { marginTop: theme.spacing.md }]}>
              Searching restaurants...
            </Text>
          </View>
        ) : (
          <FlatList
            data={restaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              restaurants.length === 0 
                ? { flex: 1 } 
                : { paddingBottom: theme.spacing.xl }
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </View>
    </View>
  )
}

export default SearchScreen