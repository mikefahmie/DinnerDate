// screens/RestaurantDetailScreen.tsx
// CLEAN VERSION: Uses correct theme structure and no duplications

import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, Linking, Alert, Pressable } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { Restaurant } from '../types/database'
import { getOptimizedPhotoUrl, getPlaceholderPhotoUrl } from '../utils/photoUtils'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface RestaurantDetailScreenProps {
  restaurant: Restaurant
  toggleFavorite: (restaurantId: string) => void
}

const RestaurantDetailScreen: React.FC<RestaurantDetailScreenProps> = ({
  restaurant,
  toggleFavorite,
}) => {
  const { theme } = useTheme()
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const handleDirections = () => {
    if (restaurant.location_lat && restaurant.location_lng) {
      const lat = restaurant.location_lat
      const lng = restaurant.location_lng
      
      Alert.alert(
        'Open Directions',
        'Choose how to open directions:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Google Maps', 
            onPress: () => {
              const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
              Linking.openURL(webUrl).catch(() => {
                Alert.alert('Error', 'Unable to open maps application')
              })
            }
          }
        ]
      )
    } else if (restaurant.formatted_address) {
      const address = encodeURIComponent(restaurant.formatted_address)
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${address}`
      Linking.openURL(webUrl).catch(() => {
        Alert.alert('Error', 'Unable to open maps application')
      })
    } else {
      Alert.alert('Error', 'No address available for directions')
    }
  }

  const handleFavoriteToggle = () => {
    if (restaurant) {
      toggleFavorite(restaurant.id)
    }
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  // Get optimized photo URL using new utility
  const heroPhotoUrl = getOptimizedPhotoUrl(restaurant, 'hero')

  const renderPhotos = () => {
    if (!heroPhotoUrl || imageError) {
      return (
        <View style={[styles.heroImage, styles.noPhotoContainer]}>
          <Icon 
            name="utensils" 
            type="font-awesome-5" 
            size={40} 
            color="#B8860B" 
          />
          <Text style={styles.noPhotoText}>No Photo Available</Text>
        </View>
      )
    }

    return (
      <View style={styles.photoContainer}>
        {imageLoading && (
          <View style={[styles.heroImage, styles.loadingContainer]}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Loading photo...</Text>
          </View>
        )}
        
        <Image
          source={{ 
            uri: heroPhotoUrl,
            headers: { 'Cache-Control': 'max-age=3600' }
          }}
          style={[styles.heroImage, imageLoading && { position: 'absolute' }]}
          resizeMode="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          defaultSource={{ uri: getPlaceholderPhotoUrl(restaurant.name, 'hero') }}
        />

        {/* Storage indicator badge - helpful during migration */}
        {restaurant.photo_storage_path && (
          <View style={styles.storageBadge}>
            <Icon 
              name="check-circle" 
              type="font-awesome-5" 
              size={12} 
              color="#4CAF50" 
            />
            <Text style={styles.storageBadgeText}>Stored</Text>
          </View>
        )}
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    photoContainer: {
      position: 'relative',
    },
    heroImage: {
      width: '100%',
      height: 250,
      backgroundColor: '#FFD700', // Golden background
    },
    noPhotoContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFD700',
    },
    noPhotoText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.sm,
      fontWeight: '500',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceElevated,
    },
    loadingText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.sm,
    },
    storageBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(76, 175, 80, 0.9)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    storageBadgeText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.caption,
      fontWeight: '600',
      marginLeft: theme.spacing.sm,
    },
    contentContainer: {
      padding: theme.spacing.lg,
    },
    restaurantName: {
      fontSize: theme.typography.fontSize.h1,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    ratingText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    infoSection: {
      marginBottom: theme.spacing.lg,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    infoText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textPrimary,
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    infoTextSecondary: {
      color: theme.colors.textSecondary,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    actionButtonText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.primary,
      marginTop: theme.spacing.sm,
      fontWeight: '600',
    },
  })

  return (
    <View style={styles.container}>
      {/* Hero Photo */}
      {renderPhotos()}

      {/* Restaurant Details */}
      <View style={styles.contentContainer}>
        <Text style={styles.restaurantName}>
          {restaurant.display_name || restaurant.name}
        </Text>

        {/* Rating */}
        {restaurant.rating && (
          <View style={styles.ratingContainer}>
            <Icon 
              name="star" 
              type="font-awesome" 
              size={20} 
              color="#FFD700" 
            />
            <Text style={styles.ratingText}>
              {restaurant.rating} ({restaurant.user_rating_count || 0} reviews)
            </Text>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          {/* Address */}
          {restaurant.formatted_address && (
            <View style={styles.infoRow}>
              <Icon 
                name="map-marker" 
                type="font-awesome" 
                size={18} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.infoText, styles.infoTextSecondary]}>
                {restaurant.formatted_address}
              </Text>
            </View>
          )}

          {/* Phone */}
          {restaurant.phone_number && (
            <View style={styles.infoRow}>
              <Icon 
                name="phone" 
                type="font-awesome" 
                size={18} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.infoText, styles.infoTextSecondary]}>
                {restaurant.phone_number}
              </Text>
            </View>
          )}

          {/* Cuisine Type */}
          {restaurant.primary_type && (
            <View style={styles.infoRow}>
              <Icon 
                name="utensils" 
                type="font-awesome-5" 
                size={18} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.infoText, styles.infoTextSecondary]}>
                {restaurant.primary_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          )}

          {/* Price Level */}
          {restaurant.price_level && (
            <View style={styles.infoRow}>
              <Icon 
                name="dollar-sign" 
                type="font-awesome-5" 
                size={18} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.infoText, styles.infoTextSecondary]}>
                {'$'.repeat(restaurant.price_level)} • {getPriceLevelText(restaurant.price_level)}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={handleDirections}>
            <Icon 
              name="directions" 
              type="material" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionButtonText}>Directions</Text>
          </Pressable>

          {restaurant.phone_number && (
            <Pressable 
              style={styles.actionButton} 
              onPress={() => Linking.openURL(`tel:${restaurant.phone_number}`)}
            >
              <Icon 
                name="phone" 
                type="font-awesome" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.actionButtonText}>Call</Text>
            </Pressable>
          )}

          {restaurant.website_uri && (
            <Pressable 
              style={styles.actionButton} 
              onPress={() => Linking.openURL(restaurant.website_uri!)}
            >
              <Icon 
                name="globe" 
                type="font-awesome" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.actionButtonText}>Website</Text>
            </Pressable>
          )}

          <Pressable style={styles.actionButton} onPress={handleFavoriteToggle}>
            <Icon 
              name="heart" 
              type="font-awesome" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionButtonText}>Favorite</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

// Helper function for price level text
function getPriceLevelText(priceLevel: number): string {
  switch (priceLevel) {
    case 1: return 'Inexpensive'
    case 2: return 'Moderate'
    case 3: return 'Expensive'
    case 4: return 'Very Expensive'
    default: return 'Price varies'
  }
}

export default RestaurantDetailScreen