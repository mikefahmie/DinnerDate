// Updated RestaurantCard component with photo support
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

  // Format operating hours for display
  const formatOperatingHours = () => {
    if (!restaurant.current_opening_hours?.periods?.[0]) return null;
    
    const todayPeriod = restaurant.current_opening_hours.periods[0];
    if (todayPeriod.open && todayPeriod.close) {
      return `${todayPeriod.open.time} - ${todayPeriod.close.time}`;
    }
    return null;
  };

  // Determine if restaurant is currently open
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

        {/* Operating Hours */}
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
              ? `${Math.round(restaurant.distance)}m away`
              : `${(restaurant.distance / 1000).toFixed(1)}km away`
            }
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    width: CARD_WIDTH,
  },
  shadowCard: {
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
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
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  overlayBadges: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  openBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)', // green with opacity
  },
  closedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // red with opacity
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  openText: {
    color: 'white',
  },
  closedText: {
    color: 'white',
  },
  priceBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  priceText: {
    color: 'white',
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
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  cuisine: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  address: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  hours: {
    fontSize: 14,
    color: '#6b7280',
  },
  distance: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
  },
});