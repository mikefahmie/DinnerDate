// hooks/useRestaurants.tsx - FIXED VERSION with sorting
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

  const buildQuery = useCallback(() => {
    console.log('🔍 Building query with filters:', filters)
    console.log('📊 Sorting by:', sortBy)
    
    let query = supabase
      .from('restaurants')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Market filter instead of location_city
    if (filters.location) {
      console.log('🏙️ Filtering for market:', filters.location)
      query = query.eq('market', filters.location)  // ✅ Use market field
    }

    // Meal type filters
    if (filters.mealTypes && filters.mealTypes.length > 0) {
      const mealConditions: string[] = []
      
      filters.mealTypes.forEach(meal => {
        switch (meal) {
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
        query = query.or(mealConditions.join(','))
      }
    }

    // Budget filter
    if (filters.budget && filters.budget.length > 0) {
      query = query.in('price_level', filters.budget)
    }

    // Cuisine filter
    if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
      const cuisineConditions = filters.cuisineTypes.map(cuisine => 
        `primary_type.eq.${cuisine}`
      )
      
      if (cuisineConditions.length > 0) {
        query = query.or(cuisineConditions.join(','))
      }
    }

    // Dietary restrictions
    if (filters.dietary && filters.dietary.length > 0) {
      filters.dietary.forEach(diet => {
        switch (diet) {
          case 'vegetarian':
            query = query.eq('serves_vegetarian_food', true)
            break
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
        }
      })
    }

    // 🚀 ADD SORTING LOGIC HERE - This was missing!
    console.log('🔧 Applying sorting:', sortBy)
    switch (sortBy) {
      case 'rating':
        query = query.order('rating', { ascending: false }) // Highest rated first
        break
      case 'price':
        query = query.order('price_level', { ascending: true }) // Lowest price first
        break
      case 'distance':
        // For distance sorting, you'd need user location calculation
        // For now, fall back to rating
        console.log('📍 Distance sorting not yet implemented, falling back to rating')
        query = query.order('rating', { ascending: false })
        break
      case 'openNow':
        // Sort by open restaurants first, then by rating
        // You can implement this with a computed field or separate logic
        console.log('🕐 Open Now sorting - implementing basic logic')
        query = query.order('rating', { ascending: false }) // Fallback for now
        break
      default:
        // Default to rating
        query = query.order('rating', { ascending: false })
        break
    }
    
    // Secondary sort by name for consistency
    query = query.order('name', { ascending: true })

    return query
  }, [filters, sortBy, userLocation])

  // Load restaurants with pagination
  const loadRestaurants = useCallback(async (page: number = 0, append: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      const query = buildQuery()
      const startIndex = page * RESTAURANTS_PER_PAGE
      const endIndex = startIndex + RESTAURANTS_PER_PAGE - 1

      console.log(`📄 Loading page ${page}, range: ${startIndex}-${endIndex}`)

      const { data, error: queryError, count } = await query
        .range(startIndex, endIndex)

      if (queryError) throw queryError

      const newRestaurants = data || []
      console.log(`✅ Loaded ${newRestaurants.length} restaurants, total: ${count}`)
      
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