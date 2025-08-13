// components/restaurant/RestaurantCard.tsx
// UPDATED: Uses new photo utility functions for Supabase Storage

import React from 'react'
import { View, Text, Pressable, StyleSheet, Image } from 'react-native'
import { Icon } from '@rneui/themed'
import { useTheme } from '../../hooks/useTheme'
import { Restaurant } from '../../types/database'
import { getOptimizedPhotoUrl, getPlaceholderPhotoUrl } from '../../utils/photoUtils'

interface RestaurantCardProps {
  restaurant: Restaurant
  onPress: () => void
  onLongPress?: () => void
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  onLongPress,
}) => {
  const { theme } = useTheme()
  
  // Get today's hours - simplified version
  const getTodaysHours = () => {
    if (!restaurant.regular_opening_hours?.weekday_descriptions) {
      return null
    }
    
    const currentDay = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // Find today's description
    const todayDesc = restaurant.regular_opening_hours.weekday_descriptions.find((desc: string) => 
      desc.startsWith(dayNames[currentDay])
    )
    
    if (todayDesc) {
      // Extract just the time part (everything after the colon and space)
      const timePart = todayDesc.split(': ')[1]
      if (timePart && timePart !== 'Closed') {
        return timePart
      }
    }
    
    return null
  }

  // Determine if restaurant is currently open
  const isOpen = restaurant.current_opening_hours?.open_now ?? null

  // Get optimized photo URL using new utility
  const photoUrl = getOptimizedPhotoUrl(restaurant, 'card')

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    photoContainer: {
      position: 'relative',
      height: 160,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    placeholderPhoto: {
      backgroundColor: '#FFD700', // Golden background
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.fontSize.caption,
      fontWeight: '500',
      marginTop: theme.spacing.xs,
    },
    overlayBadges: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: theme.spacing.sm,
      right: theme.spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    openBadge: {
      backgroundColor: 'rgba(76, 175, 80, 0.9)',
    },
    closedBadge: {
      backgroundColor: 'rgba(244, 67, 54, 0.9)',
    },
    statusText: {
      fontSize: theme.typography.fontSize.caption,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
    openText: {
      color: '#FFFFFF',
    },
    closedText: {
      color: '#FFFFFF',
    },
    favoriteButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    infoContainer: {
      padding: theme.spacing.md,
    },
    restaurantName: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    ratingText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    hoursContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    hoursText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    varietyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    varietyText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    shadowCard: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
  })

  return (
    <Pressable 
      style={[styles.container, styles.shadowCard]} 
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: '#f0f0f0' }}
    >
      {/* Photo Section */}
      <View style={styles.photoContainer}>
        {photoUrl ? (
          <Image 
            source={{ uri: photoUrl }}
            style={styles.photo}
            resizeMode="cover"
            defaultSource={{ uri: getPlaceholderPhotoUrl(restaurant.name, 'card') }}
          />
        ) : (
          <View style={[styles.photo, styles.placeholderPhoto]}>
            <Icon
              name="utensils"
              type="font-awesome-5"
              size={40}
              color={theme.colors.textMuted}
            />
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
        
        {/* Overlay badges */}
        <View style={styles.overlayBadges}>
          {isOpen !== null && (
            <View style={[
              styles.statusBadge, 
              isOpen ? styles.openBadge : styles.closedBadge
            ]}>
              <Text style={[
                styles.statusText,
                isOpen ? styles.openText : styles.closedText
              ]}>
                {isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          )}
          
          {/* Favorite button placeholder - implement if needed */}
          {/* <Pressable style={styles.favoriteButton}>
            <Icon 
              name="heart" 
              type="font-awesome" 
              size={16} 
              color="#FFFFFF" 
            />
          </Pressable> */}
        </View>
      </View>

      {/* Restaurant Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {restaurant.display_name || restaurant.name}
        </Text>

        {/* Rating */}
        {restaurant.rating && (
          <View style={styles.ratingContainer}>
            <Icon 
              name="star" 
              type="font-awesome" 
              size={14} 
              color="#FFD700" 
            />
            <Text style={styles.ratingText}>
              {restaurant.rating} ({restaurant.user_rating_count || 0} reviews)
            </Text>
          </View>
        )}

        {/* Hours */}
        {getTodaysHours() && (
          <View style={styles.hoursContainer}>
            <Icon 
              name="clock" 
              type="font-awesome" 
              size={14} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.hoursText}>
              {getTodaysHours()}
            </Text>
          </View>
        )}

        {/* Variety/Cuisine Type */}
        {restaurant.primary_type && (
          <View style={styles.varietyContainer}>
            <Icon 
              name="tag" 
              type="font-awesome" 
              size={14} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.varietyText}>
              {restaurant.primary_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

export default RestaurantCard