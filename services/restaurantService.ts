// services/restaurantService.ts - Updated to use centralized market config
import { supabase } from '../lib/supabase'
import { WizardState } from '../screens/DiscoveryWizard'
import { Restaurant } from '../hooks/useRestaurants'
import { MarketConfig, getDefaultMarket } from '../config/markets'

export interface RestaurantFilters {
  location?: string
  mealTypes?: string[]
  budget?: number[]
  cuisineTypes?: string[]
  dietary?: string[]
  features?: string[]
  isOpen?: boolean
  hasPhotos?: boolean
  minRating?: number
}

export interface RestaurantSearchOptions {
  limit?: number
  offset?: number
  sortBy?: 'rating' | 'distance' | 'price' | 'name'
  sortOrder?: 'asc' | 'desc'
}

class RestaurantService {
  // Get available markets from database
  async getAvailableMarkets(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('market')
        .eq('is_active', true)

      if (error) throw error

      // Get unique markets and filter by active markets only
      const uniqueMarkets = [...new Set(data?.map(item => item.market) || [])]
      const activeMarkets = MarketConfig.getActiveMarkets().map(m => m.name)
      
      // Return intersection of database markets and active config markets
      return uniqueMarkets
        .filter(market => activeMarkets.includes(market))
        .sort()
    } catch (error) {
      console.error('Error fetching available markets:', error)
      return [getDefaultMarket()] // Fallback to default market
    }
  }

  // Get a single restaurant by ID
  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching restaurant:', error)
      return null
    }
  }

  // Search restaurants with filters - Updated to use market config
  async searchRestaurants(
    filters: RestaurantFilters,
    options: RestaurantSearchOptions = {}
  ): Promise<{ restaurants: Restaurant[]; total: number }> {
    try {
      let query = supabase
        .from('restaurants')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      // Market filter using centralized config
      if (filters.location) {
        // Normalize the location to the correct market name
        const normalizedMarket = MarketConfig.normalizeToMarketName(filters.location)
        query = query.eq('market', normalizedMarket)
      } else {
        // Default to current active market
        query = query.eq('market', getDefaultMarket())
      }

      // Budget filter (price levels)
      if (filters.budget && filters.budget.length > 0) {
        query = query.in('price_level', filters.budget)
      }

      // Meal types filter
      if (filters.mealTypes && filters.mealTypes.length > 0) {
        const mealConditions: string[] = []
        
        filters.mealTypes.forEach(mealType => {
          switch (mealType) {
            case 'breakfast':
              mealConditions.push('serves_breakfast.eq.true')
              break
            case 'brunch':
              mealConditions.push('serves_brunch.eq.true')
              break
            case 'lunch':
              mealConditions.push('serves_lunch.eq.true')
              break
            case 'dinner':
              mealConditions.push('serves_dinner.eq.true')
              break
            case 'coffee':
              mealConditions.push('serves_coffee.eq.true')
              break
            case 'dessert':
              mealConditions.push('serves_dessert.eq.true')
              break
          }
        })

        if (mealConditions.length > 0) {
          // Use OR condition for meal types
          query = query.or(mealConditions.join(','))
        }
      }

      // Cuisine types filter
      if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
        query = query.in('primary_type', filters.cuisineTypes)
      }

      // Dietary restrictions filter
      if (filters.dietary && filters.dietary.length > 0) {
        filters.dietary.forEach(dietary => {
          switch (dietary) {
            case 'vegetarian':
              query = query.eq('serves_vegetarian_food', true)
              break
            // Add more dietary filters as needed
          }
        })
      }

      // Features filter
      if (filters.features && filters.features.length > 0) {
        filters.features.forEach(feature => {
          switch (feature) {
            case 'outdoor_seating':
              query = query.eq('outdoor_seating', true)
              break
            case 'serves_wine':
              query = query.eq('serves_wine', true)
              break
            case 'serves_beer':
              query = query.eq('serves_beer', true)
              break
            case 'serves_cocktails':
              query = query.eq('serves_cocktails', true)
              break
            case 'good_for_groups':
              query = query.eq('good_for_groups', true)
              break
            case 'reservable':
              query = query.eq('reservable', true)
              break
            case 'takeout':
              query = query.eq('takeout', true)
              break
            case 'delivery':
              query = query.eq('delivery', true)
              break
            case 'good_for_children':
              query = query.eq('good_for_children', true)
              break
            case 'allows_dogs':
              query = query.eq('allows_dogs', true)
              break
            case 'live_music':
              query = query.eq('live_music', true)
              break
            case 'good_for_watching_sports':
              query = query.eq('good_for_watching_sports', true)
              break
          }
        })
      }

      // Additional filters
      if (filters.minRating) {
        query = query.gte('rating', filters.minRating)
      }

      if (filters.hasPhotos) {
        query = query.not('photos', 'is', null)
        query = query.neq('photos', '{}') // Not empty array
      }

      // Apply sorting
      const { limit = 20, offset = 0, sortBy = 'rating', sortOrder = 'desc' } = options
      
      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: sortOrder === 'asc' })
          break
        case 'price':
          query = query.order('price_level', { ascending: sortOrder === 'asc' })
          break
        case 'name':
          query = query.order('name', { ascending: sortOrder === 'asc' })
          break
        case 'distance':
          // For distance sorting, you'd need user location
          // For now, fall back to rating
          query = query.order('rating', { ascending: false })
          break
        default:
          query = query.order('rating', { ascending: false })
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        restaurants: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Error searching restaurants:', error)
      return {
        restaurants: [],
        total: 0
      }
    }
  }

  // Convert WizardState to RestaurantFilters
  wizardStateToFilters(wizardState: WizardState): RestaurantFilters {
    return {
      location: wizardState.location,
      mealTypes: wizardState.mealTypes,
      budget: wizardState.budget,
      cuisineTypes: wizardState.cuisineTypes,
      dietary: wizardState.dietary,
      features: wizardState.features,
    }
  }

  // Get featured restaurants for a market - Updated with centralized config
  async getFeaturedRestaurants(
    market?: string,
    limit: number = 10
  ): Promise<Restaurant[]> {
    // Use provided market or default to current active market
    const targetMarket = market ? MarketConfig.normalizeToMarketName(market) : getDefaultMarket()
    
    const filters: RestaurantFilters = {
      location: targetMarket,
      minRating: 4.0,
      hasPhotos: true,
    }
    
    const { restaurants } = await this.searchRestaurants(filters, {
      limit,
      sortBy: 'rating',
      sortOrder: 'desc',
    })

    return restaurants
  }

  // Get restaurants by cuisine type - Updated with centralized config
  async getRestaurantsByCuisine(
    cuisineType: string,
    market?: string,
    limit: number = 20
  ): Promise<Restaurant[]> {
    // Use provided market or default to current active market
    const targetMarket = market ? MarketConfig.normalizeToMarketName(market) : getDefaultMarket()
    
    const filters: RestaurantFilters = {
      cuisineTypes: [cuisineType],
      location: targetMarket,
    }

    const { restaurants } = await this.searchRestaurants(filters, {
      limit,
      sortBy: 'rating',
      sortOrder: 'desc',
    })

    return restaurants
  }

  // Get random restaurant recommendations - Updated with centralized config
  async getRandomRecommendations(
    market?: string,
    count: number = 5
  ): Promise<Restaurant[]> {
    try {
      // Use provided market or default to current active market
      const targetMarket = market ? MarketConfig.normalizeToMarketName(market) : getDefaultMarket()
      
      // Get total count first
      const { count: total } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('market', targetMarket)
        .gte('rating', 3.5)

      if (!total || total === 0) return []

      // Generate random offsets
      const randomOffsets = Array.from({ length: count }, () => 
        Math.floor(Math.random() * total)
      )

      // Fetch restaurants at random positions
      const recommendations: Restaurant[] = []
      
      for (const offset of randomOffsets) {
        const { data } = await supabase
          .from('restaurants')
          .select('*')
          .eq('is_active', true)
          .eq('market', targetMarket)
          .gte('rating', 3.5)
          .range(offset, offset)
          .limit(1)

        if (data && data.length > 0) {
          recommendations.push(data[0])
        }
      }

      return recommendations
    } catch (error) {
      console.error('Error fetching random recommendations:', error)
      return []
    }
  }

  // Get restaurant statistics for a market - Updated with centralized config
  async getRestaurantStats(market?: string): Promise<{
    total: number
    averageRating: number
    priceDistribution: { [key: number]: number }
    topCuisines: { type: string; count: number }[]
  }> {
    try {
      let query = supabase
        .from('restaurants')
        .select('rating, price_level, primary_type')
        .eq('is_active', true)

      if (market) {
        const targetMarket = MarketConfig.normalizeToMarketName(market)
        query = query.eq('market', targetMarket)
      } else {
        query = query.eq('market', getDefaultMarket())
      }

      const { data, error } = await query

      if (error) throw error
      if (!data) return { total: 0, averageRating: 0, priceDistribution: {}, topCuisines: [] }

      // Calculate statistics
      const total = data.length
      const averageRating = data.reduce((sum, r) => sum + (r.rating || 0), 0) / total

      // Price distribution
      const priceDistribution: { [key: number]: number } = {}
      data.forEach(r => {
        if (r.price_level) {
          priceDistribution[r.price_level] = (priceDistribution[r.price_level] || 0) + 1
        }
      })

      // Top cuisines
      const cuisineCounts: { [key: string]: number } = {}
      data.forEach(r => {
        if (r.primary_type) {
          cuisineCounts[r.primary_type] = (cuisineCounts[r.primary_type] || 0) + 1
        }
      })

      const topCuisines = Object.entries(cuisineCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        total,
        averageRating,
        priceDistribution,
        topCuisines
      }
    } catch (error) {
      console.error('Error fetching restaurant stats:', error)
      return { total: 0, averageRating: 0, priceDistribution: {}, topCuisines: [] }
    }
  }
}

export const restaurantService = new RestaurantService()
export default restaurantService