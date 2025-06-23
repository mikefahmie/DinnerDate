// Updated RestaurantCard component with fixed hours parsing
// File: components/restaurant/RestaurantCard.tsx

import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Icon } from '@rneui/themed';
import { Restaurant } from '../../types/database';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  onLongPress?: () => void;
  showFavoriteButton?: boolean;
  isSelected?: boolean;
  selectionMode?: boolean;
  showDistance?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // 16px margin on each side

export default function RestaurantCard({ 
  restaurant, 
  onPress,
  onLongPress,
  showFavoriteButton = true,
  isSelected = false,
  selectionMode = false,
  showDistance = false 
}: RestaurantCardProps) {
  
  // Render price level as dollar signs
  const renderPriceLevel = (level: number) => {
    return '$'.repeat(Math.max(1, Math.min(4, level)));
  };

  // Helper function to format time from hour and minute
  const formatTime = (hour: number, minute: number = 0): string => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: minute > 0 ? '2-digit' : undefined,
      hour12: true,
    });
  };

  // Format operating hours for display - Fixed to use proper data structure
  const formatOperatingHours = () => {
    // First try to get today's hours from regular_opening_hours
    if (restaurant.regular_opening_hours?.periods) {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Find today's periods
      const todaysPeriods = restaurant.regular_opening_hours.periods.filter(
        (period: any) => period.open?.day === currentDay
      );
      
      if (todaysPeriods.length > 0) {
        const firstPeriod = todaysPeriods[0];
        if (firstPeriod.open && firstPeriod.close) {
          const openTime = formatTime(firstPeriod.open.hour, firstPeriod.open.minute);
          const closeTime = formatTime(firstPeriod.close.hour, firstPeriod.close.minute);
          return `${openTime} - ${closeTime}`;
        }
      }
    }
    
    // Fallback: if no periods found for today, try to show first available hours
    if (restaurant.regular_opening_hours?.weekday_descriptions) {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Find today's description
      const todayDesc = restaurant.regular_opening_hours.weekday_descriptions.find((desc: string) => 
        desc.startsWith(dayNames[currentDay])
      );
      
      if (todayDesc) {
        // Extract just the time part (everything after the colon and space)
        const timePart = todayDesc.split(': ')[1];
        if (timePart && timePart !== 'Closed') {
          return timePart;
        }
      }
    }
    
    return null;
  };

  // Determine if restaurant is currently open - using the open_now from current_opening_hours
  const isOpen = restaurant.current_opening_hours?.open_now ?? null;

  return (
    <Pressable 
      style={[styles.container, styles.shadowCard]} 
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: '#f0f0f0' }}
    >
      {/* Photo Section */}
      <View style={styles.photoContainer}>
        {restaurant.primary_photo_url ? (
          <Image 
            source={{ uri: restaurant.primary_photo_url }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.photo, styles.placeholderPhoto]}>
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
          
          {restaurant.price_level && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>
                {renderPriceLevel(restaurant.price_level)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Restaurant Name */}
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>

        {/* Rating and Reviews */}
        {restaurant.rating && (
          <View style={styles.ratingContainer}>
            <Icon name="star" type="font-awesome" size={16} color="#FFD700" />
            <Text style={styles.rating}>{restaurant.rating}</Text>
            {restaurant.user_rating_count && (
              <Text style={styles.reviewCount}>
                ({restaurant.user_rating_count})
              </Text>
            )}
          </View>
        )}

        {/* Cuisine Types */}
        {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine_types.slice(0, 3).join(' • ')}
          </Text>
        )}

        {/* Address */}
        <View style={styles.addressContainer}>
          <Icon name="map-marker" type="font-awesome" size={14} color="#666" />
          <Text style={styles.address} numberOfLines={1}>
            {restaurant.formatted_address}
          </Text>
        </View>

        {/* Operating Hours - Fixed */}
        {formatOperatingHours() && (
          <View style={styles.hoursContainer}>
            <Icon name="clock-o" type="font-awesome" size={14} color="#666" />
            <Text style={styles.hours}>
              {formatOperatingHours()}
            </Text>
          </View>
        )}

        {/* Distance (if provided) */}
        {showDistance && restaurant.distance && (
          <Text style={styles.distance}>
            {restaurant.distance < 1000 
              ? `${Math.round(restaurant.distance)}m` 
              : `${(restaurant.distance / 1000).toFixed(1)}km`
            }
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
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
  photoContainer: {
    position: 'relative',
    height: 200,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderPhoto: {
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#8B7355',
    fontSize: 16,
    fontWeight: '500',
  },
  overlayBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  closedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  openText: {
    color: '#fff',
  },
  closedText: {
    color: '#fff',
  },
  priceBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  cuisine: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hours: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
});