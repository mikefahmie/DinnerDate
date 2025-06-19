// supabase/functions/populate-restaurants/index.ts
// Updated to correctly map reviewSummary field and include it in fieldMask

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GooglePlacesResponse {
  places?: GooglePlace[]
  nextPageToken?: string
  contextualContents?: any[]
  searchUri?: string
}

interface GooglePlace {
  id: string
  types: string[]
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  formattedAddress: string
  location: {
    latitude: number
    longitude: number
  }
  rating?: number
  googleMapsUri?: string
  websiteUri?: string
  regularOpeningHours?: any
  currentOpeningHours?: any
  businessStatus?: string
  userRatingCount?: number
  displayName?: {
    text: string
    languageCode: string
  }
  primaryTypeDisplayName?: {
    text: string
    languageCode: string
  }
  takeout?: boolean
  delivery?: boolean
  dineIn?: boolean
  curbsidePickup?: boolean
  reservable?: boolean
  servesBeer?: boolean
  servesWine?: boolean
  servesCocktails?: boolean
  servesCoffee?: boolean
  servesDessert?: boolean
  servesBreakfast?: boolean
  servesBrunch?: boolean
  servesLunch?: boolean
  servesDinner?: boolean
  servesVegetarianFood?: boolean
  outdoorSeating?: boolean
  liveMusic?: boolean
  menuForChildren?: boolean
  goodForChildren?: boolean
  goodForGroups?: boolean
  goodForWatchingSports?: boolean
  allowsDogs?: boolean
  restroom?: boolean
  accessibilityOptions?: any
  parkingOptions?: any
  paymentOptions?: any
  photos?: Array<{
    name: string
    widthPx: number
    heightPx: number
  }>
  priceLevel?: string
  priceRange?: any
  primaryType?: string
  shortFormattedAddress?: string
  plusCode?: {
    globalCode?: string
    compoundCode?: string
  }
  addressComponents?: Array<{
    longText: string
    shortText: string
    types: string[]
    languageCode: string
  }>
  editorialSummary?: {
    text: string
    languageCode: string
  }
  generativeSummary?: {
    overview?: {
      text: string
      languageCode: string
    }
  }
  // Fixed: Add reviewSummary interface
  reviewSummary?: {
    text: {
      text: string
      languageCode: string
    }
  }
}

interface SearchTypeResult {
  searchType: string
  query: string
  pagesFetched: number
  totalFound: number
  afterFiltering: number
  inserted: number
  updated: number
  errors: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Google Places API key from environment
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!googleApiKey) {
      throw new Error('Google Places API key not configured')
    }

    // Parse request body for custom parameters
    const { skipUpdates = false, customSearchTypes } = await req.json().catch(() => ({}))

    // Define all search types with consistent "X restaurants in Ypsilanti, MI" format
    const defaultSearchTypes = [
      { type: 'fine_dining', query: 'Fine dining restaurants in Ypsilanti, MI' },
      { type: 'casual_dining', query: 'Casual dining restaurants in Ypsilanti, MI' },
      { type: 'fast_casual', query: 'Fast casual restaurants in Ypsilanti, MI' },
      { type: 'fast_food', query: 'Fast food restaurants in Ypsilanti, MI' },
      { type: 'coffee_shops', query: 'Coffee shop restaurants in Ypsilanti, MI' },
      { type: 'bars_pubs', query: 'Bar and pub restaurants in Ypsilanti, MI' },
      { type: 'diners', query: 'Diner restaurants in Ypsilanti, MI' },
      { type: 'bistros', query: 'Bistro restaurants in Ypsilanti, MI' },
      { type: 'bakeries', query: 'Bakery restaurants in Ypsilanti, MI' },
      { type: 'buffet', query: 'Buffet restaurants in Ypsilanti, MI' },
      { type: 'food_trucks', query: 'Food truck restaurants in Ypsilanti, MI' },
      { type: 'pizza', query: 'Pizza restaurants in Ypsilanti, MI' },
      { type: 'sushi', query: 'Sushi restaurants in Ypsilanti, MI' },
      { type: 'steakhouses', query: 'Steakhouse restaurants in Ypsilanti, MI' },
      { type: 'breakfast_brunch', query: 'Breakfast and brunch restaurants in Ypsilanti, MI' },
      { type: 'vegan_vegetarian', query: 'Vegan and vegetarian restaurants in Ypsilanti, MI' },
      { type: 'indian', query: 'Indian restaurants in Ypsilanti, MI' },
      { type: 'middle_eastern', query: 'Middle Eastern restaurants in Ypsilanti, MI' },
      { type: 'korean', query: 'Korean restaurants in Ypsilanti, MI' },
      { type: 'ethiopian', query: 'Ethiopian restaurants in Ypsilanti, MI' },
      { type: 'ethnic_cuisine', query: 'Ethnic cuisine restaurants in Ypsilanti, MI' },
      { type: 'pop_ups', query: 'Pop-up restaurants in Ypsilanti, MI' },
      { type: 'ice_cream', query: 'Ice cream shops in Ypsilanti, MI' },
      { type: 'dessert_shops', query: 'Dessert shops in Ypsilanti, MI' },
      { type: 'candy_stores', query: 'Candy stores in Ypsilanti, MI' },
      { type: 'frozen_yogurt', query: 'Frozen yogurt shops in Ypsilanti, MI' }
    ]

    const searchTypes = customSearchTypes || defaultSearchTypes

    // Types to exclude from results
    const excludedTypes = [
      'gas_station',
      'bowling_alley', 
      'amusement_park',
      'casino',
      'internet_cafe',
      'movie_theater',
      'water_park',
      'zoo'
    ]

    console.log(`🚀 Starting comprehensive restaurant search with ${searchTypes.length} categories`)

    // Fields to request from Google Places API (Preferred Tier)
    // Fixed: Added places.reviewSummary to fieldMask
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.types',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.nationalPhoneNumber',
      'places.internationalPhoneNumber',
      'places.formattedAddress',
      'places.shortFormattedAddress',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.priceLevel',
      'places.priceRange',
      'places.googleMapsUri',
      'places.websiteUri',
      'places.regularOpeningHours',
      'places.currentOpeningHours',
      'places.businessStatus',
      'places.takeout',
      'places.delivery',
      'places.dineIn',
      'places.curbsidePickup',
      'places.reservable',
      'places.servesBeer',
      'places.servesWine',
      'places.servesCocktails',
      'places.servesCoffee',
      'places.servesDessert',
      'places.servesBreakfast',
      'places.servesBrunch',
      'places.servesLunch',
      'places.servesDinner',
      'places.servesVegetarianFood',
      'places.outdoorSeating',
      'places.liveMusic',
      'places.menuForChildren',
      'places.goodForChildren',
      'places.goodForGroups',
      'places.goodForWatchingSports',
      'places.allowsDogs',
      'places.restroom',
      'places.accessibilityOptions',
      'places.parkingOptions',
      'places.paymentOptions',
      'places.photos',
      'places.plusCode',
      'places.addressComponents',
      'places.editorialSummary',
      'places.generativeSummary',
      'places.reviewSummary', // Fixed: Added this field to the request
      'nextPageToken'
    ].join(',')

    // Track results across all search types
    const searchResults: SearchTypeResult[] = []
    let globalInsertedCount = 0
    let globalUpdatedCount = 0
    let globalErrorCount = 0

    // Loop through each search type
    for (let searchIndex = 0; searchIndex < searchTypes.length; searchIndex++) {
      const searchType = searchTypes[searchIndex]
      console.log(`\n🔍 ===== SEARCH ${searchIndex + 1}/${searchTypes.length}: ${searchType.type.toUpperCase()} =====`)
      console.log(`📝 Query: "${searchType.query}"`)

      const initialRequestParams = {
        textQuery: searchType.query,
        pageSize: 20
      }

      // Collect all places for this search type
      let allPlaces: GooglePlace[] = []
      let pageToken: string | undefined = undefined
      let pageCount = 0
      const maxPages = 3

      // Pagination loop for this search type
      do {
        pageCount++
        console.log(`📄 Fetching page ${pageCount} for ${searchType.type}...`)

        let requestBody: any = { ...initialRequestParams }
        if (pageToken) {
          requestBody.pageToken = pageToken
        }

        // Make request to Google Places API
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': fieldMask
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ API error for ${searchType.type}: ${response.status}`)
          console.error(`⚠️ Skipping ${searchType.type} and continuing with next search type`)
          break // Break out of pagination loop for this search type and continue with next
        }

        const placesData: GooglePlacesResponse = await response.json()
        
        if (placesData.places && placesData.places.length > 0) {
          allPlaces = allPlaces.concat(placesData.places)
          console.log(`✅ Page ${pageCount}: +${placesData.places.length} places (total: ${allPlaces.length})`)
        } else {
          console.log(`⚠️ Page ${pageCount}: No places returned`)
        }

        pageToken = placesData.nextPageToken

        // Add delay between pages
        if (pageToken && pageCount < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

      } while (pageToken && pageCount < maxPages)

      console.log(`📊 ${searchType.type}: ${allPlaces.length} places found across ${pageCount} pages`)

      // Filter out excluded place types
      const filteredPlaces = allPlaces.filter(place => {
        const hasExcludedType = place.types.some(type => excludedTypes.includes(type))
        return !hasExcludedType
      })

      console.log(`🔎 ${searchType.type}: ${filteredPlaces.length} places after filtering`)

      let searchInsertedCount = 0
      let searchUpdatedCount = 0
      let searchErrorCount = 0

      // Process each place for this search type
      for (const place of filteredPlaces) {
        try {
          // Check if restaurant already exists
          const { data: existingRestaurant, error: selectError } = await supabaseClient
            .from('restaurants')
            .select('id')
            .eq('google_place_id', place.id)
            .single()

          if (selectError && selectError.code !== 'PGRST116') {
            console.error(`❌ Error checking existing restaurant:`, selectError.message)
            searchErrorCount++
            continue
          }

          // Extract city from address components or formatted address
// Extract location information from address components
          let locationCity = null
          let state = null
          let county = null
          let sublocality = null
          let neighborhood = null

          if (place.addressComponents) {
            // Extract city (locality)
            const cityComponent = place.addressComponents.find(comp => 
              comp.types.includes('locality')
            )
            if (cityComponent) {
              locationCity = cityComponent.longText || cityComponent.shortText
            }

            // Extract state (administrative_area_level_1) for US locations
            const stateComponent = place.addressComponents.find(comp => 
              comp.types.includes('administrative_area_level_1')
            )
            if (stateComponent) {
              state = stateComponent.shortText || stateComponent.longText
            }

            // Extract county or parish (administrative_area_level_2)
            const countyComponent = place.addressComponents.find(comp => 
              comp.types.includes('administrative_area_level_2')
            )
            if (countyComponent) {
              county = countyComponent.longText || countyComponent.shortText
            }

            // Extract sublocality (e.g., NYC boroughs)
            const sublocalityComponent = place.addressComponents.find(comp => 
              comp.types.includes('sublocality_level_1') || comp.types.includes('sublocality')
            )
            if (sublocalityComponent) {
              sublocality = sublocalityComponent.longText || sublocalityComponent.shortText
            }

            // Extract neighborhood
            const neighborhoodComponent = place.addressComponents.find(comp => 
              comp.types.includes('neighborhood')
            )
            if (neighborhoodComponent) {
              neighborhood = neighborhoodComponent.longText || neighborhoodComponent.shortText
            }
          }

          // Fallback city extraction from formatted address if not found in components
          if (!locationCity && place.formattedAddress) {
            const addressParts = place.formattedAddress.split(',')
            if (addressParts.length >= 3) {
              locationCity = addressParts[addressParts.length - 3].trim()
            }
          }

          // Map price level from Google's string format to integer
          let priceLevel = null
          if (place.priceLevel) {
            switch (place.priceLevel) {
              case 'PRICE_LEVEL_FREE':
                priceLevel = 0
                break
              case 'PRICE_LEVEL_INEXPENSIVE':
                priceLevel = 1
                break
              case 'PRICE_LEVEL_MODERATE':
                priceLevel = 2
                break
              case 'PRICE_LEVEL_EXPENSIVE':
                priceLevel = 3
                break
              case 'PRICE_LEVEL_VERY_EXPENSIVE':
                priceLevel = 4
                break
              default:
                priceLevel = null
            }
          }

          // Map Google Places data to our database schema
          const restaurantData = {
            google_place_id: place.id,
            name: place.displayName?.text || 'Unknown Restaurant',
            display_name: place.displayName?.text || null,
            formatted_address: place.formattedAddress || null,
            short_formatted_address: place.shortFormattedAddress || null,
            location_lat: place.location?.latitude || null,
            location_lng: place.location?.longitude || null,
            location_city: locationCity,
            state: state || null,
            county: county || null,
            sublocality: sublocality || null,
            neighborhood: neighborhood || null,
            plus_code: place.plusCode?.compoundCode || place.plusCode?.globalCode || null,
            business_status: place.businessStatus || null,
            primary_type: place.primaryType || null,
            types: place.types || [],
            google_maps_uri: place.googleMapsUri || null,
            website_uri: place.websiteUri || null,
            phone_number: place.nationalPhoneNumber || null,
            international_phone_number: place.internationalPhoneNumber || null,
            rating: place.rating || null,
            user_rating_count: place.userRatingCount || 0,
            price_level: priceLevel,
            price_range: place.priceRange || null,
            regular_opening_hours: place.regularOpeningHours || null,
            current_opening_hours: place.currentOpeningHours || null,
            serves_breakfast: place.servesBreakfast || false,
            serves_brunch: place.servesBrunch || false,
            serves_lunch: place.servesLunch || false,
            serves_dinner: place.servesDinner || false,
            serves_beer: place.servesBeer || false,
            serves_wine: place.servesWine || false,
            serves_cocktails: place.servesCocktails || false,
            serves_coffee: place.servesCoffee || false,
            serves_dessert: place.servesDessert || false,
            serves_vegetarian_food: place.servesVegetarianFood || false,
            dine_in: place.dineIn || false,
            takeout: place.takeout || false,
            delivery: place.delivery || false,
            curbside_pickup: place.curbsidePickup || false,
            reservable: place.reservable || false,
            outdoor_seating: place.outdoorSeating || false,
            good_for_children: place.goodForChildren || false,
            good_for_groups: place.goodForGroups || false,
            good_for_watching_sports: place.goodForWatchingSports || false,
            live_music: place.liveMusic || false,
            allows_dogs: place.allowsDogs || false,
            restroom: place.restroom || false,
            menu_for_children: place.menuForChildren || false,
            accessibility_options: place.accessibilityOptions || null,
            parking_options: place.parkingOptions || null,
            payment_options: place.paymentOptions || null,
            photos: place.photos?.map(photo => photo.name) || [],
            editorial_summary: place.editorialSummary?.text || null,
            reviews_summary: place.reviewSummary?.text?.text || null, // Fixed: Correct path to review summary
            generative_summary: place.generativeSummary?.overview?.text || null,
            last_synced: new Date().toISOString(),
            sync_version: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          if (existingRestaurant) {
            if (skipUpdates) {
              continue
            }
            
            const { error: updateError } = await supabaseClient
              .from('restaurants')
              .update({
                ...restaurantData,
                sync_version: restaurantData.sync_version + 1,
                updated_at: new Date().toISOString()
              })
              .eq('google_place_id', place.id)

            if (updateError) {
              console.error(`❌ Update error for ${place.displayName?.text}:`, updateError.message)
              searchErrorCount++
            } else {
              searchUpdatedCount++
            }
          } else {
            const { error: insertError } = await supabaseClient
              .from('restaurants')
              .insert([restaurantData])

            if (insertError) {
              console.error(`❌ Insert error for ${place.displayName?.text}:`, insertError.message)
              searchErrorCount++
            } else {
              searchInsertedCount++
              console.log(`✅ Inserted: ${place.displayName?.text} (Review summary: ${place.reviewSummary?.text?.text ? 'YES' : 'NO'})`)
            }
          }
        } catch (placeError) {
          console.error(`❌ Place processing error:`, placeError)
          searchErrorCount++
        }
      }

      // Store results for this search type
      const searchResult: SearchTypeResult = {
        searchType: searchType.type,
        query: searchType.query,
        pagesFetched: pageCount,
        totalFound: allPlaces.length,
        afterFiltering: filteredPlaces.length,
        inserted: searchInsertedCount,
        updated: searchUpdatedCount,
        errors: searchErrorCount
      }
      searchResults.push(searchResult)

      // Update global counters
      globalInsertedCount += searchInsertedCount
      globalUpdatedCount += searchUpdatedCount
      globalErrorCount += searchErrorCount

      console.log(`✅ ${searchType.type} complete: ${searchInsertedCount} inserted, ${searchUpdatedCount} updated, ${searchErrorCount} errors`)

      // Add delay between search types (except for the last one)
      if (searchIndex < searchTypes.length - 1) {
        console.log(`⏳ Waiting 3 seconds before next search type...`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    console.log(`\n🎉 ===== ALL SEARCHES COMPLETE =====`)
    console.log(`📊 Global totals: ${globalInsertedCount} inserted, ${globalUpdatedCount} updated, ${globalErrorCount} errors`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${searchTypes.length} search categories`,
        global_totals: {
          inserted: globalInsertedCount,
          updated: globalUpdatedCount,
          errors: globalErrorCount
        },
        search_results: searchResults,
        debug: {
          total_searches: searchTypes.length,
          skip_updates: skipUpdates
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})