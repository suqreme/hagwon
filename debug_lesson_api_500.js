#!/usr/bin/env node

import { config } from 'dotenv';

config({ path: '.env.local' });

async function debugLessonAPI500() {
  console.log('🔍 Debugging lesson API 500 error...\n');

  const testRequest = {
    grade_level: 'Kindergarten',
    subject: 'Mathematics',
    topic: 'numbers_and_counting',
    subtopic: 'counting_to_10',
    learning_objective: 'Students will be able to count objects from 1 to 10 accurately',
    estimated_duration: '15-20 minutes',
    target_language: 'en'
  };

  console.log('🧪 Testing lesson API with:', testRequest);

  try {
    const response = await fetch('https://www.hagwon.app/api/ai/lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    });

    console.log(`📥 Response status: ${response.status}`);
    console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response body:', errorText);
      
      // Check if it's a specific error
      if (response.status === 500) {
        console.log('\n🎯 This is a 500 Internal Server Error!');
        console.log('💡 Most likely causes:');
        console.log('1. Database table "cached_lessons" doesn\'t exist in production');
        console.log('2. Import error for lessonCacheService');
        console.log('3. Missing environment variables');
        console.log('4. Supabase connection issues');
      }
    } else {
      const result = await response.json();
      console.log('✅ Success! Response:', result);
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  // Test if we can access the production database
  console.log('\n🗄️ Testing production database access...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test if cached_lessons table exists
    const { data, error } = await supabase
      .from('cached_lessons')
      .select('id')
      .limit(1);

    if (error) {
      console.log('❌ Database error:', error.message);
      
      if (error.message.includes('cached_lessons')) {
        console.log('💡 The cached_lessons table doesn\'t exist in production!');
        console.log('🔧 Solution: Run the SQL migration in your Supabase dashboard');
      }
    } else {
      console.log('✅ Database table exists and is accessible');
    }

  } catch (dbError) {
    console.log('❌ Database connection error:', dbError.message);
  }
}

debugLessonAPI500().catch(console.error);