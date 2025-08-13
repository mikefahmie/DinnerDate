// Script to check primary photo URLs for 404 errors
// File: scripts/checkPhotoUrls.js
// This version uses service role key to bypass RLS

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

const envVars = loadSupabaseEnv();
const supabaseUrl = envVars.SUPABASE_URL || envVars.EXPO_PUBLIC_SUPABASE_URL;

// Try service role key first (for RLS bypass), fallback to anon key
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = envVars.SUPABASE_ANON_KEY || envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const keyType = supabaseServiceKey ? 'service role' : 'anon';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPhotoUrls() {
  console.log('🔍 Starting photo URL validation...');
  console.log('🔗 Using Supabase URL:', supabaseUrl.substring(0, 30) + '...');
  console.log('🔑 Using credentials from: supabase/.env');
  console.log('🔐 Authentication type:', keyType);
  
  try {
    // Get all restaurants with primary photo URLs
    console.log('📊 Fetching restaurants with photo URLs...');
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, short_formatted_address, primary_photo_url')
      .not('primary_photo_url', 'is', null)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`);
    }

    if (!restaurants || restaurants.length === 0) {
      console.log('❌ No restaurants found with photo URLs');
      return;
    }

    console.log(`📊 Found ${restaurants.length} restaurants with photo URLs`);
    console.log('🌐 Checking URL accessibility...\n');

    const results = [];
    const failedUrls = [];
    const stats = {
      total: restaurants.length,
      accessible: 0,
      failed: 0,
      errorTypes: {}
    };

    // Check each photo URL
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      const progress = Math.round(((i + 1) / restaurants.length) * 100);
      
      // Show progress
      const displayName = restaurant.name.substring(0, 25).padEnd(25, ' ');
      process.stdout.write(`\r⏳ Progress: ${progress}% (${i + 1}/${restaurants.length}) - ${displayName}`);

      try {
        const response = await fetch(restaurant.primary_photo_url, {
          method: 'HEAD', // Use HEAD to avoid downloading the entire image
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const result = {
          restaurant,
          status: response.status,
          isAccessible: response.ok,
          error: response.ok ? null : response.statusText
        };

        if (!response.ok) {
          failedUrls.push(restaurant);
          stats.failed++;
          stats.errorTypes[response.status] = (stats.errorTypes[response.status] || 0) + 1;
        } else {
          stats.accessible++;
        }

        results.push(result);

        // Add small delay to be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        const result = {
          restaurant,
          status: 0,
          isAccessible: false,
          error: error.message || 'Network error'
        };

        results.push(result);
        failedUrls.push(restaurant);
        stats.failed++;
        stats.errorTypes[0] = (stats.errorTypes[0] || 0) + 1;
      }
    }

    console.log('\n\n✅ URL checking completed!');
    
    // Print summary statistics
    console.log('\n📊 Summary Statistics:');
    console.log('================================');
    console.log(`Total URLs checked: ${stats.total}`);
    console.log(`✅ Accessible: ${stats.accessible} (${Math.round((stats.accessible / stats.total) * 100)}%)`);
    console.log(`❌ Failed: ${stats.failed} (${Math.round((stats.failed / stats.total) * 100)}%)`);
    
    if (stats.failed > 0) {
      console.log('\n🔍 Error breakdown:');
      Object.entries(stats.errorTypes).forEach(([status, count]) => {
        const statusText = status === '0' ? 'Network Error' : 
                          status === '404' ? 'Not Found' :
                          status === '403' ? 'Forbidden' :
                          status === '500' ? 'Server Error' :
                          `HTTP ${status}`;
        console.log(`   ${statusText}: ${count} URLs`);
      });
    }

    // Generate failed URLs report
    if (failedUrls.length > 0) {
      await generateFailedUrlsReport(failedUrls, stats);
    } else {
      console.log('\n🎉 All photo URLs are accessible!');
    }

    return {
      stats,
      failedUrls,
      results
    };

  } catch (error) {
    console.error('❌ Photo URL checking failed:', error);
    throw error;
  }
}

async function generateFailedUrlsReport(failedUrls, stats) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `failed_photo_urls_${timestamp}.txt`;
  
  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filepath = path.join(reportsDir, filename);

  let content = '';
  content += '=====================================\n';
  content += '        FAILED PHOTO URLS REPORT\n';
  content += '=====================================\n\n';
  content += `Generated: ${new Date().toISOString()}\n`;
  content += `Total restaurants checked: ${stats.total}\n`;
  content += `Failed URLs: ${stats.failed}\n`;
  content += `Success rate: ${Math.round((stats.accessible / stats.total) * 100)}%\n\n`;

  content += 'ERROR BREAKDOWN:\n';
  content += '----------------\n';
  Object.entries(stats.errorTypes).forEach(([status, count]) => {
    const statusText = status === '0' ? 'Network Error' : 
                      status === '404' ? 'Not Found' :
                      status === '403' ? 'Forbidden' :
                      status === '500' ? 'Server Error' :
                      `HTTP ${status}`;
    content += `${statusText}: ${count} URLs\n`;
  });

  content += '\n=====================================\n';
  content += '          FAILED RESTAURANTS\n';
  content += '=====================================\n\n';

  failedUrls.forEach((restaurant, index) => {
    content += `${index + 1}. ${restaurant.name}\n`;
    content += `   Address: ${restaurant.short_formatted_address || 'N/A'}\n`;
    content += `   Photo URL: ${restaurant.primary_photo_url}\n`;
    content += `   Restaurant ID: ${restaurant.id}\n`;
    content += '\n';
  });

  content += '\n=====================================\n';
  content += '      BULK PROCESSING COMMANDS\n';
  content += '=====================================\n\n';

  content += 'SQL to clear failed photo URLs from database:\n';
  content += 'UPDATE restaurants SET primary_photo_url = NULL, photo_processed_at = NULL\nWHERE id IN (\n';
  const idList = failedUrls.map(r => `  '${r.id}'`).join(',\n');
  content += idList + '\n';
  content += ');\n\n';

  content += 'JavaScript array for reprocessing:\n';
  content += 'const failedRestaurantIds = [\n';
  const jsIdList = failedUrls.map(r => `  '${r.id}'`).join(',\n');
  content += jsIdList + '\n';
  content += '];\n';

  fs.writeFileSync(filepath, content);
  
  console.log(`\n📄 Failed URLs report saved to: ${filepath}`);
  console.log(`   You can review the ${stats.failed} failed restaurants and their details.`);
}

// CLI execution
checkPhotoUrls()
  .then(() => {
    console.log('\n🎉 Photo URL validation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Photo URL validation failed:', error);
    process.exit(1);
  });