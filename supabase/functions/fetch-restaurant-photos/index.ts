// Edge Function: fetch-restaurant-photos
// File: supabase/functions/fetch-restaurant-photos/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Restaurant {
  id: string
  name?: string
  photos: string[] | null
  primary_photo_url: string | null
  photo_processed_at: string | null
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

    // Get Google Places API key
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!googleApiKey) {
      throw new Error('Google Places API key not found')
    }

    // Parse request body
    const { restaurantIds, batchSize = 50, sourceUrl } = await req.json().catch(() => ({}))

    console.log(`Edge function called with:`, { 
      restaurantIds: restaurantIds?.length || 0, 
      batchSize, 
      hasSourceUrl: !!sourceUrl 
    })

    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    }

    // If specific restaurant IDs provided (from migration script), process them
    if (restaurantIds && Array.isArray(restaurantIds) && restaurantIds.length > 0) {
      console.log(`Processing specific restaurants: ${restaurantIds}`)
      
      // Get the specific restaurants
      const { data: restaurants, error: fetchError } = await supabaseClient
        .from('restaurants')
        .select('id, name, photos, primary_photo_url, photo_processed_at')
        .in('id', restaurantIds)

      if (fetchError) {
        throw new Error(`Failed to fetch restaurants: ${fetchError.message}`)
      }

      console.log(`Found ${restaurants?.length || 0} restaurants to process`)

      // Process each restaurant
      for (const restaurant of restaurants || []) {
        try {
          await processRestaurantPhoto(restaurant, googleApiKey, supabaseClient, results, sourceUrl)
        } catch (error) {
          console.error(`Failed to process restaurant ${restaurant.id}:`, error)
          results.failed++
          results.errors.push(`Restaurant ${restaurant.id}: ${error.message}`)
        }
      }
    } else {
      // Original logic for batch processing
      let query = supabaseClient
        .from('restaurants')
        .select('id, name, photos, primary_photo_url, photo_processed_at')
        .not('photos', 'is', null)
        .limit(batchSize)

      // Only process restaurants without Supabase Storage URLs
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      query = query.not('primary_photo_url', 'like', `%${supabaseUrl}%`)

      const { data: restaurants, error: fetchError } = await query

      if (fetchError) {
        throw new Error(`Failed to fetch restaurants: ${fetchError.message}`)
      }

      console.log(`Processing ${restaurants?.length || 0} restaurants for photos`)

      // Process each restaurant
      for (const restaurant of restaurants || []) {
        try {
          await processRestaurantPhoto(restaurant, googleApiKey, supabaseClient, results)
        } catch (error) {
          console.error(`Failed to process restaurant ${restaurant.id}:`, error)
          results.failed++
          results.errors.push(`Restaurant ${restaurant.id}: ${error.message}`)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Photo processing completed. Processed: ${results.processed}, Failed: ${results.failed}, Skipped: ${results.skipped}`,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function processRestaurantPhoto(
  restaurant: Restaurant, 
  apiKey: string, 
  supabaseClient: any,
  results: any,
  sourceUrl?: string
) {
  console.log(`Processing restaurant ${restaurant.id} (${restaurant.name || 'Unknown'})`)

  // If we have a sourceUrl (from the migration script), use it
  let photoUrlToDownload = sourceUrl

  // Otherwise, get URL from Google Places API
  if (!photoUrlToDownload) {
    // Skip if no photos array or empty
    if (!restaurant.photos || restaurant.photos.length === 0) {
      console.log(`Skipping ${restaurant.id}: No photos`)
      results.skipped++
      return
    }

    // Handle case where photos might be stored as string "[]" 
    let photosArray = restaurant.photos
    if (typeof photosArray === 'string') {
      try {
        photosArray = JSON.parse(photosArray)
      } catch (e) {
        console.log(`Invalid photos format for restaurant ${restaurant.id}:`, photosArray)
        results.skipped++
        return
      }
    }

    // Skip if still no valid photos
    if (!Array.isArray(photosArray) || photosArray.length === 0) {
      console.log(`Skipping ${restaurant.id}: No valid photos array`)
      results.skipped++
      return
    }

    // Get the first photo reference
    const firstPhotoReference = photosArray[0]
    
    // Validate photo reference format
    if (!firstPhotoReference || typeof firstPhotoReference !== 'string' || !firstPhotoReference.includes('places/')) {
      console.log(`Invalid photo reference for restaurant ${restaurant.id}:`, firstPhotoReference)
      results.skipped++
      return
    }
    
    try {
      console.log(`Getting fresh photo URL for ${restaurant.id} from Google Places API`)
      
      // Call Google Places Photo API (New)
      const photoApiUrl = `https://places.googleapis.com/v1/${firstPhotoReference}/media?key=${apiKey}&maxHeightPx=400&maxWidthPx=600`
      
      // Make request to get the actual photo URL
      const photoResponse = await fetch(photoApiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
        redirect: 'follow'
      })

      if (!photoResponse.ok) {
        throw new Error(`Photo API request failed: ${photoResponse.status} ${photoResponse.statusText}`)
      }

      photoUrlToDownload = photoResponse.url
      console.log(`Got fresh URL for ${restaurant.id}`)

    } catch (error) {
      console.error(`❌ Failed to get photo URL for restaurant ${restaurant.id}:`, error)
      results.failed++
      return
    }
  }

  // Now download and store the photo in Supabase Storage
  try {
    console.log(`Downloading and storing photo for ${restaurant.id}`)
    
    // Download the photo
    const photoResponse = await fetch(photoUrlToDownload)
    if (!photoResponse.ok) {
      throw new Error(`Failed to download photo: ${photoResponse.status}`)
    }

    const photoBlob = await photoResponse.blob()
    const photoBuffer = await photoBlob.arrayBuffer()

    // Generate a unique filename
    const fileExtension = getFileExtension(photoResponse.headers.get('content-type') || 'image/jpeg')
    const fileName = `restaurant-${restaurant.id}-${Date.now()}.${fileExtension}`

    console.log(`Uploading ${fileName} to Supabase Storage`)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('restaurant-photos')
      .upload(fileName, photoBuffer, {
        contentType: photoResponse.headers.get('content-type') || 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload photo: ${uploadError.message}`)
    }

    console.log(`Successfully uploaded ${fileName}`)

    // Get the public URL
    const { data: publicUrlData } = supabaseClient.storage
      .from('restaurant-photos')
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl

    console.log(`Got public URL: ${publicUrl}`)

    // Update restaurant with the Supabase Storage URL
    const { error: updateError } = await supabaseClient
      .from('restaurants')
      .update({
        primary_photo_url: publicUrl,
        photo_processed_at: new Date().toISOString()
      })
      .eq('id', restaurant.id)

    if (updateError) {
      throw new Error(`Failed to update restaurant: ${updateError.message}`)
    }

    console.log(`✅ Successfully processed and stored photo for restaurant ${restaurant.id}`)
    results.processed++

    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100))

  } catch (error) {
    console.error(`❌ Failed to process photo for restaurant ${restaurant.id}:`, error)
    
    // Mark as processed but with null URL to avoid reprocessing
    await supabaseClient
      .from('restaurants')
      .update({
        photo_processed_at: new Date().toISOString()
      })
      .eq('id', restaurant.id)
    
    results.failed++
    throw error
  }
}

function getFileExtension(contentType: string): string {
  switch (contentType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'jpg'
  }
}