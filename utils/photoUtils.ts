// utils/photoUtils.ts
// Utility functions for consistent photo URL generation

import { supabase } from '../lib/supabase'

export interface PhotoUrlOptions {
  width?: number
  height?: number
  quality?: number
}

/**
 * Get restaurant photo URL from Supabase Storage
 * Falls back to primary_photo_url for backward compatibility during migration
 */
export function getRestaurantPhotoUrl(
  restaurant: {
    id: string
    photo_storage_path?: string | null
    primary_photo_url?: string | null
  },
  options: PhotoUrlOptions = {}
): string | null {
  // Prefer storage path (new system)
  if (restaurant.photo_storage_path) {
    return getStoragePhotoUrl(restaurant.photo_storage_path, options)
  }
  
  // Fallback to old URL system during migration
  if (restaurant.primary_photo_url) {
    return restaurant.primary_photo_url
  }
  
  return null
}

/**
 * Generate Supabase Storage URL with optional transformations
 */
export function getStoragePhotoUrl(
  storagePath: string, 
  options: PhotoUrlOptions = {}
): string {
  const { data } = supabase.storage
    .from('restaurant-photos')
    .getPublicUrl(storagePath)
  
  let url = data.publicUrl
  
  // Add transformation parameters if supported by Supabase
  const params = new URLSearchParams()
  
  if (options.width) {
    params.append('width', options.width.toString())
  }
  
  if (options.height) {
    params.append('height', options.height.toString())
  }
  
  if (options.quality && options.quality >= 1 && options.quality <= 100) {
    params.append('quality', options.quality.toString())
  }
  
  // Append transform params if any exist
  if (params.toString()) {
    url += (url.includes('?') ? '&' : '?') + params.toString()
  }
  
  return url
}

/**
 * Check if a photo URL is from Supabase Storage (new system)
 */
export function isStoragePhotoUrl(url: string): boolean {
  return url.includes('supabase.co/storage/v1/object/public/restaurant-photos/')
}

/**
 * Check if a photo URL is from Google Places (old system)
 */
export function isGooglePhotoUrl(url: string): boolean {
  return url.includes('googleapis.com') || url.includes('ggpht.com') || url.includes('googleusercontent.com')
}

/**
 * Get optimized photo URL for different use cases
 */
export function getOptimizedPhotoUrl(
  restaurant: {
    id: string
    photo_storage_path?: string | null
    primary_photo_url?: string | null
  },
  variant: 'thumbnail' | 'card' | 'detail' | 'hero' = 'card'
): string | null {
  const baseUrl = getRestaurantPhotoUrl(restaurant)
  if (!baseUrl) return null
  
  // If it's already a storage URL, apply optimizations
  if (restaurant.photo_storage_path) {
    switch (variant) {
      case 'thumbnail':
        return getStoragePhotoUrl(restaurant.photo_storage_path, { width: 150, height: 150, quality: 80 })
      case 'card':
        return getStoragePhotoUrl(restaurant.photo_storage_path, { width: 400, height: 200, quality: 85 })
      case 'detail':
        return getStoragePhotoUrl(restaurant.photo_storage_path, { width: 600, height: 400, quality: 90 })
      case 'hero':
        return getStoragePhotoUrl(restaurant.photo_storage_path, { width: 800, height: 500, quality: 95 })
      default:
        return baseUrl
    }
  }
  
  // For old URLs, return as-is (no optimization available)
  return baseUrl
}

/**
 * Generate placeholder photo URL for restaurants without photos
 */
export function getPlaceholderPhotoUrl(
  restaurantName?: string,
  variant: 'thumbnail' | 'card' | 'detail' | 'hero' = 'card'
): string {
  // Use a placeholder service or return a local asset
  const dimensions = {
    thumbnail: '150x150',
    card: '400x200', 
    detail: '600x400',
    hero: '800x500'
  }
  
  const size = dimensions[variant]
  const text = encodeURIComponent(restaurantName || 'Restaurant')
  
  // Using a placeholder service (you can replace with your own)
  return `https://via.placeholder.com/${size}/FFD700/333333?text=${text}`
}

/**
 * Prefetch restaurant photo for better performance
 */
export function prefetchRestaurantPhoto(
  restaurant: {
    id: string
    photo_storage_path?: string | null
    primary_photo_url?: string | null
  },
  variant: 'thumbnail' | 'card' | 'detail' | 'hero' = 'card'
): void {
  const photoUrl = getOptimizedPhotoUrl(restaurant, variant)
  
  if (photoUrl && typeof Image !== 'undefined') {
    const img = new Image()
    img.src = photoUrl
  }
}

/**
 * Migration helper: Check if restaurant needs photo migration
 */
export function needsPhotoMigration(restaurant: {
  photo_storage_path?: string | null
  primary_photo_url?: string | null
  photos?: string[] | null
}): boolean {
  // Has photo references but no storage path
  return !!(
    restaurant.photos && 
    restaurant.photos.length > 0 && 
    !restaurant.photo_storage_path
  )
}

/**
 * Migration helper: Check if restaurant has broken photo URL
 */
export function hasBrokenPhotoUrl(restaurant: {
  primary_photo_url?: string | null
  photo_storage_path?: string | null
}): boolean {
  // Has old URL but no storage path, and URL might be from Google (likely broken)
  return !!(
    restaurant.primary_photo_url && 
    !restaurant.photo_storage_path &&
    isGooglePhotoUrl(restaurant.primary_photo_url)
  )
}