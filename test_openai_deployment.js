#!/usr/bin/env node

/**
 * OpenAI API Deployment Test Script
 * 
 * This script tests the OpenAI API configuration in the deployed environment
 * by hitting the debug endpoint and lesson generation endpoint.
 */

// Using Node.js built-in fetch (available in Node 18+)
// If not available, install node-fetch: npm install node-fetch

// Configuration
const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000';
const FULL_URL = BASE_URL.startsWith('http') ? BASE_URL : `https://${BASE_URL}`;

console.log('🔍 Testing OpenAI API Configuration');
console.log(`📍 Base URL: ${FULL_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testOpenAIDebugEndpoint() {
  console.log('🔧 Testing OpenAI Debug Endpoint...');
  
  try {
    const response = await fetch(`${FULL_URL}/api/debug/openai`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    console.log('📊 OpenAI Debug Results:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Has API Key: ${data.hasApiKey ? '✅ YES' : '❌ NO'}`);
    console.log(`   API Key Preview: ${data.apiKeyPreview}`);
    console.log(`   Is Placeholder: ${data.isPlaceholder ? '⚠️ YES' : '✅ NO'}`);
    console.log(`   Environment: ${data.environment}`);
    console.log(`   Vercel Environment: ${data.vercelEnv || 'N/A'}`);
    console.log(`   Connection Test: ${data.connectionTest}`);
    
    if (data.connectionTest === 'SUCCESS') {
      console.log(`   ✅ OpenAI Response: "${data.testResponse}"`);
    } else if (data.connectionTest === 'FAILED') {
      console.log(`   ❌ OpenAI Error: ${data.error}`);
    }
    
    console.log(`   💡 Recommendation: ${data.recommendation}`);
    
    return data;
    
  } catch (error) {
    console.error('❌ OpenAI Debug Endpoint Error:', error.message);
    return null;
  }
}

async function testLessonGenerationEndpoint() {
  console.log('\n📚 Testing Lesson Generation Endpoint...');
  
  const testPayload = {
    prompt: "Create a simple lesson about addition for grade 1 students. Include basic examples like 1+1=2.",
    subject: "math",
    grade: "grade_1",
    topic: "arithmetic",
    subtopic: "addition"
  };

  try {
    const response = await fetch(`${FULL_URL}/api/ai/generate-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();
    
    console.log('📊 Lesson Generation Results:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Content Length: ${data.content ? data.content.length : 0} characters`);
    
    if (data.content) {
      const isAIGenerated = !data.content.includes('This lesson was generated offline');
      console.log(`   AI Generated: ${isAIGenerated ? '✅ YES' : '❌ NO (fallback content)'}`);
      
      // Show first 200 characters of content
      const preview = data.content.substring(0, 200);
      console.log(`   Content Preview: "${preview}${data.content.length > 200 ? '...' : ''}"`);
    }
    
    if (data.error) {
      console.log(`   ❌ Error: ${data.error}`);
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Lesson Generation Endpoint Error:', error.message);
    return null;
  }
}

async function testQuizGenerationEndpoint() {
  console.log('\n🎯 Testing Quiz Generation Endpoint...');
  
  const testPayload = {
    prompt: "Generate a simple quiz about basic addition for grade 1 students. Include 3 multiple choice questions.",
    subject: "math",
    grade: "grade_1",
    topic: "arithmetic",
    subtopic: "addition"
  };

  try {
    const response = await fetch(`${FULL_URL}/api/ai/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();
    
    console.log('📊 Quiz Generation Results:');
    console.log(`   Status: ${response.status}`);
    
    if (data.quiz && data.quiz.questions) {
      console.log(`   Questions Generated: ${data.quiz.questions.length}`);
      console.log(`   AI Generated: ✅ YES`);
      
      // Show first question as example
      if (data.quiz.questions.length > 0) {
        const firstQuestion = data.quiz.questions[0];
        console.log(`   Sample Question: "${firstQuestion.question}"`);
        console.log(`   Options: ${firstQuestion.options?.join(', ') || 'N/A'}`);
      }
    } else if (data.questions) {
      console.log(`   Questions Generated: ${data.questions.length}`);
      console.log(`   AI Generated: ✅ YES`);
      
      // Show first question as example
      if (data.questions.length > 0) {
        const firstQuestion = data.questions[0];
        console.log(`   Sample Question: "${firstQuestion.question}"`);
        console.log(`   Options: ${firstQuestion.options?.join(', ') || 'N/A'}`);
      }
    } else if (data.content) {
      console.log(`   Content Length: ${data.content.length} characters`);
      console.log(`   AI Generated: ❌ NO (fallback content)`);
    }
    
    if (data.error) {
      console.log(`   ❌ Error: ${data.error}`);
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Quiz Generation Endpoint Error:', error.message);
    
    // Try to make a simple request to see if the endpoint is accessible
    try {
      const simpleResponse = await fetch(`${FULL_URL}/api/ai/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "Simple test",
          subject: "math",
          grade: "grade_1",
          topic: "arithmetic",
          subtopic: "basic_addition"
        }),
      });
      
      const responseText = await simpleResponse.text();
      console.log(`   Response Status: ${simpleResponse.status}`);
      console.log(`   Response Text: ${responseText.substring(0, 200)}...`);
      
    } catch (simpleError) {
      console.error('❌ Even simple quiz request failed:', simpleError.message);
    }
    
    return null;
  }
}

async function generateTestReport(debugData, lessonData, quizData) {
  console.log('\n📋 COMPREHENSIVE TEST REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Overall Status
  let overallStatus = 'UNKNOWN';
  let issues = [];
  let recommendations = [];
  
  if (debugData) {
    if (debugData.connectionTest === 'SUCCESS') {
      overallStatus = 'WORKING';
      console.log('✅ OpenAI API is fully functional');
    } else if (debugData.connectionTest === 'FAILED') {
      overallStatus = 'FAILING';
      issues.push('OpenAI API key is set but connection failed');
      recommendations.push('Check if OpenAI API key is valid and has sufficient credits');
    } else {
      overallStatus = 'NOT_CONFIGURED';
      issues.push('OpenAI API key is not set or is using placeholder');
      recommendations.push('Set OPENAI_API_KEY environment variable in Vercel');
    }
  } else {
    overallStatus = 'ERROR';
    issues.push('Could not reach debug endpoint');
    recommendations.push('Check if the application is deployed and accessible');
  }
  
  // Lesson Generation Status
  if (lessonData) {
    const isAIGenerated = lessonData.content && !lessonData.content.includes('This lesson was generated offline');
    if (isAIGenerated) {
      console.log('✅ Lesson generation is working with AI');
    } else {
      console.log('⚠️ Lesson generation is using fallback content');
    }
  }
  
  // Quiz Generation Status
  if (quizData) {
    if ((quizData.quiz && quizData.quiz.questions && quizData.quiz.questions.length > 0) || 
        (quizData.questions && quizData.questions.length > 0)) {
      console.log('✅ Quiz generation is working with AI');
    } else {
      console.log('⚠️ Quiz generation may be using fallback content');
    }
  }
  
  // Summary
  console.log(`\n🎯 OVERALL STATUS: ${overallStatus}`);
  
  if (issues.length > 0) {
    console.log('\n❌ ISSUES FOUND:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  // Next Steps
  console.log('\n🚀 NEXT STEPS:');
  if (overallStatus === 'WORKING') {
    console.log('   1. Your OpenAI integration is working correctly!');
    console.log('   2. Students can now receive AI-generated lessons and quizzes');
    console.log('   3. Monitor usage and API costs in your OpenAI dashboard');
  } else if (overallStatus === 'NOT_CONFIGURED') {
    console.log('   1. Log into your Vercel dashboard');
    console.log('   2. Go to your project settings > Environment Variables');
    console.log('   3. Add OPENAI_API_KEY with your actual OpenAI API key');
    console.log('   4. Redeploy your application');
    console.log('   5. Run this test script again');
  } else if (overallStatus === 'FAILING') {
    console.log('   1. Check your OpenAI API key is valid');
    console.log('   2. Verify your OpenAI account has sufficient credits');
    console.log('   3. Check OpenAI API status at status.openai.com');
    console.log('   4. Try generating a new API key if needed');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Main execution
async function main() {
  const debugData = await testOpenAIDebugEndpoint();
  const lessonData = await testLessonGenerationEndpoint();
  const quizData = await testQuizGenerationEndpoint();
  
  await generateTestReport(debugData, lessonData, quizData);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node test_openai_deployment.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --url <url>    Test specific URL (default: http://localhost:3000)');
  console.log('');
  console.log('Environment Variables:');
  console.log('  VERCEL_URL     Vercel deployment URL (automatically set in Vercel)');
  console.log('');
  console.log('Examples:');
  console.log('  node test_openai_deployment.js');
  console.log('  node test_openai_deployment.js --url https://your-app.vercel.app');
  console.log('  VERCEL_URL=your-app.vercel.app node test_openai_deployment.js');
  process.exit(0);
}

// Override URL if provided
const urlIndex = args.indexOf('--url');
if (urlIndex !== -1 && args[urlIndex + 1]) {
  process.env.VERCEL_URL = args[urlIndex + 1];
}

main().catch(console.error);