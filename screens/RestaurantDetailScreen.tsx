// Updated RestaurantDetailScreen.tsx with single photo support
// File: screens/RestaurantDetailScreen.tsx

import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  Linking, 
  Alert,
  TouchableOpacity,
  Share
} from 'react-native'
import { Image, Button, Header, Icon } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useFavorites } from '../hooks/useFavorites'
import { restaurantService } from '../services/restaurantService'
import RatingDisplay from '../components/restaurant/RatingDisplay'
import HoursStatus from '../components/restaurant/HoursStatus'
import ActionIcons from '../components/restaurant/ActionIcons'
import LoadingSpinner from '../components/ui/LoadingSpinner'

type RouteParams = {
  RestaurantDetail: {
    restaurantId: string
  }
}

type RestaurantDetailRouteProp = RouteProp<RouteParams, 'RestaurantDetail'>

const { width: screenWidth } = Dimensions.get('window')
const HERO_HEIGHT = 250

const RestaurantDetailScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<RestaurantDetailRouteProp>()
  const { restaurantId } = route.params
  
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  
  const { isFavorite, toggleFavorite } = useFavorites()

  useEffect(() => {
    loadRestaurantDetails()
  }, [restaurantId])

  const loadRestaurantDetails = async () => {
    try {
      setLoading(true)
      const details = await restaurantService.getRestaurantById(restaurantId)
      setRestaurant(details)
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurant details')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!restaurant) return
    
    try {
      await Share.share({
        message: `Check out ${restaurant.display_name} - ${restaurant.formatted_address}`,
        title: restaurant.display_name,
      })
    } catch (error) {
      // Share was cancelled or failed
    }
  }

  const handleCall = () => {
    if (restaurant?.phone_number) {
      Linking.openURL(`tel:${restaurant.phone_number}`)
    }
  }

  const handleWebsite = () => {
    if (restaurant?.website_uri) {
      Linking.openURL(restaurant.website_uri)
    }
  }

  const handleDirections = () => {
    if (restaurant?.location_lat && restaurant?.location_lng) {
      const url = `maps:0,0?q=${restaurant.location_lat},${restaurant.location_lng}`
      Linking.openURL(url)
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

  // Updated renderPhotos function for single photo
  const renderPhotos = () => {
    // Check if we have a primary photo URL
    if (!restaurant?.primary_photo_url || imageError) {
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

    // Single photo display (no gallery)
    return (
      <View style={styles.photoContainer}>
        {imageLoading && (
          <View style={[styles.heroImage, styles.loadingContainer]}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Loading photo...</Text>
          </View>
        )}
        
        <Image
          source={{ uri: restaurant.primary_photo_url }}
          style={[styles.heroImage, imageLoading && { position: 'absolute' }]}
          resizeMode="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </View>
    )
  }

  const renderDescription = () => {
    if (!restaurant?.editorial_summary && !restaurant?.generative_summary) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {restaurant.editorial_summary || restaurant.generative_summary}
        </Text>
      </View>
    )
  }

  const renderFeatures = () => {
    const features = []
    
    // Service offerings
    if (restaurant?.serves_breakfast) features.push('Breakfast')
    if (restaurant?.serves_brunch) features.push('Brunch')  
    if (restaurant?.serves_lunch) features.push('Lunch')
    if (restaurant?.serves_dinner) features.push('Dinner')
    if (restaurant?.serves_coffee) features.push('Coffee')
    if (restaurant?.serves_beer) features.push('Beer')
    if (restaurant?.serves_wine) features.push('Wine')
    if (restaurant?.serves_cocktails) features.push('Cocktails')
    
    // Service types
    if (restaurant?.dine_in) features.push('Dine-in')
    if (restaurant?.takeout) features.push('Takeout')
    if (restaurant?.delivery) features.push('Delivery')
    if (restaurant?.curbside_pickup) features.push('Curbside Pickup')
    
    // Amenities
    if (restaurant?.reservable) features.push('Reservations')
    if (restaurant?.outdoor_seating) features.push('Outdoor Seating')
    if (restaurant?.good_for_children) features.push('Kid-Friendly')
    if (restaurant?.good_for_groups) features.push('Good for Groups')
    if (restaurant?.allows_dogs) features.push('Dog-Friendly')
    if (restaurant?.live_music) features.push('Live Music')

    if (features.length === 0) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features & Services</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureChip}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  const renderFullHours = () => {
    if (!restaurant?.regular_opening_hours?.periods) return null

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hours</Text>
        {restaurant.regular_opening_hours.periods.map((period: any, index: number) => (
          <View key={index} style={styles.hoursRow}>
            <Text style={styles.dayName}>{dayNames[period.open?.day || 0]}</Text>
            <Text style={styles.hours}>
              {period.open && period.close 
                ? `${period.open.time} - ${period.close.time}`
                : 'Closed'
              }
            </Text>
          </View>
        ))}
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <LoadingSpinner />
      </View>
    )
  }

  if (!restaurant) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorText}>Restaurant not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ 
          text: restaurant.display_name || restaurant.name, 
          style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
        }}
        leftComponent={{ 
          icon: 'arrow-back', 
          color: '#fff', 
          onPress: () => navigation.goBack() 
        }}
        rightComponent={{ 
          icon: 'share', 
          color: '#fff', 
          onPress: handleShare 
        }}
        backgroundColor={theme.colors.primary}
      />

      <ScrollView style={styles.scrollView}>
        {renderPhotos()}
        
        {/* Favorite Button Overlay */}
        <View style={styles.favoriteButtonContainer}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite(restaurant.id) ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerSection}>
          <Text style={styles.restaurantName}>{restaurant.display_name || restaurant.name}</Text>
          <Text style={styles.cuisineType}>{restaurant.primary_type}</Text>
          
          <View style={styles.ratingRow}>
            <RatingDisplay 
              rating={restaurant.rating}
              reviewCount={restaurant.user_rating_count}
            />
          </View>
          
          <View style={styles.statusRow}>
            <HoursStatus restaurant={restaurant} />
          </View>
          
          <Text style={styles.address}>{restaurant.formatted_address}</Text>
        </View>

        {renderDescription()}
        {renderFeatures()}
        {renderFullHours()}

        <View style={styles.actionsSection}>
          <View style={styles.actionButtonsRow}>
            <ActionIcons 
              restaurant={restaurant}
              onWebsite={handleWebsite}
              onDirections={handleDirections}
              onPhone={handleCall}
            />
          </View>
          
          <View style={styles.mainActionsRow}>
            {restaurant.phone_number && (
              <Button
                title="Call Restaurant"
                onPress={handleCall}
                buttonStyle={styles.callButton}
                icon={{ name: 'phone', type: 'material', color: 'white' }}
              />
            )}
            
            <Button
              title="Get Directions"
              onPress={handleDirections}
              buttonStyle={styles.directionsButton}
              titleStyle={styles.directionsButtonTitle}
              icon={{ name: 'directions', type: 'material', color: theme.colors.primary }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    height: HERO_HEIGHT,
  },
  heroImage: {
    width: screenWidth,
    height: HERO_HEIGHT,
  },
  noPhotoContainer: {
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    fontSize: 16,
    color: '#B8860B',
    marginTop: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: HERO_HEIGHT - 30,
    right: 20,
    zIndex: 10,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cuisineType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  ratingRow: {
    marginBottom: 12,
  },
  statusRow: {
    marginBottom: 12,
  },
  address: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  hours: {
    fontSize: 16,
    color: '#666',
  },
  actionsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButtonsRow: {
    marginBottom: 20,
  },
  mainActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    flex: 1,
  },
  directionsButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 8,
    flex: 1,
  },
  directionsButtonTitle: {
    color: '#2196F3',
  },
})

export default RestaurantDetailScreen