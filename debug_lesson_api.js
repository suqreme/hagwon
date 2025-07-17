#!/usr/bin/env node

import { config } from 'dotenv';

config({ path: '.env.local' });

async function debugLessonAPI() {
  console.log('🔍 Debugging lesson API call...\n');

  // Simulate the exact request the frontend is making
  const lessonRequest = {
    grade_level: 'grade_1',
    subject: 'math',
    topic: 'basic_addition',
    subtopic: 'single_digit_addition',
    learning_objective: 'Learn to add single digit numbers',
    estimated_duration: '5-10 minutes'
  };

  console.log('📤 Making request to /api/ai/lesson with:', lessonRequest);

  try {
    // Test with localhost:3000 since that's what the API is hardcoded to use
    const response = await fetch('http://localhost:3000/api/ai/lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonRequest)
    });

    console.log(`📥 Response status: ${response.status}`);
    console.log(`📥 Response status text: ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response body:', errorText);
      
      if (response.status === 400) {
        console.log('\n🎯 This is the 400 error you\'re seeing!');
        console.log('💡 Most likely causes:');
        console.log('1. Missing required fields in the request');
        console.log('2. Invalid JSON in the request body');
        console.log('3. The API endpoint is expecting different field names');
      }
    } else {
      const result = await response.json();
      console.log('✅ Success! Response:', result);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - the development server is not running');
      console.log('💡 This might explain the 400 error if the app is trying to call localhost:3000');
      console.log('🔧 Try: npm run dev to start the development server');
    } else {
      console.log('❌ Network error:', error.message);
    }
  }

  // Also test the prompt loading part separately
  console.log('\n🧪 Testing prompt loading...');
  try {
    const promptResponse = await fetch('http://localhost:3000/api/prompts/ai-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variables: {
          grade_level: 'grade_1',
          subject: 'math',
          topic: 'basic_addition',
          subtopic: 'single_digit_addition',
          learning_objective: 'Learn to add single digit numbers',
          previous_performance: 'No previous data',
          estimated_duration: '5-10 minutes'
        }
      })
    });

    console.log(`📥 Prompt response status: ${promptResponse.status}`);
    
    if (!promptResponse.ok) {
      const errorText = await promptResponse.text();
      console.log('❌ Prompt error:', errorText);
    } else {
      console.log('✅ Prompt loading works!');
    }

  } catch (error) {
    console.log('❌ Prompt test error:', error.message);
  }
}

debugLessonAPI().catch(console.error);