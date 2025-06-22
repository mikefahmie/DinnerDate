// hooks/useFavorites.tsx - SIMPLIFIED VERSION WITHOUT REAL-TIME
// Since restaurant data is mostly static, we don't need real-time subscriptions
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface UserFavorite {
  id: string
  user_id: string
  restaurant_id: string
  created_at: string
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user's favorites on mount
  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setFavorites([])
        setLoading(false)
        return
      }

      console.log('Loading favorites for user:', user.id)

      const { data, error } = await supabase
        .from('user_favorites')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading favorites:', error)
        setError('Unable to load favorites')
        setLoading(false)
        return
      }

      const favoriteIds = data?.map(fav => fav.restaurant_id) || []
      console.log('Loaded favorites:', favoriteIds)
      setFavorites(favoriteIds)
      setError(null)
    } catch (error) {
      console.error('Error loading favorites:', error)
      setError('Unable to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const addFavorite = async (restaurantId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('Adding favorite:', restaurantId)

      // Check if already favorited to avoid duplicate errors
      if (favorites.includes(restaurantId)) {
        console.log('Restaurant already in favorites')
        return
      }

      // Optimistically update UI first for better UX
      setFavorites(prev => [...prev, restaurantId])

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
        })

      if (error) {
        // Revert optimistic update on error
        setFavorites(prev => prev.filter(id => id !== restaurantId))
        console.error('Error adding favorite:', error)
        throw error
      }

      console.log('Successfully added favorite')
      setError(null)
    } catch (error) {
      console.error('Error adding favorite:', error)
      setError('Unable to add favorite')
      throw error
    }
  }

  const removeFavorite = async (restaurantId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('Removing favorite:', restaurantId)

      // Optimistically update UI first for better UX
      setFavorites(prev => prev.filter(id => id !== restaurantId))

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)

      if (error) {
        // Revert optimistic update on error
        setFavorites(prev => {
          if (!prev.includes(restaurantId)) {
            return [...prev, restaurantId]
          }
          return prev
        })
        console.error('Error removing favorite:', error)
        throw error
      }

      console.log('Successfully removed favorite')
      setError(null)
    } catch (error) {
      console.error('Error removing favorite:', error)
      setError('Unable to remove favorite')
      throw error
    }
  }

  const toggleFavorite = async (restaurantId: string) => {
    if (isFavorite(restaurantId)) {
      await removeFavorite(restaurantId)
    } else {
      await addFavorite(restaurantId)
    }
  }

  const isFavorite = (restaurantId: string): boolean => {
    return favorites.includes(restaurantId)
  }

  const getFavoriteRestaurants = async () => {
    try {
      if (favorites.length === 0) return []

      console.log('Fetching favorite restaurant details for:', favorites)

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .in('id', favorites)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching favorite restaurants:', error)
        throw error
      }

      console.log('Fetched favorite restaurants:', data?.length)
      return data || []
    } catch (error) {
      console.error('Error fetching favorite restaurants:', error)
      return []
    }
  }

  const clearAllFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('Clearing all favorites for user:', user.id)

      // Optimistically update UI
      const previousFavorites = [...favorites]
      setFavorites([])

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        // Revert on error
        setFavorites(previousFavorites)
        console.error('Error clearing favorites:', error)
        throw error
      }

      console.log('Successfully cleared all favorites')
      setError(null)
    } catch (error) {
      console.error('Error clearing favorites:', error)
      setError('Unable to clear favorites')
      throw error
    }
  }

  const refresh = async () => {
    console.log('Refreshing favorites...')
    await loadFavorites()
  }

  const getFavoriteCount = (): number => {
    return favorites.length
  }

  return {
    favorites,
    loading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getFavoriteRestaurants,
    clearAllFavorites,
    refresh,
    getFavoriteCount,
  }
}

export default useFavorites