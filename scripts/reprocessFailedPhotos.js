// Script to reprocess failed photo URLs
// File: scripts/reprocessFailedPhotos.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from supabase/.env
function loadSupabaseEnv() {
  const envPath = path.join(process.cwd(), 'supabase', '.env');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  }
  
  return {};
}

async function reprocessFailedPhotos() {
  console.log('🔄 Starting photo reprocessing for failed URLs...\n');
  
  const envVars = loadSupabaseEnv();
  const supabaseUrl = envVars.SUPABASE_URL || envVars.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = envVars.SUPABASE_ANON_KEY || envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabaseKey = supabaseServiceKey || supabaseAnonKey;
  const keyType = supabaseServiceKey ? 'service role' : 'anon';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔐 Authentication type:', keyType);
  
  try {
    // Step 1: Get all restaurants with failed photo URLs (populated but failed when checked)
    console.log('📊 Finding restaurants with potentially failed photo URLs...');
    
    const { data: restaurantsWithPhotos, error } = await supabase
      .from('restaurants')
      .select('id, name, primary_photo_url, photos')
      .not('primary_photo_url', 'is', null)  // Has photo URL
      .not('photos', 'is', null)            // Has photo references
      .order('name');
    
    if (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`);
    }
    
    console.log(`✅ Found ${restaurantsWithPhotos.length} restaurants with photo URLs`);
    
    // Step 2: Clear existing photo URLs to force reprocessing
    console.log('🧹 Clearing existing photo URLs to force fresh processing...');
    
    const restaurantIds = restaurantsWithPhotos.map(r => r.id);
    
    const { error: clearError } = await supabase
      .from('restaurants')
      .update({
        primary_photo_url: null,
        photo_processed_at: null
      })
      .in('id', restaurantIds);
    
    if (clearError) {
      throw new Error(`Failed to clear photo URLs: ${clearError.message}`);
    }
    
    console.log(`✅ Cleared photo URLs for ${restaurantIds.length} restaurants`);
    
    // Step 3: Process in batches using the edge function
    console.log('\n🚀 Starting batch photo processing...');
    
    const batchSize = 50;
    const totalBatches = Math.ceil(restaurantIds.length / batchSize);
    let totalProcessed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    
    for (let i = 0; i < totalBatches; i++) {
      const startIdx = i * batchSize;
      const endIdx = Math.min(startIdx + batchSize, restaurantIds.length);
      const batchIds = restaurantIds.slice(startIdx, endIdx);
      
      console.log(`\n📦 Processing batch ${i + 1}/${totalBatches} (${batchIds.length} restaurants)...`);
      
      try {
        const { data, error } = await supabase.functions.invoke('fetch-restaurant-photos', {
          body: {
            restaurantIds: batchIds,
            batchSize: batchIds.length
          }
        });
        
        if (error) {
          console.error(`❌ Batch ${i + 1} failed:`, error.message);
          totalFailed += batchIds.length;
          continue;
        }
        
        if (data && data.results) {
          const { processed, failed, skipped } = data.results;
          totalProcessed += processed;
          totalFailed += failed;
          totalSkipped += skipped;
          
          console.log(`✅ Batch ${i + 1} completed:`);
          console.log(`   Processed: ${processed}`);
          console.log(`   Failed: ${failed}`);
          console.log(`   Skipped: ${skipped}`);
        }
        
        // Add delay between batches to be respectful to Google API
        if (i < totalBatches - 1) {
          console.log(`   ⏳ Waiting 3 seconds before next batch...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error) {
        console.error(`❌ Batch ${i + 1} error:`, error.message);
        totalFailed += batchIds.length;
      }
    }
    
    console.log('\n🎉 Photo reprocessing completed!');
    console.log('📊 Final Results:');
    console.log(`   Total restaurants: ${restaurantIds.length}`);
    console.log(`   Successfully processed: ${totalProcessed}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Skipped: ${totalSkipped}`);
    
    // Step 4: Run photo checker again to verify
    console.log('\n🔍 Running photo URL checker to verify results...');
    console.log('💡 Run this next: node scripts/checkPhotoUrls.js');
    
    const successRate = Math.round((totalProcessed / restaurantIds.length) * 100);
    console.log(`\n📈 Success rate: ${successRate}%`);
    
    if (successRate > 80) {
      console.log('🎉 Great success rate! Most photos should be working now.');
    } else if (successRate > 50) {
      console.log('⚠️  Moderate success rate. Some photos may still be problematic.');
    } else {
      console.log('🔧 Low success rate. Consider checking Google Places API quota and connectivity.');
    }
    
  } catch (error) {
    console.error('❌ Photo reprocessing failed:', error);
    throw error;
  }
}

reprocessFailedPhotos()
  .then(() => {
    console.log('\n✅ Photo reprocessing completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Photo reprocessing failed:', error);
    process.exit(1);
  });