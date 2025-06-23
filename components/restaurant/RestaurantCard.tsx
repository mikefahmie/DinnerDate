// Updated RestaurantCard component with photo support and debugging
// File: components/restaurant/RestaurantCard.tsx

import React, { useState } from 'react';
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
  
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Debug logging
  const photoUrl = restaurant.primary_photo_url;
  
  console.log('🔍 RestaurantCard Debug for:', restaurant.name);
  console.log('📸 primary_photo_url:', photoUrl);
  console.log('📊 primary_photo_url type:', typeof photoUrl);
  console.log('📏 primary_photo_url length:', photoUrl?.length);
  console.log('✅ Has photo URL:', !!photoUrl);

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

  // Handle image loading
  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully for:', restaurant.name);
    setImageLoading(false);
  };

  const handleImageError = (error: any) => {
    console.log('❌ Image load error for:', restaurant.name);
    console.log('❌ Error details:', error.nativeEvent);
    setImageError(true);
    setImageLoading(false);
  };

  // Simple validation
  const shouldShowImage = photoUrl && photoUrl.trim().length > 0 && !imageError;

  return (
    <Pressable 
      style={[styles.container, styles.shadowCard]} 
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: '#f0f0f0' }}
    >
      {/* Photo Section */}
      <View style={styles.photoContainer}>
        {shouldShowImage ? (
          <>
            {imageLoading && (
              <View style={[styles.photo, styles.loadingPhoto]}>
                <Icon 
                  name="image" 
                  type="font-awesome" 
                  size={30} 
                  color="#999" 
                />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
            <Image 
              source={{ uri: photoUrl }}
              style={[styles.photo, imageLoading && { position: 'absolute' }]}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <View style={[styles.photo, styles.placeholderPhoto]}>
            <Icon 
              name="utensils" 
              type="font-awesome-5" 
              size={30} 
              color="#B8860B" 
            />
            <Text style={styles.placeholderText}>
              No Photo{'\n'}
              <Text style={styles.debugText}>
                URL: {photoUrl ? 'Present' : 'Missing'}
              </Text>
            </Text>
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
          
          {/* Favorite button */}
          {showFavoriteButton && (
            <Pressable style={styles.favoriteButton}>
              <Icon 
                name="heart" 
                type="font-awesome" 
                size={18} 
                color="#FF6B6B" 
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Restaurant Name */}
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.display_name || restaurant.name}
        </Text>
        
        {/* Rating and Price Row */}
        <View style={styles.ratingPriceRow}>
          {restaurant.rating && (
            <View style={styles.ratingContainer}>
              <Icon 
                name="star" 
                type="font-awesome" 
                size={14} 
                color="#FFD700" 
              />
              <Text style={styles.rating}>
                {restaurant.rating.toFixed(1)}
              </Text>
              {restaurant.user_rating_count && (
                <Text style={styles.reviewCount}>
                  ({restaurant.user_rating_count})
                </Text>
              )}
            </View>
          )}
          
          {restaurant.price_level && (
            <Text style={styles.priceLevel}>
              {renderPriceLevel(restaurant.price_level)}
            </Text>
          )}
        </View>
        
        {/* Cuisine Types */}
        {restaurant.types && restaurant.types.length > 0 && (
          <Text style={styles.cuisineTypes} numberOfLines={1}>
            {restaurant.types
              .filter(type => !['food', 'point_of_interest', 'establishment'].includes(type))
              .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
              .slice(0, 3)
              .join(' • ')}
          </Text>
        )}
        
        {/* Operating Hours */}
        {formatOperatingHours() && (
          <Text style={styles.hours}>
            {formatOperatingHours()}
          </Text>
        )}
        
        {/* Distance */}
        {showDistance && restaurant.distance && (
          <Text style={styles.distance}>
            {restaurant.distance < 1 
              ? `${(restaurant.distance * 1000).toFixed(0)}m away`
              : `${restaurant.distance.toFixed(1)}km away`
            }
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
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
    shadowRadius: 4,
    elevation: 3,
  },
  photoContainer: {
    position: 'relative',
    height: 200,
  },
  photo: {
    width: '100%',
    height: 200,
  },
  placeholderPhoto: {
    backgroundColor: '#FFD700', // Golden background
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPhoto: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#B8860B',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  openBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  closedBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  openText: {
    color: '#FFFFFF',
  },
  closedText: {
    color: '#FFFFFF',
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ratingPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  cuisineTypes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  hours: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
});