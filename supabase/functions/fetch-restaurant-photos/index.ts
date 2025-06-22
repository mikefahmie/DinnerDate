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

    // Parse request body for specific restaurant IDs (optional)
    const { restaurantIds, batchSize = 50 } = await req.json().catch(() => ({}))

    // Build query to get restaurants that need photo processing
    let query = supabaseClient
      .from('restaurants')
      .select('id, photos, primary_photo_url, photo_processed_at')
      .is('primary_photo_url', null) // Only process restaurants without photos
      .not('photos', 'is', null) // Only process restaurants that have photo references
      .limit(batchSize)

    // If specific restaurant IDs provided, filter to those
    if (restaurantIds && Array.isArray(restaurantIds)) {
      query = query.in('id', restaurantIds)
    }

    const { data: restaurants, error: fetchError } = await query

    if (fetchError) {
      throw new Error(`Failed to fetch restaurants: ${fetchError.message}`)
    }

    console.log(`Processing ${restaurants?.length || 0} restaurants for photos`)

    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    }

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
  results: any
) {
  // Skip if no photos array or empty
  if (!restaurant.photos || restaurant.photos.length === 0) {
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
  
  
  // Extract the photo name from the full photo reference
  // Format: "places/ChIJTX4OFJhTO4gRyJY1ttCK-5U/photos/AXQCQNRqoxepFkxnFlB2VO5Jk4SIaaZo7CPP7yDPIH2njev3b3xyGudzYD_434NBtyw5ZObsZ5LvuW-wYPjOSC3CElQ3JDPe3Q526Dgv54R0p8TqZKMXPvgTi6vlzd-9yNRMkC3Zkhl4Em3MSgGjM_nqgzihYEwT-mdxHXbvqYi_XRJw_Y9d_Qq0DdvJ7usoPaWQci8b2FMhpfL5O2rPXeGScMTggFnT-pJPDBayamvnhA3N72jw-0xhO8q2_xq2x3SbjQeG12Np2sUZroFrSHEaI290jEOhFlovjsv8NHNnDZ7wyw"
  
  try {
    // Call Google Places Photo API (New)
    const photoUrl = `https://places.googleapis.com/v1/${firstPhotoReference}/media?key=${apiKey}&maxHeightPx=400&maxWidthPx=600`
    
    // Make request to get the actual photo URL
    const photoResponse = await fetch(photoUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      },
      redirect: 'follow' // Important: follow redirects to get the actual image URL
    })

    if (!photoResponse.ok) {
      throw new Error(`Photo API request failed: ${photoResponse.status} ${photoResponse.statusText}`)
    }

    // The final URL after redirects is our photo URL
    const finalPhotoUrl = photoResponse.url

    // Update restaurant with the photo URL
    const { error: updateError } = await supabaseClient
      .from('restaurants')
      .update({
        primary_photo_url: finalPhotoUrl,
        photo_processed_at: new Date().toISOString()
      })
      .eq('id', restaurant.id)

    if (updateError) {
      throw new Error(`Failed to update restaurant: ${updateError.message}`)
    }

    console.log(`✅ Successfully processed photo for restaurant ${restaurant.id}`)
    results.processed++

    // Add delay to respect rate limits (Google recommends staying under 100 QPS)
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 50)) // 50ms = 20 requests per second

  } catch (error) {
    console.error(`❌ Failed to process photo for restaurant ${restaurant.id}:`, error)
    
    // Mark as processed but with null URL to avoid reprocessing
    await supabaseClient
      .from('restaurants')
      .update({
        photo_processed_at: new Date().toISOString()
      })
      .eq('id', restaurant.id)
    
    throw error
  }
}