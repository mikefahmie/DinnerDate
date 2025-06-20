// services/favoritesService.ts
import { supabase } from '../lib/supabase'
import { Restaurant } from '../hooks/useRestaurants'

export interface UserFavorite {
  id: string
  user_id: string
  restaurant_id: string
  created_at: string
  restaurant?: Restaurant
}

export interface FavoritesList {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  restaurant_ids: string[]
  created_at: string
  updated_at: string
}

class FavoritesService {
  // Get user's favorite restaurant IDs
  async getFavoriteIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('restaurant_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(fav => fav.restaurant_id) || []
    } catch (error) {
      console.error('Error fetching favorite IDs:', error)
      return []
    }
  }

  // Get user's favorite restaurants with full details
  async getFavoriteRestaurants(userId: string): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          restaurant_id,
          created_at,
          restaurants!inner (*)
        `)
        .eq('user_id', userId)
        .eq('restaurants.is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map((fav: any) => fav.restaurants as Restaurant).filter(Boolean) || []
    } catch (error) {
      console.error('Error fetching favorite restaurants:', error)
      return []
    }
  }

  // Add restaurant to favorites
  async addFavorite(userId: string, restaurantId: string): Promise<void> {
    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .single()

      if (existing) {
        return // Already favorited
      }

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          restaurant_id: restaurantId,
        })

      if (error) throw error
    } catch (error) {
      console.error('Error adding favorite:', error)
      throw error
    }
  }

  // Remove restaurant from favorites
  async removeFavorite(userId: string, restaurantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)

      if (error) throw error
    } catch (error) {
      console.error('Error removing favorite:', error)
      throw error
    }
  }

  // Toggle favorite status
  async toggleFavorite(userId: string, restaurantId: string): Promise<boolean> {
    try {
      const favoriteIds = await this.getFavoriteIds(userId)
      const isFavorited = favoriteIds.includes(restaurantId)

      if (isFavorited) {
        await this.removeFavorite(userId, restaurantId)
        return false
      } else {
        await this.addFavorite(userId, restaurantId)
        return true
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }

  // Check if restaurant is favorited
  async isFavorite(userId: string, restaurantId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return false
    }
  }

  // Remove multiple favorites
  async removeFavorites(userId: string, restaurantIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .in('restaurant_id', restaurantIds)

      if (error) throw error
    } catch (error) {
      console.error('Error removing multiple favorites:', error)
      throw error
    }
  }

  // Clear all favorites for user
  async clearAllFavorites(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error clearing all favorites:', error)
      throw error
    }
  }

  // Get favorites count
  async getFavoritesCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting favorites count:', error)
      return 0
    }
  }

  // Export favorites as text
  async exportFavorites(userId: string): Promise<string> {
    try {
      const favorites = await this.getFavoriteRestaurants(userId)
      
      if (favorites.length === 0) {
        return 'No favorites to export.'
      }

      const exportText = favorites
        .map((restaurant, index) => {
          return `${index + 1}. ${restaurant.display_name}
   ${restaurant.formatted_address}
   Rating: ${restaurant.rating}/5 (${restaurant.user_rating_count} reviews)
   Phone: ${restaurant.phone_number || 'N/A'}
   Website: ${restaurant.website_uri || 'N/A'}
   
`
        })
        .join('')

      return `My DinnerDate Favorites (${favorites.length} restaurants):

${exportText}Generated on ${new Date().toLocaleDateString()}`
    } catch (error) {
      console.error('Error exporting favorites:', error)
      return 'Error exporting favorites.'
    }
  }

  // Get favorite restaurants by cuisine type
  async getFavoritesByCuisine(userId: string): Promise<Record<string, Restaurant[]>> {
    try {
      const favorites = await this.getFavoriteRestaurants(userId)
      
      const groupedByCuisine = favorites.reduce((acc, restaurant) => {
        const cuisine = restaurant.primary_type || 'Other'
        if (!acc[cuisine]) {
          acc[cuisine] = []
        }
        acc[cuisine].push(restaurant)
        return acc
      }, {} as Record<string, Restaurant[]>)

      return groupedByCuisine
    } catch (error) {
      console.error('Error grouping favorites by cuisine:', error)
      return {}
    }
  }

  // Get favorites statistics
  async getFavoritesStats(userId: string): Promise<{
    total: number
    averageRating: number
    priceDistribution: Record<number, number>
    topCuisines: Array<{ type: string; count: number }>
    recentlyAdded: Restaurant[]
  }> {
    try {
      const favorites = await this.getFavoriteRestaurants(userId)
      const total = favorites.length

      if (total === 0) {
        return {
          total: 0,
          averageRating: 0,
          priceDistribution: {},
          topCuisines: [],
          recentlyAdded: [],
        }
      }

      // Calculate average rating
      const averageRating = favorites.reduce((sum, r) => sum + (r.rating || 0), 0) / total

      // Price distribution
      const priceDistribution = favorites.reduce((acc, r) => {
        const price = r.price_level || 1
        acc[price] = (acc[price] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      // Top cuisines
      const cuisineCount = favorites.reduce((acc, r) => {
        const type = r.primary_type || 'restaurant'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topCuisines = Object.entries(cuisineCount)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Recently added (last 5)
      const recentlyAdded = favorites.slice(0, 5)

      return {
        total,
        averageRating: Math.round(averageRating * 10) / 10,
        priceDistribution,
        topCuisines,
        recentlyAdded,
      }
    } catch (error) {
      console.error('Error getting favorites stats:', error)
      return {
        total: 0,
        averageRating: 0,
        priceDistribution: {},
        topCuisines: [],
        recentlyAdded: [],
      }
    }
  }

  // Search within favorites
  async searchFavorites(userId: string, query: string): Promise<Restaurant[]> {
    try {
      const favorites = await this.getFavoriteRestaurants(userId)
      
      if (!query.trim()) {
        return favorites
      }

      const searchTerm = query.toLowerCase()
      
      return favorites.filter(restaurant => 
        restaurant.display_name?.toLowerCase().includes(searchTerm) ||
        restaurant.primary_type?.toLowerCase().includes(searchTerm) ||
        restaurant.formatted_address?.toLowerCase().includes(searchTerm) ||
        restaurant.neighborhood?.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      console.error('Error searching favorites:', error)
      return []
    }
  }

  // Get recommendations based on favorites
  async getRecommendationsFromFavorites(userId: string, limit: number = 5): Promise<Restaurant[]> {
    try {
      const favorites = await this.getFavoriteRestaurants(userId)
      
      if (favorites.length === 0) {
        return []
      }

      // Extract cuisine types and features from favorites
      const favoriteCuisines = [...new Set(favorites.map(r => r.primary_type).filter(Boolean))]
      const favoriteFeatures = favorites.reduce((acc, r) => {
        if (r.outdoor_seating) acc.push('outdoor_seating')
        if (r.good_for_groups) acc.push('good_for_groups')
        if (r.live_music) acc.push('live_music')
        if (r.good_for_children) acc.push('good_for_children')
        return acc
      }, [] as string[])

      // Find similar restaurants not in favorites
      const favoriteIds = favorites.map(r => r.id)
      
      let query = supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(${favoriteIds.join(',')})`)
        .gte('rating', 4.0)
        .limit(limit * 2) // Get more to filter

      // Filter by favorite cuisines if available
      if (favoriteCuisines.length > 0) {
        query = query.in('primary_type', favoriteCuisines)
      }

      const { data, error } = await query

      if (error) throw error

      let recommendations = data || []

      // Score recommendations based on similarity to favorites
      recommendations = recommendations
        .map(restaurant => {
          let score = restaurant.rating || 0
          
          // Bonus for matching features
          favoriteFeatures.forEach(feature => {
            if ((restaurant as any)[feature]) {
              score += 0.5
            }
          })
          
          return { ...restaurant, score }
        })
        .sort((a, b) => (b as any).score - (a as any).score)
        .slice(0, limit)

      return recommendations
    } catch (error) {
      console.error('Error getting recommendations from favorites:', error)
      return []
    }
  }
}

export const favoritesService = new FavoritesService()