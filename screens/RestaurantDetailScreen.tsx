// screens/RestaurantDetailScreen.tsx
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
import { Image, Button, Header } from '@rneui/themed'
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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
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

  const renderPhotos = () => {
    if (!restaurant?.photos || restaurant.photos.length === 0) {
      return (
        <View style={[styles.heroImage, { backgroundColor: '#FFD700' }]}>
          <Text style={styles.noPhotoText}>No Photo Available</Text>
        </View>
      )
    }

    return (
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth)
          setCurrentPhotoIndex(index)
        }}
      >
        {restaurant.photos.map((photo: string, index: number) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={styles.heroImage}
            resizeMode="cover"
            PlaceholderContent={<LoadingSpinner />}
          />
        ))}
      </ScrollView>
    )
  }

  const renderPhotoIndicators = () => {
    if (!restaurant?.photos || restaurant.photos.length <= 1) return null

    return (
      <View style={styles.photoIndicators}>
        {restaurant.photos.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: 
                  index === currentPhotoIndex 
                    ? theme.colors.textOnPrimary 
                    : 'rgba(255, 255, 255, 0.5)'
              }
            ]}
          />
        ))}
      </View>
    )
  }

  const renderFeatures = () => {
    const features = []
    
    if (restaurant?.serves_breakfast) features.push('Breakfast')
    if (restaurant?.serves_lunch) features.push('Lunch')
    if (restaurant?.serves_dinner) features.push('Dinner')
    if (restaurant?.serves_beer) features.push('Beer')
    if (restaurant?.serves_wine) features.push('Wine')
    if (restaurant?.serves_cocktails) features.push('Cocktails')
    if (restaurant?.serves_vegetarian_food) features.push('Vegetarian')
    if (restaurant?.dine_in) features.push('Dine In')
    if (restaurant?.takeout) features.push('Takeout')
    if (restaurant?.delivery) features.push('Delivery')
    if (restaurant?.outdoor_seating) features.push('Outdoor Seating')
    if (restaurant?.good_for_children) features.push('Kid Friendly')
    if (restaurant?.good_for_groups) features.push('Groups')
    if (restaurant?.allows_dogs) features.push('Dog Friendly')
    if (restaurant?.live_music) features.push('Live Music')
    if (restaurant?.good_for_watching_sports) features.push('Sports')

    if (features.length === 0) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresContainer}>
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
    if (!restaurant?.regular_opening_hours?.weekday_descriptions) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hours</Text>
        {restaurant.regular_opening_hours.weekday_descriptions.map((day: string, index: number) => (
          <Text key={index} style={styles.hoursText}>{day}</Text>
        ))}
      </View>
    )
  }

  const renderDescription = () => {
    const description = restaurant?.editorial_summary || restaurant?.generative_summary
    if (!description) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroContainer: {
      position: 'relative',
    },
    heroImage: {
      width: screenWidth,
      height: HERO_HEIGHT,
      backgroundColor: '#FFD700',
      justifyContent: 'center',
      alignItems: 'center',
    },
    noPhotoText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    photoIndicators: {
      position: 'absolute',
      bottom: theme.spacing.md,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
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
    },
    content: {
      flex: 1,
    },
    headerSection: {
      padding: theme.spacing.screenPadding,
      backgroundColor: theme.colors.surface,
    },
    restaurantName: {
      fontSize: theme.typography.fontSize.h1,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    cuisineType: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    ratingRow: {
      marginBottom: theme.spacing.sm,
    },
    statusRow: {
      marginBottom: theme.spacing.md,
    },
    address: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    section: {
      padding: theme.spacing.screenPadding,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    descriptionText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    featuresContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
    },
    featureChip: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    featureText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    hoursText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    actionsSection: {
      padding: theme.spacing.screenPadding,
      backgroundColor: theme.colors.surface,
    },
    actionButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.lg,
    },
    mainActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    callButton: {
      flex: 1,
      marginRight: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
    },
    directionsButton: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
    },
    directionsButtonTitle: {
      color: theme.colors.primary,
    },
  })

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    )
  }

  if (!restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Restaurant not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header
        leftComponent={{
          icon: 'arrow-back',
          type: 'material',
          color: theme.colors.textOnPrimary,
          onPress: () => navigation.goBack(),
        }}
        rightComponent={{
          icon: 'share',
          type: 'material',
          color: theme.colors.textOnPrimary,
          onPress: handleShare,
        }}
        backgroundColor={theme.colors.primary}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {renderPhotos()}
          {renderPhotoIndicators()}
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Text style={{ fontSize: 20 }}>
              {isFavorite(restaurant.id) ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerSection}>
          <Text style={styles.restaurantName}>{restaurant.display_name}</Text>
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

export default RestaurantDetailScreen