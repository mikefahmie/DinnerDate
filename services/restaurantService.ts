// services/restaurantService.ts
import { supabase } from '../lib/supabase'
import { WizardState } from '../screens/DiscoveryWizard'
import { Restaurant } from '../hooks/useRestaurants'

export interface RestaurantFilters {
  location?: string
  mealTypes?: string[]
  serviceStyles?: string[]
  priceRange?: [number, number]
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
  // Get available markets/cities
  async getAvailableMarkets(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('location_city')
        .eq('is_active', true)

      if (error) throw error

      // Get unique cities
      const uniqueCities = [...new Set(data?.map(item => item.location_city) || [])]
      return uniqueCities.sort()
    } catch (error) {
      console.error('Error fetching available markets:', error)
      return ['Ann Arbor, MI'] // Fallback
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

  // Search restaurants with filters
  async searchRestaurants(
    filters: RestaurantFilters,
    options: RestaurantSearchOptions = {}
  ): Promise<{ restaurants: Restaurant[]; total: number }> {
    try {
      let query = supabase
        .from('restaurants')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      // Apply filters
      if (filters.location) {
        query = query.eq('location_city', filters.location)
      }

      if (filters.priceRange) {
        const [min, max] = filters.priceRange
        query = query.gte('price_level', min).lte('price_level', max)
      }

      if (filters.minRating) {
        query = query.gte('rating', filters.minRating)
      }

      if (filters.hasPhotos) {
        query = query.not('photos', 'is', null)
        query = query.neq('photos', '{}')
      }

      // Meal type filters (OR logic)
      if (filters.mealTypes && filters.mealTypes.length > 0) {
        const mealConditions = filters.mealTypes.map(meal => {
          switch (meal) {
            case 'breakfast':
              return 'serves_breakfast.eq.true'
            case 'lunch':
              return 'serves_lunch.eq.true'
            case 'dinner':
              return 'serves_dinner.eq.true'
            case 'latenight':
              return 'serves_dinner.eq.true' // Assuming late night is dinner-serving places
            default:
              return null
          }
        }).filter(Boolean)

        if (mealConditions.length > 0) {
          query = query.or(mealConditions.join(','))
        }
      }

      // Service style filters (AND logic)
      if (filters.serviceStyles && filters.serviceStyles.length > 0) {
        filters.serviceStyles.forEach(service => {
          switch (service) {
            case 'dine_in':
              query = query.eq('dine_in', true)
              break
            case 'takeout':
              query = query.eq('takeout', true)
              break
            case 'delivery':
              query = query.eq('delivery', true)
              break
          }
        })
      }

      // Dietary filters (AND logic)
      if (filters.dietary && filters.dietary.length > 0 && !filters.dietary.includes('none')) {
        filters.dietary.forEach(diet => {
          switch (diet) {
            case 'vegetarian':
            case 'vegan':
              query = query.eq('serves_vegetarian_food', true)
              break
            // Note: gluten_free would require additional data in the schema
          }
        })
      }

      // Feature filters (AND logic)
      if (filters.features && filters.features.length > 0) {
        filters.features.forEach(feature => {
          switch (feature) {
            case 'live_music':
              query = query.eq('live_music', true)
              break
            case 'good_for_watching_sports':
              query = query.eq('good_for_watching_sports', true)
              break
            case 'good_for_groups':
              query = query.eq('good_for_groups', true)
              break
            case 'good_for_children':
              query = query.eq('good_for_children', true)
              break
            case 'outdoor_seating':
              query = query.eq('outdoor_seating', true)
              break
            case 'allows_dogs':
              query = query.eq('allows_dogs', true)
              break
            case 'reservable':
              query = query.eq('reservable', true)
              break
            // Note: parking and accessibility would require JSON field queries
          }
        })
      }

      // Apply sorting
      const sortBy = options.sortBy || 'rating'
      const sortOrder = options.sortOrder || 'desc'
      
      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: sortOrder === 'asc' })
          break
        case 'price':
          query = query.order('price_level', { ascending: sortOrder === 'asc' })
          break
        case 'name':
          query = query.order('display_name', { ascending: sortOrder === 'asc' })
          break
        case 'distance':
          // Distance sorting would require PostGIS/geolocation
          // For now, fall back to rating
          query = query.order('rating', { ascending: false })
          break
        default:
          query = query.order('rating', { ascending: false })
      }

      // Apply pagination
      if (options.limit) {
        const offset = options.offset || 0
        query = query.range(offset, offset + options.limit - 1)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        restaurants: data || [],
        total: count || 0,
      }
    } catch (error) {
      console.error('Error searching restaurants:', error)
      throw error
    }
  }

  // Convert wizard state to restaurant filters
  wizardStateToFilters(wizardState: WizardState): RestaurantFilters {
    return {
      location: wizardState.location,
      mealTypes: wizardState.mealTypes,
      serviceStyles: wizardState.serviceStyles,
      priceRange: wizardState.budget as [number, number],
      dietary: wizardState.dietary,
      features: wizardState.features,
      hasPhotos: true, // Only show restaurants with photos
      minRating: 0, // No minimum rating filter by default
    }
  }

  // Get restaurants by location with basic filters
  async getRestaurantsByLocation(
    location: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ restaurants: Restaurant[]; total: number }> {
    return this.searchRestaurants(
      { location, hasPhotos: true },
      { limit, offset, sortBy: 'rating', sortOrder: 'desc' }
    )
  }

  // Get top-rated restaurants
  async getTopRatedRestaurants(
    location?: string,
    limit: number = 10
  ): Promise<Restaurant[]> {
    const filters: RestaurantFilters = {
      minRating: 4.0,
      hasPhotos: true,
    }
    
    if (location) {
      filters.location = location
    }

    const { restaurants } = await this.searchRestaurants(filters, {
      limit,
      sortBy: 'rating',
      sortOrder: 'desc',
    })

    return restaurants
  }

  // Get restaurants by cuisine type
  async getRestaurantsByCuisine(
    cuisineType: string,
    location?: string,
    limit: number = 20
  ): Promise<Restaurant[]> {
    try {
      let query = supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .contains('types', [cuisineType])
        .order('rating', { ascending: false })
        .limit(limit)

      if (location) {
        query = query.eq('location_city', location)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching restaurants by cuisine:', error)
      return []
    }
  }

  // Get random restaurant recommendations
  async getRandomRecommendations(
    location: string,
    count: number = 5
  ): Promise<Restaurant[]> {
    try {
      // Get total count first
      const { count: total } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('location_city', location)
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
          .eq('location_city', location)
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

  // Get restaurant statistics
  async getRestaurantStats(location?: string): Promise<{
    total: number
    averageRating: number
    priceDistribution: Record<number, number>
    topCuisines: Array<{ type: string; count: number }>
  }> {
    try {
      let query = supabase
        .from('restaurants')
        .select('rating, price_level, primary_type')
        .eq('is_active', true)

      if (location) {
        query = query.eq('location_city', location)
      }

      const { data, error } = await query

      if (error) throw error

      const restaurants = data || []
      const total = restaurants.length
      
      // Calculate average rating
      const averageRating = restaurants.reduce((sum, r) => sum + (r.rating || 0), 0) / total

      // Price distribution
      const priceDistribution = restaurants.reduce((acc, r) => {
        const price = r.price_level || 1
        acc[price] = (acc[price] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      // Top cuisines
      const cuisineCount = restaurants.reduce((acc, r) => {
        const type = r.primary_type || 'restaurant'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topCuisines = Object.entries(cuisineCount)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        total,
        averageRating: Math.round(averageRating * 10) / 10,
        priceDistribution,
        topCuisines,
      }
    } catch (error) {
      console.error('Error fetching restaurant stats:', error)
      return {
        total: 0,
        averageRating: 0,
        priceDistribution: {},
        topCuisines: [],
      }
    }
  }

  // Update restaurant sync status
  async updateSyncStatus(restaurantIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          last_synced: new Date().toISOString(),
          sync_version: Date.now()
        })
        .in('id', restaurantIds)

      if (error) throw error
    } catch (error) {
      console.error('Error updating sync status:', error)
      throw error
    }
  }

  // Get restaurants that need sync update
  async getRestaurantsNeedingSync(maxAge: number = 30): Promise<Restaurant[]> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - maxAge)

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .lt('last_synced', cutoffDate.toISOString())
        .limit(100)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching restaurants needing sync:', error)
      return []
    }
  }

  // Check if restaurant is currently open
  isRestaurantOpen(restaurant: Restaurant): { isOpen: boolean; status: string } {
    if (!restaurant.current_opening_hours) {
      return { isOpen: false, status: 'Hours unavailable' }
    }

    try {
      const now = new Date()
      const currentDay = now.getDay() // 0 = Sunday, 6 = Saturday
      const currentTime = now.getHours() * 100 + now.getMinutes() // HHMM format

      const periods = restaurant.current_opening_hours.periods || []
      const todaysPeriods = periods.filter((period: any) => period.open?.day === currentDay)

      if (todaysPeriods.length === 0) {
        return { isOpen: false, status: 'Closed today' }
      }

      for (const period of todaysPeriods) {
        const openTime = period.open?.hour * 100 + (period.open?.minute || 0)
        let closeTime = 2400 // Default to end of day

        if (period.close) {
          closeTime = period.close.hour * 100 + (period.close.minute || 0)
          // Handle next day closing (e.g., close at 2 AM)
          if (closeTime < openTime) {
            closeTime += 2400
          }
        }

        let currentTimeAdjusted = currentTime
        // If we're past midnight and close time is next day
        if (closeTime > 2400 && currentTime < 600) {
          currentTimeAdjusted += 2400
        }

        if (currentTimeAdjusted >= openTime && currentTimeAdjusted < closeTime) {
          const closeHour = period.close?.hour || 24
          const closeMinute = period.close?.minute || 0
          const closeTimeStr = new Date()
          closeTimeStr.setHours(closeHour, closeMinute, 0, 0)
          
          return { 
            isOpen: true, 
            status: `Open until ${closeTimeStr.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            })}` 
          }
        }
      }

      // Find next opening time
      const nextPeriod = this.findNextOpenPeriod(periods, now)
      return { 
        isOpen: false, 
        status: nextPeriod || 'Closed' 
      }
    } catch (error) {
      console.error('Error checking restaurant hours:', error)
      return { isOpen: false, status: 'Hours unavailable' }
    }
  }

  // Find the next opening time for a restaurant
  private findNextOpenPeriod(periods: any[], currentTime: Date): string | null {
    const currentDay = currentTime.getDay()
    const currentTimeNum = currentTime.getHours() * 100 + currentTime.getMinutes()

    // Check if opens later today
    const todaysPeriods = periods.filter((p: any) => p.open?.day === currentDay)
    for (const period of todaysPeriods) {
      const openTime = period.open?.hour * 100 + (period.open?.minute || 0)
      if (openTime > currentTimeNum) {
        const openTimeStr = new Date()
        openTimeStr.setHours(period.open.hour, period.open.minute, 0, 0)
        return `Opens at ${openTimeStr.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })}`
      }
    }

    // Check tomorrow
    const tomorrow = (currentDay + 1) % 7
    const tomorrowPeriods = periods.filter((p: any) => p.open?.day === tomorrow)
    if (tomorrowPeriods.length > 0) {
      const firstPeriod = tomorrowPeriods[0]
      const openTimeStr = new Date()
      openTimeStr.setHours(firstPeriod.open.hour, firstPeriod.open.minute, 0, 0)
      return `Opens tomorrow at ${openTimeStr.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`
    }

    return null
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in miles
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}

export const restaurantService = new RestaurantService()