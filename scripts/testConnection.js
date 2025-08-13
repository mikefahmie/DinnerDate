// Test Supabase connection and credentials
// File: scripts/testConnection.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from supabase/.env
function loadSupabaseEnv() {
  const envPath = path.join(process.cwd(), 'supabase', '.env');
  
  console.log('🔍 Looking for env file at:', envPath);
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Found supabase/.env file');
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
  } else {
    console.log('❌ supabase/.env file not found');
    return {};
  }
}

async function testConnection() {
  console.log('🧪 Testing Supabase connection...\n');
  
  const envVars = loadSupabaseEnv();
  
  // Show what environment variables we found
  console.log('📋 Environment variables found:');
  Object.keys(envVars).forEach(key => {
    if (key.includes('URL') || key.includes('KEY')) {
      const value = envVars[key];
      console.log(`   ${key}: ${value.substring(0, 30)}...`);
    }
  });
  
  const supabaseUrl = envVars.SUPABASE_URL || envVars.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = envVars.SUPABASE_ANON_KEY || envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Missing required Supabase credentials in supabase/.env');
    console.log('Expected variables: SUPABASE_URL and SUPABASE_ANON_KEY');
    console.log('Or: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }
  
  console.log('\n🔗 Creating Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test basic connection
    console.log('📊 Testing basic table access...');
    const { data, error, count } = await supabase
      .from('restaurants')
      .select('id, name', { count: 'exact' })
      .limit(3);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('💡 This might be a permissions issue or wrong credentials');
      return;
    }
    
    console.log(`✅ Successfully connected!`);
    console.log(`📈 Total restaurants in database: ${count}`);
    
    if (data && data.length > 0) {
      console.log('📝 Sample restaurants:');
      data.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.name}`);
      });
    }
    
    // Test photo URL query specifically
    console.log('\n📸 Testing photo URL query...');
    const { data: photoData, error: photoError } = await supabase
      .from('restaurants')
      .select('id, name, primary_photo_url')
      .not('primary_photo_url', 'is', null)
      .limit(3);
    
    if (photoError) {
      console.error('❌ Photo URL query failed:', photoError.message);
    } else {
      console.log(`✅ Found ${photoData?.length || 0} restaurants with photo URLs`);
      if (photoData && photoData.length > 0) {
        console.log('📋 Sample restaurants with photo URLs:');
        photoData.forEach((r, i) => {
          console.log(`   ${i + 1}. ${r.name}`);
          console.log(`      URL: ${r.primary_photo_url.substring(0, 60)}...`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection()
  .then(() => {
    console.log('\n🎉 Connection test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Connection test failed:', error);
    process.exit(1);
  });