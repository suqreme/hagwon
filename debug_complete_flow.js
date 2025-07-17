#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fetch from 'node-fetch';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simulate the exact flow that happens when a user tries to access a lesson
async function debugCompleteFlow() {
  console.log('🔄 Debugging complete lesson access flow...\n');

  // Step 1: Get a test user
  console.log('1️⃣ Getting test user...');
  const { data: users, error: userError } = await supabase
    .from('user_profiles')
    .select('id, email')
    .limit(1);
  
  if (userError || !users || users.length === 0) {
    console.log('❌ No users found:', userError);
    return;
  }
  
  const testUser = users[0];
  console.log(`✅ Using test user: ${testUser.email} (${testUser.id})`);

  // Step 2: Test subscription check (the part we fixed)
  console.log('\n2️⃣ Testing subscription access check...');
  try {
    // Simulate the checkLessonAccess function
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', testUser.id)
      .maybeSingle();
    
    let subscription;
    if (data && !error) {
      subscription = {
        plan: data.plan || 'free',
        status: data.status || 'active',
        features: {
          dailyLessonLimit: data.plan === 'supporter' || data.plan === 'sponsor' || data.plan === 'hardship' ? null : 3
        }
      };
    } else {
      subscription = {
        plan: 'free',
        status: 'active',
        features: {
          dailyLessonLimit: 3
        }
      };
    }
    
    console.log('✅ Subscription check result:', subscription);
    
    if (subscription.status !== 'active' && subscription.plan !== 'free') {
      console.log('❌ Would be denied: Subscription not active');
      return;
    }
    
    console.log('✅ Access would be granted');

  } catch (error) {
    console.log('❌ Subscription check error:', error.message);
    return;
  }

  // Step 3: Test curriculum loading
  console.log('\n3️⃣ Testing curriculum loading...');
  try {
    const curriculumResponse = await fetch('http://localhost:3000/curriculum/subjects/math/grade_1.json');
    if (!curriculumResponse.ok) {
      console.log('❌ Curriculum loading failed:', curriculumResponse.status);
      console.log('💡 This could be why the lesson page fails');
    } else {
      const curriculumData = await curriculumResponse.json();
      console.log('✅ Curriculum loaded successfully');
      
      // Check if the subtopic exists
      const subtopicData = curriculumData.topics?.addition?.subtopics?.basic_addition;
      if (subtopicData) {
        console.log('✅ Subtopic found:', subtopicData.title);
      } else {
        console.log('❌ Subtopic not found in curriculum');
      }
    }
  } catch (error) {
    console.log('❌ Curriculum loading error:', error.message);
    console.log('💡 The development server may not be running');
  }

  // Step 4: Test lesson API call
  console.log('\n4️⃣ Testing lesson API call...');
  const lessonRequest = {
    grade_level: 'grade 1', // Note: This is what the frontend sends after replace('_', ' ')
    subject: 'Mathematics',
    topic: 'addition',
    subtopic: 'basic_addition',
    learning_objective: 'Students will be able to add two single-digit numbers with sums up to 10',
    estimated_duration: '15-20 minutes'
  };

  try {
    console.log('📤 Making lesson API request:', lessonRequest);
    const response = await fetch('http://localhost:3000/api/ai/lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonRequest)
    });

    console.log(`📥 Lesson API response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Lesson API error body:', errorText);
      
      if (response.status === 400) {
        console.log('\n🎯 Found the 400 error!');
        console.log('💡 Possible causes:');
        console.log('   - Missing required fields');
        console.log('   - Wrong field format (grade_level vs grade)');
        console.log('   - Server not running');
      }
    } else {
      const result = await response.json();
      console.log('✅ Lesson generated successfully!');
    }

  } catch (error) {
    console.log('❌ Lesson API error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Development server is not running - start with: npm run dev');
    }
  }

  console.log('\n📋 Summary:');
  console.log('1. If subscription check fails -> fix checkLessonAccess await (DONE)');
  console.log('2. If curriculum loading fails -> check file paths and server');
  console.log('3. If lesson API fails -> check field names and server');
  console.log('4. If 400 error persists -> check request payload format');
}

debugCompleteFlow().catch(console.error);