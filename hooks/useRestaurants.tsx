// hooks/useRestaurants.tsx
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { WizardState } from '../screens/DiscoveryWizard'
import { SortOption } from '../components/search/SortOptions'

interface Restaurant {
  id: string
  google_place_id: string
  name: string
  display_name: string
  formatted_address: string
  short_formatted_address?: string
  location_lat: number
  location_lng: number
  location_city: string
  business_status: string
  primary_type: string
  types: string[]
  website_uri?: string
  phone_number?: string
  international_phone_number?: string
  rating: number
  user_rating_count: number
  price_level: number
  price_range?: any
  regular_opening_hours?: any
  current_opening_hours?: any
  serves_breakfast: boolean
  serves_brunch: boolean
  serves_lunch: boolean
  serves_dinner: boolean
  serves_beer: boolean
  serves_wine: boolean
  serves_cocktails: boolean
  serves_coffee: boolean
  serves_dessert: boolean
  serves_vegetarian_food: boolean
  dine_in: boolean
  takeout: boolean
  delivery: boolean
  curbside_pickup: boolean
  reservable: boolean
  outdoor_seating: boolean
  good_for_children: boolean
  good_for_groups: boolean
  good_for_watching_sports: boolean
  live_music: boolean
  allows_dogs: boolean
  restroom: boolean
  menu_for_children: boolean
  accessibility_options?: any
  parking_options?: any
  payment_options?: any
  photos: string[]
  editorial_summary?: string
  reviews_summary?: any
  generative_summary?: string
  neighborhood?: string
  last_synced: string
  sync_version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UseRestaurantsResult {
  restaurants: Restaurant[]
  loading: boolean
  error: string | null
  hasMore: boolean
  totalCount: number
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  resetResults: () => void
}

const RESTAURANTS_PER_PAGE = 20

export const useRestaurants = (
  filters: WizardState,
  sortBy: SortOption,
  userLocation?: { lat: number; lng: number }
): UseRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  // Build the SQL query based on filters
  const buildQuery = useCallback(() => {
    let query = supabase
      .from('restaurants')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Location filter
    if (filters.location) {
      query = query.eq('location_city', filters.location)
    }

    // Meal type filters
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
            // For late night, we could filter by current hours or just dinner
            return 'serves_dinner.eq.true'
          default:
            return null
        }
      }).filter(Boolean)

      if (mealConditions.length > 0) {
        // Use OR logic for meal types
        query = query.or(mealConditions.join(','))
      }
    }

    // Service style filters
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

    // Budget filters
    if (filters.budget && filters.budget.length === 2) {
      const [minPrice, maxPrice] = filters.budget
      query = query.gte('price_level', minPrice).lte('price_level', maxPrice)
    }

    // Dietary filters
    if (filters.dietary && filters.dietary.length > 0 && !filters.dietary.includes('none')) {
      filters.dietary.forEach(diet => {
        switch (diet) {
          case 'vegetarian':
            query = query.eq('serves_vegetarian_food', true)
            break
          case 'vegan':
            // For vegan, we might need additional logic
            query = query.eq('serves_vegetarian_food', true)
            break
          case 'gluten_free':
            // This would require additional data in the restaurant table
            break
        }
      })
    }

    // Feature filters
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
          case 'parking_available':
            // This would need to be checked in parking_options JSON
            break
          case 'wheelchair_accessible':
            // This would need to be checked in accessibility_options JSON
            break
          case 'wifi_available':
            // This would require additional data
            break
        }
      })
    }

    // Timing filters
    if (filters.timing === 'now') {
      // Filter for currently open restaurants
      // This would require complex current hours logic
      // For now, we'll skip this filter and handle it client-side
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'price':
        query = query.order('price_level', { ascending: true })
        break
      case 'distance':
        // For distance sorting, we'd need PostGIS functions
        // For now, fall back to name sorting
        query = query.order('name', { ascending: true })
        break
      case 'openNow':
        // This would require current hours calculation
        query = query.order('rating', { ascending: false })
        break
      default:
        query = query.order('rating', { ascending: false })
    }

    return query
  }, [filters, sortBy])

  // Load restaurants with pagination
  const loadRestaurants = useCallback(async (page: number = 0, append: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      const query = buildQuery()
      const startIndex = page * RESTAURANTS_PER_PAGE
      const endIndex = startIndex + RESTAURANTS_PER_PAGE - 1

      const { data, error: queryError, count } = await query
        .range(startIndex, endIndex)

      if (queryError) throw queryError

      const newRestaurants = data || []
      
      if (append) {
        setRestaurants(prev => [...prev, ...newRestaurants])
      } else {
        setRestaurants(newRestaurants)
      }

      setTotalCount(count || 0)
      setHasMore(newRestaurants.length === RESTAURANTS_PER_PAGE)
      setCurrentPage(page)

    } catch (error) {
      console.error('Error loading restaurants:', error)
      setError('Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }, [buildQuery])

  // Load more restaurants (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await loadRestaurants(currentPage + 1, true)
  }, [hasMore, loading, currentPage, loadRestaurants])

  // Refresh restaurants (reload from beginning)
  const refresh = useCallback(async () => {
    setCurrentPage(0)
    await loadRestaurants(0, false)
  }, [loadRestaurants])

  // Reset results
  const resetResults = useCallback(() => {
    setRestaurants([])
    setCurrentPage(0)
    setHasMore(true)
    setTotalCount(0)
    setError(null)
  }, [])

  // Load restaurants when filters or sort change
  useEffect(() => {
    resetResults()
    loadRestaurants(0, false)
  }, [filters, sortBy, loadRestaurants])

  return {
    restaurants,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    resetResults,
  }
}

export type { Restaurant }