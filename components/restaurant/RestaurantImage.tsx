// components/restaurant/RestaurantImage.tsx
// FIXED: Clean component without duplication and syntax errors

import React, { useState } from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Image, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { getOptimizedPhotoUrl, getPlaceholderPhotoUrl } from '../../utils/photoUtils'

interface RestaurantImageProps {
  restaurant: {
    id: string
    name: string
    photo_storage_path?: string | null
    primary_photo_url?: string | null
    photos?: string[] | null
  }
  style?: ViewStyle
  height?: number
  showPlaceholder?: boolean
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
  variant?: 'thumbnail' | 'card' | 'detail' | 'hero'
  showStorageBadge?: boolean // For debugging/migration tracking
}

const RestaurantImage: React.FC<RestaurantImageProps> = ({
  restaurant,
  style,
  height = 200,
  showPlaceholder = true,
  resizeMode = 'cover',
  variant = 'card',
  showStorageBadge = false,
}) => {
  const { theme } = useTheme()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Get optimized photo URL using new utility
  const photoUrl = getOptimizedPhotoUrl(restaurant, variant)
  const hasValidPhoto = photoUrl && !imageError

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const renderPlaceholder = () => (
    <View style={[styles.placeholderContainer, { height }]}>
      <Icon
        name="utensils"
        type="font-awesome-5"
        size={variant === 'thumbnail' ? 20 : 40}
        color={theme.colors.textMuted}
      />
      {showPlaceholder && (
        <Text style={styles.placeholderText}>
          No Photo Available
        </Text>
      )}
    </View>
  )

  const renderLoadingState = () => (
    <View style={[styles.loadingContainer, { height }]}>
      <Icon
        name="spinner"
        type="font-awesome"
        size={variant === 'thumbnail' ? 20 : 30}
        color={theme.colors.primary}
      />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  )

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#FFD700', // Golden background
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      position: 'relative',
      ...style,
    },
    image: {
      width: '100%',
      height: height,
    },
    placeholderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFD700',
      width: '100%',
    },
    placeholderText: {
      fontSize: variant === 'thumbnail' 
        ? theme.typography.fontSize.caption 
        : theme.typography.fontSize.secondary,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.sm,
      fontWeight: '500',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceElevated,
      width: '100%',
    },
    loadingText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.sm,
    },
    storageBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: restaurant.photo_storage_path 
        ? 'rgba(76, 175, 80, 0.9)' // Green for new storage
        : 'rgba(255, 152, 0, 0.9)', // Orange for legacy URLs
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    storageBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
      marginLeft: 2,
    },
    imageCounter: {
      position: 'absolute',
      bottom: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    counterText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.caption,
      fontWeight: '600',
    },
  })

  if (!hasValidPhoto) {
    return (
      <View style={[styles.container, { height }]}>
        {renderPlaceholder()}
        {showStorageBadge && (
          <View style={styles.storageBadge}>
            <Icon
              name="times-circle"
              type="font-awesome"
              size={10}
              color="#FFFFFF"
            />
            <Text style={styles.storageBadgeText}>No Photo</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.container, { height }]}>
      {imageLoading && renderLoadingState()}
      
      <Image
        source={{ 
          uri: photoUrl,
          // Add cache control for better performance
          headers: { 'Cache-Control': 'max-age=3600' }
        }}
        style={styles.image}
        resizeMode={resizeMode}
        onLoad={handleImageLoad}
        onError={handleImageError}
        defaultSource={{ uri: getPlaceholderPhotoUrl(restaurant.name, variant) }}
        PlaceholderContent={renderLoadingState()}
      />

      {/* Storage type badge for debugging/migration tracking */}
      {showStorageBadge && (
        <View style={styles.storageBadge}>
          <Icon
            name={restaurant.photo_storage_path ? "check-circle" : "exclamation-triangle"}
            type="font-awesome"
            size={10}
            color="#FFFFFF"
          />
          <Text style={styles.storageBadgeText}>
            {restaurant.photo_storage_path ? 'Storage' : 'Legacy'}
          </Text>
        </View>
      )}

      {/* Photo count indicator if multiple photos exist */}
      {restaurant.photos && restaurant.photos.length > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.counterText}>
            +{restaurant.photos.length - 1}
          </Text>
        </View>
      )}
    </View>
  )
}

export default RestaurantImage