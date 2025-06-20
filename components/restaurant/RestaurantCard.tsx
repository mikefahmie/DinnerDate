// components/restaurant/RestaurantCard.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image, Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { useFavorites } from '../../hooks/useFavorites'
import RatingDisplay from './RatingDisplay'
import HoursStatus from './HoursStatus'
import ActionIcons from './ActionIcons'

interface RestaurantCardProps {
  restaurant: any // TODO: Add proper Restaurant type
  onPress: () => void
  onLongPress?: () => void
  showFavoriteButton?: boolean
  isSelected?: boolean
  selectionMode?: boolean
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  onLongPress,
  showFavoriteButton = true,
  isSelected = false,
  selectionMode = false,
}) => {
  const { theme } = useTheme()
  const { isFavorite, toggleFavorite } = useFavorites()

  const handleFavoriteToggle = (e: any) => {
    e.stopPropagation()
    toggleFavorite(restaurant.id)
  }

  const getDescriptionText = () => {
    return restaurant.editorial_summary || 
           restaurant.generative_summary || 
           'Restaurant description not available'
  }

  const hasPhoto = restaurant.photos && restaurant.photos.length > 0

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
      ...theme.shadows.medium,
      borderWidth: selectionMode && isSelected ? 2 : 0,
      borderColor: selectionMode && isSelected ? theme.colors.primary : 'transparent',
    },
    photoContainer: {
      position: 'relative',
      height: 200,
      backgroundColor: '#FFD700', // Golden background for missing photos
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    noPhotoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noPhotoText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    favoriteButton: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    selectionIndicator: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: theme.spacing.lg,
    },
    restaurantName: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    cuisineType: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'capitalize',
    },
    ratingRow: {
      marginBottom: theme.spacing.sm,
    },
    statusRow: {
      marginBottom: theme.spacing.md,
    },
    locationInfo: {
      marginBottom: theme.spacing.md,
    },
    neighborhood: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textPrimary,
      fontWeight: '500',
      marginBottom: theme.spacing.xs,
    },
    address: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    description: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
    },
    actionsRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      paddingTop: theme.spacing.md,
    },
  })

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.photoContainer}>
        {hasPhoto ? (
          <Image
            source={{ uri: restaurant.photos[0] }}
            style={styles.photo}
            resizeMode="cover"
            PlaceholderContent={
              <View style={styles.noPhotoContainer}>
                <Icon
                  name="image"
                  type="font-awesome"
                  size={40}
                  color={theme.colors.textMuted}
                />
              </View>
            }
          />
        ) : (
          <View style={styles.noPhotoContainer}>
            <Icon
              name="cutlery"
              type="font-awesome"
              size={40}
              color={theme.colors.textMuted}
            />
            <Text style={styles.noPhotoText}>No Photo Available</Text>
          </View>
        )}

        {selectionMode && (
          <View style={styles.selectionIndicator}>
            <Icon
              name="check"
              type="font-awesome"
              size={16}
              color={theme.colors.textOnPrimary}
            />
          </View>
        )}

        {showFavoriteButton && !selectionMode && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Icon
              name={isFavorite(restaurant.id) ? "heart" : "heart-o"}
              type="font-awesome"
              size={20}
              color={isFavorite(restaurant.id) ? theme.colors.error : theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.restaurantName} numberOfLines={2}>
          {restaurant.display_name || restaurant.name}
        </Text>

        <Text style={styles.cuisineType} numberOfLines={1}>
          {restaurant.primary_type?.replace(/_/g, ' ')}
        </Text>

        <View style={styles.ratingRow}>
          <RatingDisplay 
            rating={restaurant.rating}
            reviewCount={restaurant.user_rating_count}
          />
        </View>

        <View style={styles.statusRow}>
          <HoursStatus restaurant={restaurant} />
        </View>

        <View style={styles.locationInfo}>
          {restaurant.neighborhood && (
            <Text style={styles.neighborhood} numberOfLines={1}>
              {restaurant.neighborhood}
            </Text>
          )}
          <Text style={styles.address} numberOfLines={2}>
            {restaurant.formatted_address || restaurant.short_formatted_address}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {getDescriptionText()}
        </Text>

        <View style={styles.actionsRow}>
          <ActionIcons 
            restaurant={restaurant}
            showLabels={false}
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default RestaurantCard