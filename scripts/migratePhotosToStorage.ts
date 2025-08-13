// Migration script to move restaurant photos from direct URLs to Supabase Storage
// File: scripts/migratePhotosToStorage.ts

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from supabase/.env
config({ path: 'supabase/.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for admin operations that bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MigrationOptions {
  batchSize?: number;
  restaurantIds?: string[];
  dryRun?: boolean;
  onlyBrokenUrls?: boolean;
}

interface MigrationStats {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

export async function migratePhotosToStorage(options: MigrationOptions = {}): Promise<MigrationStats> {
  const { 
    batchSize = 50, 
    restaurantIds,
    dryRun = false,
    onlyBrokenUrls = false
  } = options;

  const stats: MigrationStats = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    startTime: new Date()
  };

  try {
    console.log('🚀 Starting photo migration to Supabase Storage...');
    console.log(`Batch size: ${batchSize}`);
    if (restaurantIds) {
      console.log(`Processing specific restaurants: ${restaurantIds.length} items`);
    }
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made');
    }
    if (onlyBrokenUrls) {
      console.log('🔧 BROKEN URLs ONLY - Processing only likely broken URLs');
    }

    // Build query
    let query = supabase
      .from('restaurants')
      .select('id, name, photos, primary_photo_url');

    if (restaurantIds && restaurantIds.length > 0) {
      query = query.in('id', restaurantIds);
    } else {
      // Get ALL restaurants that have photos, regardless of current primary_photo_url
      query = query.not('photos', 'is', null);
      
      if (onlyBrokenUrls) {
        // Only process restaurants with likely broken URLs
        query = query.not('primary_photo_url', 'is', null)
                     .like('primary_photo_url', '%google%');
      } else {
        // Only exclude restaurants that already have successful Supabase Storage URLs
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
        query = query.not('primary_photo_url', 'like', `%${supabaseUrl}/storage/%`);
      }
    }

    const { data: restaurants, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`);
    }

    if (!restaurants || restaurants.length === 0) {
      console.log('✅ No restaurants found that need photo migration');
      stats.endTime = new Date();
      return stats;
    }

    console.log(`Found ${restaurants.length} restaurants to process`);

    // Process in batches
    for (let i = 0; i < restaurants.length; i += batchSize) {
      const batch = restaurants.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(restaurants.length / batchSize)}`);
      
      await processBatch(batch, options, stats);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < restaurants.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    stats.endTime = new Date();
    const duration = (stats.endTime.getTime() - stats.startTime.getTime()) / 1000;

    console.log('\n🎉 Photo migration completed!');
    console.log('============================');
    console.log(`Duration: ${duration.toFixed(1)}s`);
    console.log(`Processed: ${stats.processed}`);
    console.log(`Succeeded: ${stats.succeeded}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Skipped: ${stats.skipped}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.forEach(error => console.log(`  - ${error}`));
    }

    return stats;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    stats.endTime = new Date();
    throw error;
  }
}

async function processBatch(
  restaurants: any[], 
  options: MigrationOptions, 
  stats: MigrationStats
) {
  const promises = restaurants.map(restaurant => 
    processRestaurant(restaurant, options, stats)
  );

  await Promise.allSettled(promises);
}

async function processRestaurant(restaurant: any, options: MigrationOptions, stats: MigrationStats) {
  stats.processed++;

  try {
    const photos = restaurant.photos;
    
    if (!photos || photos.length === 0) {
      console.log(`⏭️  ${restaurant.name}: No photos to migrate`);
      stats.skipped++;
      return;
    }

    // Check if already migrated to Supabase Storage
    if (restaurant.primary_photo_url && 
        restaurant.primary_photo_url.includes(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/`)) {
      console.log(`✅ ${restaurant.name}: Already migrated to Supabase Storage`);
      stats.skipped++;
      return;
    }

    if (options.dryRun) {
      console.log(`🔍 ${restaurant.name}: Would test and migrate photo`);
      if (restaurant.primary_photo_url) {
        console.log(`   Current URL: ${restaurant.primary_photo_url.substring(0, 80)}...`);
      }
      stats.succeeded++;
      return;
    }

    let photoUrlToMigrate = restaurant.primary_photo_url;
    let photoSource = 'existing';

    // Step 1: Test existing URL if we have one
    if (restaurant.primary_photo_url) {
      console.log(`🧪 ${restaurant.name}: Testing existing photo URL...`);
      
      try {
        const response = await fetch(restaurant.primary_photo_url, { 
          method: 'HEAD'
        });
        
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          console.log(`✅ ${restaurant.name}: Existing URL works, will migrate it`);
          photoUrlToMigrate = restaurant.primary_photo_url;
          photoSource = 'existing-working';
        } else {
          console.log(`❌ ${restaurant.name}: Existing URL failed (${response.status}), will get fresh URL`);
          photoUrlToMigrate = null;
        }
      } catch (error) {
        console.log(`❌ ${restaurant.name}: Existing URL failed (${(error as Error).message}), will get fresh URL`);
        photoUrlToMigrate = null;
      }
    }

    // Step 2: If existing URL failed or doesn't exist, get fresh URL from Google
    if (!photoUrlToMigrate) {
      console.log(`🔄 ${restaurant.name}: Getting fresh photo URL from Google Places API...`);
      
      // Parse photos array (might be stored as string)
      let photosArray = photos;
      if (typeof photosArray === 'string') {
        try {
          photosArray = JSON.parse(photosArray);
        } catch (e) {
          console.log(`❌ ${restaurant.name}: Invalid photos format`);
          stats.failed++;
          return;
        }
      }

      if (!Array.isArray(photosArray) || photosArray.length === 0) {
        console.log(`❌ ${restaurant.name}: No valid photo references`);
        stats.failed++;
        return;
      }

      // Get fresh URL from Google Places Photo API
      const photoReference = photosArray[0];
      if (!photoReference || !photoReference.includes('places/')) {
        console.log(`❌ ${restaurant.name}: Invalid photo reference format`);
        stats.failed++;
        return;
      }

      try {
        // Call Google Places Photo API to get fresh URL
        const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!googleApiKey) {
          throw new Error('Google Places API key not found');
        }

        const photoApiUrl = `https://places.googleapis.com/v1/${photoReference}/media?key=${googleApiKey}&maxHeightPx=400&maxWidthPx=600`;
        
        const photoResponse = await fetch(photoApiUrl, {
          method: 'GET',
          headers: { 'Accept': 'image/*' },
          redirect: 'follow'
        });

        if (!photoResponse.ok) {
          throw new Error(`Google API failed: ${photoResponse.status}`);
        }

        photoUrlToMigrate = photoResponse.url;
        photoSource = 'google-fresh';
        console.log(`✅ ${restaurant.name}: Got fresh URL from Google`);

      } catch (error) {
        console.log(`❌ ${restaurant.name}: Failed to get fresh URL - ${(error as Error).message}`);
        
        // Clear the broken URL and mark as processed
        const { error: clearError } = await supabase
          .from('restaurants')
          .update({ 
            primary_photo_url: null,
            photo_processed_at: new Date().toISOString() 
          })
          .eq('id', restaurant.id);

        if (clearError) {
          console.log(`❌ ${restaurant.name}: Failed to clear broken URL - ${clearError.message}`);
        } else {
          console.log(`🧹 ${restaurant.name}: Cleared broken URL`);
        }
        
        stats.failed++;
        return;
      }
    }

    // Step 3: Migrate the working URL to Supabase Storage
    if (photoUrlToMigrate) {
      console.log(`📤 ${restaurant.name}: Migrating ${photoSource} photo to Supabase Storage...`);
      
      // Call the edge function to handle the actual migration
      const { data, error } = await supabase.functions.invoke('fetch-restaurant-photos', {
        body: {
          restaurantIds: [restaurant.id],
          batchSize: 1,
          sourceUrl: photoUrlToMigrate // Pass the working URL to the edge function
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      console.log(`✅ ${restaurant.name}: Successfully migrated ${photoSource} photo`);
      stats.succeeded++;
    }

  } catch (error: any) {
    console.error(`❌ ${restaurant.name}: Migration failed -`, error.message);
    stats.failed++;
    stats.errors.push(`Restaurant ${restaurant.id} (${restaurant.name}): ${error.message}`);
  }
}

function isLikelyBrokenUrl(url: string): boolean {
  // Check for patterns that indicate broken URLs
  const brokenPatterns = [
    'googleusercontent.com',
    'maps.googleapis.com',
    'places.googleapis.com',
    'google.com/maps',
    'lh3.googleusercontent.com',
    'lh5.googleusercontent.com'
  ];

  return brokenPatterns.some(pattern => url.includes(pattern));
}

export async function migrateBrokenUrlsOnly(): Promise<MigrationStats> {
  return migratePhotosToStorage({ 
    onlyBrokenUrls: true,
    batchSize: 100
  });
}

export async function migrateSpecificRestaurants(restaurantIds: string[]): Promise<MigrationStats> {
  return migratePhotosToStorage({ 
    restaurantIds,
    batchSize: restaurantIds.length
  });
}

export async function dryRunMigration(): Promise<MigrationStats> {
  return migratePhotosToStorage({ 
    dryRun: true, 
    batchSize: 50 
  });
}

export async function migrateFirst10(): Promise<MigrationStats> {
  return migratePhotosToStorage({ 
    batchSize: 10,
    dryRun: false
  });
}

export async function migrateAllRestaurants(): Promise<MigrationStats> {
  return migratePhotosToStorage({ 
    batchSize: 100, // Process in batches of 100
    dryRun: false
  });
}

export async function checkMigrationStatus() {
  try {
    console.log('📊 Checking photo migration status...');

    // Get total restaurants with photos
    const { data: totalRestaurants, error: totalError } = await supabase
      .from('restaurants')
      .select('id')
      .not('photos', 'is', null);

    if (totalError) throw totalError;

    // Get restaurants already migrated to storage
    const { data: migratedRestaurants, error: migratedError } = await supabase
      .from('restaurants')
      .select('id')
      .not('photos', 'is', null)
      .not('primary_photo_url', 'is', null)
      .like('primary_photo_url', `%${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/%`);

    if (migratedError) throw migratedError;

    // Get restaurants with broken URLs
    const { data: brokenUrlRestaurants, error: brokenError } = await supabase
      .from('restaurants')
      .select('id, name, primary_photo_url')
      .not('photos', 'is', null)
      .not('primary_photo_url', 'is', null)
      .or('primary_photo_url.like.%googleusercontent.com%,primary_photo_url.like.%googleapis.com%');

    if (brokenError) throw brokenError;

    // Get restaurants with null photos (failed migrations)
    const { data: nullPhotoRestaurants, error: nullError } = await supabase
      .from('restaurants')
      .select('id')
      .not('photos', 'is', null)
      .is('primary_photo_url', null)
      .not('photo_processed_at', 'is', null);

    if (nullError) throw nullError;

    console.log('\n📊 Photo Migration Status:');
    console.log('==========================');
    console.log(`Total restaurants with photos: ${totalRestaurants?.length || 0}`);
    console.log(`Successfully migrated to storage: ${migratedRestaurants?.length || 0}`);
    console.log(`With broken URLs (need migration): ${brokenUrlRestaurants?.length || 0}`);
    console.log(`Failed migrations (null photos): ${nullPhotoRestaurants?.length || 0}`);
    console.log(`Still need migration: ${(totalRestaurants?.length || 0) - (migratedRestaurants?.length || 0)}`);

    const migrationProgress = totalRestaurants?.length
      ? ((migratedRestaurants?.length || 0) / totalRestaurants.length * 100).toFixed(1)
      : '0';
    console.log(`Migration progress: ${migrationProgress}%`);

    return {
      totalWithPhotos: totalRestaurants?.length || 0,
      migrated: migratedRestaurants?.length || 0,
      needMigration: (totalRestaurants?.length || 0) - (migratedRestaurants?.length || 0),
      brokenUrls: brokenUrlRestaurants?.length || 0,
      nullPhotos: nullPhotoRestaurants?.length || 0,
      progressPercent: parseFloat(migrationProgress)
    };

  } catch (error) {
    console.error('Failed to check migration status:', error);
    throw error;
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'status':
      checkMigrationStatus()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'migrate':
      migratePhotosToStorage()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'migrate-all':
      migrateAllRestaurants()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'migrate-broken':
      migrateBrokenUrlsOnly()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'dry-run':
      dryRunMigration()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'migrate-10':
      migrateFirst10()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('Usage: npx tsx scripts/migratePhotosToStorage.ts <command>');
      console.log('Commands:');
      console.log('  status         - Check migration status');
      console.log('  migrate        - Migrate all photos to storage');
      console.log('  migrate-all    - Migrate ALL restaurants (no limits)');
      console.log('  migrate-broken - Migrate only broken URLs');
      console.log('  migrate-10     - Migrate first 10 restaurants (for testing)');
      console.log('  dry-run        - Test migration without making changes');
      process.exit(1);
  }
}