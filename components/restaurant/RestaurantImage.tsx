// components/restaurant/RestaurantImage.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Image, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'

interface RestaurantImageProps {
  photos: string[]
  restaurantName: string
  style?: ViewStyle
  height?: number
  showPlaceholder?: boolean
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
}

const RestaurantImage: React.FC<RestaurantImageProps> = ({
  photos,
  restaurantName,
  style,
  height = 200,
  showPlaceholder = true,
  resizeMode = 'cover',
}) => {
  const { theme } = useTheme()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const hasValidPhoto = photos && photos.length > 0 && !imageError
  const primaryPhoto = hasValidPhoto ? photos[0] : null

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
        name="cutlery"
        type="font-awesome"
        size={40}
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
        size={30}
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
      fontSize: theme.typography.fontSize.secondary,
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
    imageCounter: {
      position: 'absolute',
      bottom: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    counterText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.caption,
      fontWeight: '600',
    },
  })

  if (!hasValidPhoto) {
    return (
      <View style={[styles.container, { height }]}>
        {renderPlaceholder()}
      </View>
    )
  }

  return (
    <View style={[styles.container, { height }]}>
      {imageLoading && renderLoadingState()}
      
      <Image
        source={{ uri: primaryPhoto! }}
        style={styles.image}
        resizeMode={resizeMode}
        onLoad={handleImageLoad}
        onError={handleImageError}
        PlaceholderContent={renderLoadingState()}
      />

      {photos.length > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.counterText}>
            +{photos.length - 1}
          </Text>
        </View>
      )}
    </View>
  )
}

export default RestaurantImage