#!/usr/bin/env node

import { config } from 'dotenv';

config({ path: '.env.local' });

async function debugLessonGeneration() {
  console.log('🔍 Debugging AI lesson generation...\n');

  // Test the lesson API call that the frontend makes
  const lessonRequest = {
    grade_level: 'Kindergarten',
    subject: 'Mathematics', 
    topic: 'numbers_and_counting',
    subtopic: 'counting_to_10',
    learning_objective: 'Students will be able to count objects from 1 to 10 accurately',
    estimated_duration: '15-20 minutes'
  };

  console.log('📤 Testing lesson API with:', lessonRequest);
  console.log('🔑 OpenAI API Key configured:', !!process.env.OPENAI_API_KEY);
  console.log('🔑 OpenAI API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

  try {
    // Test 1: Check if prompts API works
    console.log('\n1️⃣ Testing prompts API...');
    const promptResponse = await fetch('http://localhost:3000/api/prompts/ai-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variables: {
          grade_level: 'Kindergarten',
          subject: 'Mathematics',
          topic: 'numbers_and_counting',
          subtopic: 'counting_to_10',
          learning_objective: 'Students will be able to count objects from 1 to 10 accurately',
          previous_performance: 'No previous data',
          estimated_duration: '15-20 minutes'
        }
      })
    });

    if (!promptResponse.ok) {
      console.log(`❌ Prompts API failed: ${promptResponse.status} ${promptResponse.statusText}`);
      const errorText = await promptResponse.text();
      console.log('Error details:', errorText);
    } else {
      const { prompt } = await promptResponse.json();
      console.log('✅ Prompts API works! Prompt length:', prompt.length);
      console.log('📝 Prompt preview:', prompt.substring(0, 200) + '...');
    }

    // Test 2: Test the full lesson API
    console.log('\n2️⃣ Testing full lesson API...');
    const lessonResponse = await fetch('http://localhost:3000/api/ai/lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonRequest)
    });

    console.log(`📥 Lesson API response: ${lessonResponse.status} ${lessonResponse.statusText}`);
    
    if (!lessonResponse.ok) {
      const errorText = await lessonResponse.text();
      console.log('❌ Lesson API error:', errorText);
    } else {
      const result = await lessonResponse.json();
      console.log('✅ Lesson API works!');
      console.log('📚 Lesson content length:', result.lesson?.length || 0);
      console.log('📝 Lesson preview:', result.lesson?.substring(0, 300) + '...');
      
      if (result.lesson?.includes('counting_to_10 Lesson')) {
        console.log('⚠️  This looks like fallback content - AI generation failed');
      } else {
        console.log('🎉 This looks like real AI-generated content!');
      }
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Development server not running. Start with: npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

debugLessonGeneration().catch(console.error);