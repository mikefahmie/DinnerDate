// Comprehensive database debugging script
// File: scripts/debugDatabase.js

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

async function debugDatabase() {
  console.log('🔍 Comprehensive database debugging...\n');
  
  const envVars = loadSupabaseEnv();
  const supabaseUrl = envVars.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('📋 Supabase Project Info:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Project ID: ${supabaseUrl.split('//')[1].split('.')[0]}`);
  
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test 1: Check what tables we can access
    console.log('\n📊 Test 1: Checking accessible tables...');
    
    // Try to query the restaurants table with different approaches
    const tableTests = [
      { name: 'restaurants', table: 'restaurants' },
      { name: 'public.restaurants', table: 'public.restaurants' }
    ];
    
    for (const test of tableTests) {
      try {
        const { data, error, count } = await supabaseClient
          .from(test.table)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${test.name}: ${error.message}`);
        } else {
          console.log(`   ✅ ${test.name}: ${count} rows found`);
          if (data && data.length > 0) {
            console.log(`      Sample columns: ${Object.keys(data[0]).slice(0, 5).join(', ')}...`);
          }
        }
      } catch (err) {
        console.log(`   ❌ ${test.name}: ${err.message}`);
      }
    }
    
    // Test 2: Try raw SQL query to see if we can access the table differently
    console.log('\n📊 Test 2: Testing raw SQL access...');
    try {
      const { data, error } = await supabaseClient
        .rpc('custom_query', { query_text: 'SELECT COUNT(*) as count FROM restaurants' });
      
      if (error) {
        console.log(`   ❌ Raw SQL failed: ${error.message}`);
      } else {
        console.log(`   ✅ Raw SQL works: ${data} rows`);
      }
    } catch (err) {
      console.log(`   ❌ Raw SQL not available: ${err.message}`);
    }
    
    // Test 3: Check RLS policies
    console.log('\n📊 Test 3: Checking authentication and RLS...');
    
    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.log(`   ❌ Auth error: ${userError.message}`);
    } else if (user) {
      console.log(`   ✅ Authenticated as: ${user.email || user.id}`);
    } else {
      console.log(`   ⚠️  Using anonymous access (no user logged in)`);
      console.log(`   💡 This might be why you can't see data if RLS is enabled`);
    }
    
    // Test 4: Try to access other common tables
    console.log('\n📊 Test 4: Testing access to other tables...');
    
    const otherTables = ['auth.users', 'profiles', 'users'];
    
    for (const table of otherTables) {
      try {
        const { data, error, count } = await supabaseClient
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: ${count} rows accessible`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }
    
    // Test 5: Check if we can see the actual schema
    console.log('\n📊 Test 5: Trying to inspect database schema...');
    
    try {
      // This might work if we have proper permissions
      const { data, error } = await supabaseClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) {
        console.log(`   ❌ Schema access denied: ${error.message}`);
      } else {
        console.log(`   ✅ Found public tables: ${data.map(t => t.table_name).join(', ')}`);
      }
    } catch (err) {
      console.log(`   ❌ Schema inspection failed: ${err.message}`);
    }
    
    // Test 6: Suggest solutions
    console.log('\n💡 Possible solutions:');
    console.log('   1. Check if you\'re connecting to the right Supabase project');
    console.log('   2. Verify that the restaurants table has been created and populated');
    console.log('   3. Check Row Level Security (RLS) policies on the restaurants table');
    console.log('   4. Ensure your anon key has the right permissions');
    console.log('   5. Try running your populate-restaurants edge function first');
    
    console.log('\n🔧 To check in Supabase Dashboard:');
    console.log(`   1. Go to: ${supabaseUrl.replace('supabase.co', 'supabase.com')}`);
    console.log('   2. Navigate to: Table Editor → restaurants');
    console.log('   3. Check: Authentication → RLS Policies');
    console.log('   4. Verify: Edge Functions → populate-restaurants has run');
    
  } catch (error) {
    console.error('❌ Unexpected error during debugging:', error);
  }
}

debugDatabase()
  .then(() => {
    console.log('\n🎉 Database debugging completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database debugging failed:', error);
    process.exit(1);
  });