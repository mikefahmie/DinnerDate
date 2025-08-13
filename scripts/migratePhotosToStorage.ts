// scripts/migratePhotosToStorage.ts
// Migration script to move from URL caching to Supabase Storage
// FIXED: TypeScript errors and Supabase query issues

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface MigrationOptions {
  batchSize?: number;
  dryRun?: boolean;
  forceRedownload?: boolean;
  restaurantIds?: string[];
  skipBrokenUrls?: boolean;
}

interface MigrationStats {
  total: number;
  processed: number;
  failed: number;
  skipped: number;
  alreadyMigrated: number;
  brokenUrls: number;
  errors: string[];
}

export async function migratePhotosToStorage(options: MigrationOptions = {}): Promise<MigrationStats> {
  const {
    batchSize = 50,
    dryRun = false,
    forceRedownload = false,
    restaurantIds,
    skipBrokenUrls = true
  } = options;

  console.log('🚀 Starting photo migration to Supabase Storage...');
  console.log(`Batch size: ${batchSize}`);
  console.log(`Dry run: ${dryRun}`);
  console.log(`Force redownload: ${forceRedownload}`);

  const stats: MigrationStats = {
    total: 0,
    processed: 0,
    failed: 0,
    skipped: 0,
    alreadyMigrated: 0,
    brokenUrls: 0,
    errors: []
  };

  try {
    // First, get the count of restaurants that need migration
    let countQuery = supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .not('photos', 'is', null);

    if (!forceRedownload) {
      countQuery = countQuery.is('photo_storage_path', null);
    }

    if (restaurantIds) {
      countQuery = countQuery.in('id', restaurantIds);
    }

    const { count } = await countQuery;
    stats.total = count || 0;

    console.log(`📊 Found ${stats.total} restaurants that need migration`);

    if (stats.total === 0) {
      console.log('✅ No restaurants need migration!');
      return stats;
    }

    // Process in batches
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`\n📦 Processing batch ${Math.floor(offset / batchSize) + 1}...`);
      
      const batch = await processBatch(offset, batchSize, options, stats);
      
      if (batch.length < batchSize) {
        hasMore = false;
      }
      
      offset += batchSize;

      // Progress update
      console.log(`Progress: ${stats.processed + stats.failed + stats.skipped}/${stats.total} restaurants processed`);
    }

    // Final summary
    console.log('\n🏁 Migration completed!');
    console.log('='.repeat(50));
    console.log(`Total restaurants: ${stats.total}`);
    console.log(`Successfully processed: ${stats.processed}`);
    console.log(`Already migrated: ${stats.alreadyMigrated}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Skipped: ${stats.skipped}`);
    console.log(`Broken URLs found: ${stats.brokenUrls}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
      if (stats.errors.length > 10) {
        console.log(`  ... and ${stats.errors.length - 10} more errors`);
      }
    }

    return stats;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('💥 Migration failed:', errorMessage);
    throw error;
  }
}

async function processBatch(
  offset: number, 
  batchSize: number, 
  options: MigrationOptions, 
  stats: MigrationStats
): Promise<any[]> {
  // Build query for this batch
  let query = supabase
    .from('restaurants')
    .select(`
      id,
      google_place_id,
      name,
      photos,
      primary_photo_url,
      photo_storage_path,
      photo_processed_at
    `)
    .not('photos', 'is', null)
    .range(offset, offset + batchSize - 1);

  if (!options.forceRedownload) {
    query = query.is('photo_storage_path', null);
  }

  if (options.restaurantIds) {
    query = query.in('id', options.restaurantIds);
  }

  const { data: restaurants, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch batch: ${error.message}`);
  }

  if (!restaurants || restaurants.length === 0) {
    return [];
  }

  // Process each restaurant in the batch
  for (const restaurant of restaurants) {
    try {
      await processRestaurant(restaurant, options, stats);
    } catch (error) {
      stats.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      stats.errors.push(`Restaurant ${restaurant.id} (${restaurant.name}): ${errorMessage}`);
      console.error(`❌ Failed to process ${restaurant.name}:`, error);
    }
  }

  return restaurants;
}

async function processRestaurant(restaurant: any, options: MigrationOptions, stats: MigrationStats) {
  // Check if already migrated
  if (restaurant.photo_storage_path && !options.forceRedownload) {
    stats.alreadyMigrated++;
    console.log(`⏭️  ${restaurant.name}: Already migrated`);
    return;
  }

  // Check for broken URL
  if (restaurant.primary_photo_url && isLikelyBrokenUrl(restaurant.primary_photo_url)) {
    stats.brokenUrls++;
    if (options.skipBrokenUrls) {
      console.log(`🔗 ${restaurant.name}: Skipping broken URL`);
      stats.skipped++;
      return;
    }
  }

  if (options.dryRun) {
    console.log(`🔍 DRY RUN - Would process: ${restaurant.name}`);
    stats.processed++;
    return;
  }

  // Call the edge function to download and store the photo
  const { data, error } = await supabase.functions.invoke('fetch-restaurant-photos', {
    body: {
      restaurantIds: [restaurant.id],
      batchSize: 1,
      forceRedownload: options.forceRedownload
    }
  });

  if (error) {
    throw new Error(`Edge function error: ${error.message}`);
  }

  if (data?.results?.processed > 0) {
    console.log(`✅ ${restaurant.name}: Successfully migrated to storage`);
    stats.processed++;
  } else if (data?.results?.skipped > 0) {
    console.log(`⏭️  ${restaurant.name}: Skipped by edge function`);
    stats.skipped++;
  } else {
    console.log(`⚠️  ${restaurant.name}: No action taken`);
    stats.skipped++;
  }
}

function isLikelyBrokenUrl(url: string): boolean {
  // Check if URL is from Google services (likely to expire)
  const googleDomains = [
    'googleapis.com',
    'googleusercontent.com',
    'ggpht.com',
    'maps.googleapis.com'
  ];

  return googleDomains.some(domain => url.includes(domain));
}

// Utility functions for different migration scenarios

export async function migrateBrokenUrlsOnly(): Promise<MigrationStats> {
  console.log('🔧 Migrating only restaurants with broken URLs...');
  
  // First, identify restaurants with broken URLs
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, primary_photo_url')
    .not('primary_photo_url', 'is', null)
    .is('photo_storage_path', null);

  const brokenUrlRestaurants = restaurants?.filter(r => 
    r.primary_photo_url && isLikelyBrokenUrl(r.primary_photo_url)
  ) || [];

  console.log(`Found ${brokenUrlRestaurants.length} restaurants with likely broken URLs`);

  const restaurantIds = brokenUrlRestaurants.map(r => r.id);

  return migratePhotosToStorage({
    restaurantIds,
    skipBrokenUrls: false
  });
}

export async function migrateSpecificRestaurants(restaurantIds: string[]): Promise<MigrationStats> {
  console.log(`🎯 Migrating ${restaurantIds.length} specific restaurants...`);
  
  return migratePhotosToStorage({
    restaurantIds,
    forceRedownload: true
  });
}

export async function dryRunMigration(): Promise<MigrationStats> {
  console.log('🔍 Performing dry run migration...');
  
  return migratePhotosToStorage({
    dryRun: true,
    batchSize: 10
  });
}

export async function checkMigrationStatus() {
  console.log('📊 Checking migration status...');
  
  // Get counts using proper Supabase syntax
  const { count: totalCount } = await supabase
    .from('restaurants')
    .select('*', { count: 'exact', head: true })
    .not('photos', 'is', null);

  const { count: migratedCount } = await supabase
    .from('restaurants')
    .select('*', { count: 'exact', head: true })
    .not('photo_storage_path', 'is', null);

  const { data: brokenUrls } = await supabase
    .from('restaurants')
    .select('primary_photo_url')
    .not('primary_photo_url', 'is', null)
    .is('photo_storage_path', null);

  const brokenCount = brokenUrls?.filter(r => 
    r.primary_photo_url && isLikelyBrokenUrl(r.primary_photo_url)
  ).length || 0;

  console.log('\n📈 Migration Status:');
  console.log('='.repeat(40));
  console.log(`Total restaurants with photos: ${totalCount || 0}`);
  console.log(`Successfully migrated to storage: ${migratedCount || 0}`);
  console.log(`Still need migration: ${(totalCount || 0) - (migratedCount || 0)}`);
  console.log(`Likely broken URLs: ${brokenCount}`);
  
  const migrationProgress = totalCount 
    ? ((migratedCount || 0) / totalCount * 100).toFixed(1)
    : '0';
  
  console.log(`Migration progress: ${migrationProgress}%`);

  return {
    totalWithPhotos: totalCount || 0,
    migrated: migratedCount || 0,
    needMigration: (totalCount || 0) - (migratedCount || 0),
    brokenUrls: brokenCount,
    progressPercent: parseFloat(migrationProgress)
  };
}

// Command line interface for easy execution
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  async function runCommand() {
    try {
      switch (command) {
        case 'status':
          await checkMigrationStatus();
          break;
          
        case 'migrate':
          await migratePhotosToStorage();
          break;
          
        case 'migrate-broken':
          await migrateBrokenUrlsOnly();
          break;
          
        case 'dry-run':
          await dryRunMigration();
          break;
          
        case 'migrate-batch':
          const batchSize = parseInt(arg) || 10;
          await migratePhotosToStorage({ batchSize });
          break;
          
        case 'migrate-specific':
          if (!arg) {
            console.error('Please provide restaurant IDs as comma-separated values');
            process.exit(1);
          }
          const restaurantIds = arg.split(',').map(id => id.trim());
          await migrateSpecificRestaurants(restaurantIds);
          break;
          
        default:
          console.log('📖 DinnerDate Photo Migration Tool');
          console.log('');
          console.log('Usage: npx ts-node scripts/migratePhotosToStorage.ts <command> [args]');
          console.log('');
          console.log('Commands:');
          console.log('  status              - Check current migration status');
          console.log('  migrate             - Start full migration (default batch size: 50)');
          console.log('  migrate-broken      - Migrate only restaurants with broken URLs');
          console.log('  migrate-batch <n>   - Migrate with custom batch size');
          console.log('  migrate-specific <ids> - Migrate specific restaurant IDs (comma-separated)');
          console.log('  dry-run             - Test migration without making changes');
          console.log('');
          console.log('Examples:');
          console.log('  npm run migrate:photos status');
          console.log('  npm run migrate:photos migrate');
          console.log('  npm run migrate:photos migrate-broken');
          console.log('  npm run migrate:photos migrate-batch 25');
          console.log('  npm run migrate:photos migrate-specific abc123,def456');
          console.log('  npm run migrate:photos dry-run');
          process.exit(1);
      }
      
      process.exit(0);
    } catch (error) {
      console.error('💥 Command failed:', error);
      process.exit(1);
    }
  }
  
  runCommand();
}
    // scripts/migratePhotosToStorage.ts
// Migration script to move from URL caching to Supabase Storage

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface MigrationOptions {
  batchSize?: number;
  dryRun?: boolean;
  forceRedownload?: boolean;
  restaurantIds?: string[];
  skipBrokenUrls?: boolean;
}

interface MigrationStats {
  total: number;
  processed: number;
  failed: number;
  skipped: number;
  alreadyMigrated: number;
  brokenUrls: number;
  errors: string[];
}

export async function migratePhotosToStorage(options: MigrationOptions = {}): Promise<MigrationStats> {
  const {
    batchSize = 50,
    dryRun = false,
    forceRedownload = false,
    restaurantIds,
    skipBrokenUrls = true
  } = options;

  console.log('🚀 Starting photo migration to Supabase Storage...');
  console.log(`Batch size: ${batchSize}`);
  console.log(`Dry run: ${dryRun}`);
  console.log(`Force redownload: ${forceRedownload}`);

  const stats: MigrationStats = {
    total: 0,
    processed: 0,
    failed: 0,
    skipped: 0,
    alreadyMigrated: 0,
    brokenUrls: 0,
    errors: []
  };

  try {
    // First, get the count of restaurants that need migration
    const countQuery = supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .not('photos', 'is', null);

    if (!forceRedownload) {
      countQuery.is('photo_storage_path', null);
    }

    if (restaurantIds) {
      countQuery.in('id', restaurantIds);
    }

    const { count } = await countQuery;
    stats.total = count || 0;

    console.log(`📊 Found ${stats.total} restaurants that need migration`);

    if (stats.total === 0) {
      console.log('✅ No restaurants need migration!');
      return stats;
    }

    // Process in batches
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`\n📦 Processing batch ${Math.floor(offset / batchSize) + 1}...`);
      
      const batch = await processBatch(offset, batchSize, options, stats);
      
      if (batch.length < batchSize) {
        hasMore = false;
      }
      
      offset += batchSize;

      // Progress update
      console.log(`Progress: ${stats.processed + stats.failed + stats.skipped}/${stats.total} restaurants processed`);
    }

    // Final summary
    console.log('\n🏁 Migration completed!');
    console.log('='.repeat(50));
    console.log(`Total restaurants: ${stats.total}`);
    console.log(`Successfully processed: ${stats.processed}`);
    console.log(`Already migrated: ${stats.alreadyMigrated}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Skipped: ${stats.skipped}`);
    console.log(`Broken URLs found: ${stats.brokenUrls}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
      if (stats.errors.length > 10) {
        console.log(`  ... and ${stats.errors.length - 10} more errors`);
      }
    }

    return stats;

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

async function processBatch(
  offset: number, 
  batchSize: number, 
  options: MigrationOptions, 
  stats: MigrationStats
): Promise<any[]> {
  // Build query for this batch
  let query = supabase
    .from('restaurants')
    .select(`
      id,
      google_place_id,
      name,
      photos,
      primary_photo_url,
      photo_storage_path,
      photo_processed_at
    `)
    .not('photos', 'is', null)
    .range(offset, offset + batchSize - 1);

  if (!options.forceRedownload) {
    query = query.is('photo_storage_path', null);
  }

  if (options.restaurantIds) {
    query = query.in('id', options.restaurantIds);
  }

  const { data: restaurants, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch batch: ${error.message}`);
  }

  if (!restaurants || restaurants.length === 0) {
    return [];
  }

  // Process each restaurant in the batch
  for (const restaurant of restaurants) {
    try {
      await processRestaurant(restaurant, options, stats);
    } catch (error) {
      stats.failed++;
      stats.errors.push(`Restaurant ${restaurant.id} (${restaurant.name}): ${error.message}`);
      console.error(`❌ Failed to process ${restaurant.name}:`, error);
    }
  }

  return restaurants;
}

async function processRestaurant(restaurant: any, options: MigrationOptions, stats: MigrationStats) {
  // Check if already migrated
  if (restaurant.photo_storage_path && !options.forceRedownload) {
    stats.alreadyMigrated++;
    console.log(`⏭️  ${restaurant.name}: Already migrated`);
    return;
  }

  // Check for broken URL
  if (restaurant.primary_photo_url && isLikelyBrokenUrl(restaurant.primary_photo_url)) {
    stats.brokenUrls++;
    if (options.skipBrokenUrls) {
      console.log(`🔗 ${restaurant.name}: Skipping broken URL`);
      stats.skipped++;
      return;
    }
  }

  if (options.dryRun) {
    console.log(`🔍 DRY RUN - Would process: ${restaurant.name}`);
    stats.processed++;
    return;
  }

  // Call the edge function to download and store the photo
  const { data, error } = await supabase.functions.invoke('fetch-restaurant-photos', {
    body: {
      restaurantIds: [restaurant.id],
      batchSize: 1,
      forceRedownload: options.forceRedownload
    }
  });

  if (error) {
    throw new Error(`Edge function error: ${error.message}`);
  }

  if (data?.results?.processed > 0) {
    console.log(`✅ ${restaurant.name}: Successfully migrated to storage`);
    stats.processed++;
  } else if (data?.results?.skipped > 0) {
    console.log(`⏭️  ${restaurant.name}: Skipped by edge function`);
    stats.skipped++;
  } else {
    console.log(`⚠️  ${restaurant.name}: No action taken`);
    stats.skipped++;
  }
}

function isLikelyBrokenUrl(url: string): boolean {
  // Check if URL is from Google services (likely to expire)
  const googleDomains = [
    'googleapis.com',
    'googleusercontent.com',
    'ggpht.com',
    'maps.googleapis.com'
  ];

  return googleDomains.some(domain => url.includes(domain));
}

// Utility functions for different migration scenarios

export async function migrateBrokenUrlsOnly(): Promise<MigrationStats> {
  console.log('🔧 Migrating only restaurants with broken URLs...');
  
  // First, identify restaurants with broken URLs
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, primary_photo_url')
    .not('primary_photo_url', 'is', null)
    .is('photo_storage_path', null);

  const brokenUrlRestaurants = restaurants?.filter(r => 
    r.primary_photo_url && isLikelyBrokenUrl(r.primary_photo_url)
  ) || [];

  console.log(`Found ${brokenUrlRestaurants.length} restaurants with likely broken URLs`);

  const restaurantIds = brokenUrlRestaurants.map(r => r.id);

  return migratePhotosToStorage({
    restaurantIds,
    skipBrokenUrls: false
  });
}

export async function migrateSpecificRestaurants(restaurantIds: string[]): Promise<MigrationStats> {
  console.log(`🎯 Migrating ${restaurantIds.length} specific restaurants...`);
  
  return migratePhotosToStorage({
    restaurantIds,
    forceRedownload: true
  });
}

export async function dryRunMigration(): Promise<MigrationStats> {
  console.log('🔍 Performing dry run migration...');
  
  return migratePhotosToStorage({
    dryRun: true,
    batchSize: 10
  });
}

export async function checkMigrationStatus() {
  console.log('📊 Checking migration status...');
  
  const { data: totalRestaurants } = await supabase
    .from('restaurants')
    .select('id', { count: 'exact', head: true })
    .not('photos', 'is', null);

  const { data: migratedRestaurants } = await supabase
    .from('restaurants')
    .select('id', { count: 'exact', head: true })
    .not('photo_storage_path', 'is', null);

  const { data: brokenUrls } = await supabase
    .from('restaurants')
    .select('primary_photo_url')
    .not('primary_photo_url', 'is', null)
    .is('photo_storage_path', null);

  const brokenCount = brokenUrls?.filter(r => 
    r.primary_photo_url && isLikelyBrokenUrl(r.primary_photo_url)
  ).length || 0;

  console.log('\n📈 Migration Status:');
  console.log('='.repeat(40));
  console.log(`Total restaurants with photos: ${totalRestaurants?.count || 0}`);
  console.log(`Successfully migrated to storage: ${migratedRestaurants?.count || 0}`);
  console.log(`Still need migration: ${(totalRestaurants?.count || 0) - (migratedRestaurants?.count || 0)}`);
  console.log(`Likely broken URLs: ${brokenCount}`);
  
  const migrationProgress = totalRestaurants?.count 
    ? ((migratedRestaurants?.count || 0) / totalRestaurants.count * 100).toFixed(1)
    : '0';
  
  console.log(`Migration progress: ${migrationProgress}%`);

  return {
    totalWithPhotos: totalRestaurants?.count || 0,
    migrated: migratedRestaurants?.count || 0,
    needMigration: (totalRestaurants?.count || 0) - (migratedRestaurants?.count || 0),
    brokenUrls: brokenCount,
    progressPercent: parseFloat(migrationProgress)
  };
}

// Command line interface for easy execution
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  async function runCommand() {
    try {
      switch (command) {
        case 'status':
          await checkMigrationStatus();
          break;
          
        case 'migrate':
          await migratePhotosToStorage();
          break;
          
        case 'migrate-broken':
          await migrateBrokenUrlsOnly();
          break;
          
        case 'dry-run':
          await dryRunMigration();
          break;
          
        case 'migrate-batch':
          const batchSize = parseInt(arg) || 10;
          await migratePhotosToStorage({ batchSize });
          break;
          
        case 'migrate-specific':
          if (!arg) {
            console.error('Please provide restaurant IDs as comma-separated values');
            process.exit(1);
          }
          const restaurantIds = arg.split(',').map(id => id.trim());
          await migrateSpecificRestaurants(restaurantIds);
          break;
          
        default:
          console.log('📖 DinnerDate Photo Migration Tool');
          console.log('');
          console.log('Usage: npx ts-node scripts/migratePhotosToStorage.ts <command> [args]');
          console.log('');
          console.log('Commands:');
          console.log('  status              - Check current migration status');
          console.log('  migrate             - Start full migration (default batch size: 50)');
          console.log('  migrate-broken      - Migrate only restaurants with broken URLs');
          console.log('  migrate-batch <n>   - Migrate with custom batch size');
          console.log('  migrate-specific <ids> - Migrate specific restaurant IDs (comma-separated)');
          console.log('  dry-run             - Test migration without making changes');
          console.log('');
          console.log('Examples:');
          console.log('  npm run migrate:photos status');
          console.log('  npm run migrate:photos migrate');
          console.log('  npm run migrate:photos migrate-broken');
          console.log('  npm run migrate:photos migrate-batch 25');
          console.log('  npm run migrate:photos migrate-specific abc123,def456');
          console.log('  npm run migrate:photos dry-run');
          process.exit(1);
      }
      
      process.exit(0);
    } catch (error) {
      console.error('💥 Command failed:', error);
      process.exit(1);
    }
  }
  
  runCommand();
}