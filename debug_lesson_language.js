#!/usr/bin/env node

import { config } from 'dotenv';

config({ path: '.env.local' });

async function debugLessonLanguage() {
  console.log('🔍 Debugging lesson language generation...\n');

  const testRequest = {
    grade_level: 'Kindergarten',
    subject: 'Mathematics',
    topic: 'numbers_and_counting',
    subtopic: 'counting_to_10',
    learning_objective: 'Students will be able to count objects from 1 to 10 accurately',
    estimated_duration: '15-20 minutes',
    target_language: 'es' // Spanish
  };

  console.log('🧪 Testing lesson API with Spanish language:', testRequest);
  console.log('🔑 OpenAI API Key available:', !!process.env.OPENAI_API_KEY);
  console.log('🔑 OpenAI API Key type:', process.env.OPENAI_API_KEY === 'placeholder-key' ? 'PLACEHOLDER' : 'REAL');

  try {
    const response = await fetch('https://www.hagwon.app/api/ai/lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    });

    console.log(`📥 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    } else {
      const result = await response.json();
      console.log('✅ Success! Response received');
      console.log('📚 Lesson content length:', result.lesson?.length || 0);
      console.log('🌍 Target language in metadata:', result.metadata?.target_language);
      console.log('🤖 Generation type:', result.metadata?.generation_type);
      
      // Check if content is actually in Spanish
      const lessonPreview = result.lesson?.substring(0, 500);
      console.log('📝 Lesson preview (first 500 chars):', lessonPreview);
      
      // Look for Spanish words to verify language
      const spanishWords = ['matemáticas', 'lección', 'aprender', 'números', 'contar', 'estudiantes', 'hola', 'bienvenidos'];
      const hasSpanishWords = spanishWords.some(word => lessonPreview?.toLowerCase().includes(word));
      
      if (hasSpanishWords) {
        console.log('🎉 SUCCESS: Lesson content contains Spanish words!');
      } else {
        console.log('⚠️  WARNING: Lesson content appears to be in English, not Spanish');
        console.log('💡 This suggests AI generation failed and fallback content was used');
      }
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

debugLessonLanguage().catch(console.error);