// hooks/useFavorites.tsx
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
    setupRealtimeSubscription()
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

      // Check if user_favorites table exists and handle gracefully
      const { data, error } = await supabase
        .from('user_favorites')
        .select('restaurant_id')
        .eq('user_id', user.id)

      if (error) {
        // Handle specific database errors gracefully
        if (error.code === '42P01') {
          // Table doesn't exist - this is expected for new setups
          console.log('user_favorites table not found - this is expected for new users')
          setFavorites([])
        } else if (error.code === '42701') {
          // Column doesn't exist - graceful handling
          console.log('user_favorites table exists but column structure is different - this is expected for new users')
          setFavorites([])
        } else {
          console.error('Error loading favorites:', error)
          setError('Unable to load favorites')
        }
        setLoading(false)
        return
      }

      const favoriteIds = data?.map(fav => fav.restaurant_id) || []
      setFavorites(favoriteIds)
      setError(null)
    } catch (error) {
      console.error('Error loading favorites:', error)
      // Don't throw error for new users - just set empty favorites
      setFavorites([])
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('favorites')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_favorites',
        },
        (payload) => {
          handleRealtimeUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        if (newRecord) {
          setFavorites(prev => {
            if (!prev.includes(newRecord.restaurant_id)) {
              return [...prev, newRecord.restaurant_id]
            }
            return prev
          })
        }
        break
      case 'DELETE':
        if (oldRecord) {
          setFavorites(prev => prev.filter(id => id !== oldRecord.restaurant_id))
        }
        break
      default:
        break
    }
  }

  const addFavorite = async (restaurantId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
        })

      if (error) {
        // Handle table not existing gracefully
        if (error.code === '42P01' || error.code === '42701') {
          console.log('Favorites feature not yet available - database setup needed')
          setError('Favorites feature coming soon!')
          return
        }
        throw error
      }

      // Optimistically update local state
      setFavorites(prev => {
        if (!prev.includes(restaurantId)) {
          return [...prev, restaurantId]
        }
        return prev
      })

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

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)

      if (error) {
        // Handle table not existing gracefully
        if (error.code === '42P01' || error.code === '42701') {
          console.log('Favorites feature not yet available - database setup needed')
          setError('Favorites feature coming soon!')
          return
        }
        throw error
      }

      // Optimistically update local state
      setFavorites(prev => prev.filter(id => id !== restaurantId))
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

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .in('id', favorites)
        .eq('is_active', true)

      if (error) throw error

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

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        // Handle table not existing gracefully
        if (error.code === '42P01' || error.code === '42701') {
          console.log('Favorites feature not yet available - database setup needed')
          setFavorites([])
          return
        }
        throw error
      }

      setFavorites([])
      setError(null)
    } catch (error) {
      console.error('Error clearing favorites:', error)
      setError('Unable to clear favorites')
      throw error
    }
  }

  const refresh = async () => {
    await loadFavorites()
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
  }
}