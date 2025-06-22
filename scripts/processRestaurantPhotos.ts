// Helper script to process restaurant photos
// File: scripts/processRestaurantPhotos.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PhotoProcessingOptions {
  batchSize?: number;
  restaurantIds?: string[];
  dryRun?: boolean;
}

export async function processRestaurantPhotos(options: PhotoProcessingOptions = {}) {
  const { 
    batchSize = 50, 
    restaurantIds,
    dryRun = false 
  } = options;

  try {
    console.log('🚀 Starting restaurant photo processing...');
    console.log(`Batch size: ${batchSize}`);
    if (restaurantIds) {
      console.log(`Processing specific restaurants: ${restaurantIds.length} items`);
    }
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made');
    }

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('fetch-restaurant-photos', {
      body: {
        batchSize,
        restaurantIds,
        dryRun
      }
    });

    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }

    console.log('✅ Photo processing completed!');
    console.log('Results:', data);
    
    return data;

  } catch (error) {
    console.error('❌ Photo processing failed:', error);
    throw error;
  }
}

// Status checking function
export async function checkPhotoProcessingStatus() {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        id,
        name,
        photos,
        primary_photo_url,
        photo_processed_at
      `)
      .limit(10);

    if (error) throw error;

    console.log('\n📊 Photo Processing Status:');
    console.log('================================');
    
    let withPhotos = 0;
    let withoutPhotos = 0;
    let processed = 0;
    let needProcessing = 0;

    data.forEach(restaurant => {
      const hasPhotoReference = restaurant.photos && restaurant.photos.length > 0;
      const hasProcessedPhoto = !!restaurant.primary_photo_url;
      const isProcessed = !!restaurant.photo_processed_at;

      if (hasPhotoReference) {
        withPhotos++;
        if (hasProcessedPhoto) {
          processed++;
        } else if (isProcessed) {
          // Processed but no photo URL (likely failed)
          console.log(`⚠️  ${restaurant.name}: Processed but no photo URL`);
        } else {
          needProcessing++;
          console.log(`⏳ ${restaurant.name}: Needs processing`);
        }
      } else {
        withoutPhotos++;
      }
    });

    console.log(`\nRestaurants with photo references: ${withPhotos}`);
    console.log(`Restaurants without photo references: ${withoutPhotos}`);
    console.log(`Successfully processed photos: ${processed}`);
    console.log(`Need processing: ${needProcessing}`);

    return {
      total: data.length,
      withPhotos,
      withoutPhotos,
      processed,
      needProcessing
    };

  } catch (error) {
    console.error('Failed to check status:', error);
    throw error;
  }
}

// Example usage functions
export async function processAllRestaurants() {
  return processRestaurantPhotos({ batchSize: 100 });
}

export async function processSpecificRestaurants(restaurantIds: string[]) {
  return processRestaurantPhotos({ restaurantIds });
}

export async function dryRunPhotoProcessing() {
  return processRestaurantPhotos({ dryRun: true, batchSize: 5 });
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'status':
      checkPhotoProcessingStatus()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'process':
      processAllRestaurants()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'dry-run':
      dryRunPhotoProcessing()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('Usage: npx ts-node scripts/processRestaurantPhotos.ts <command>');
      console.log('Commands:');
      console.log('  status    - Check photo processing status');
      console.log('  process   - Process all restaurant photos');
      console.log('  dry-run   - Test photo processing without making changes');
      process.exit(1);
  }
}