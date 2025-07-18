#!/usr/bin/env node

/**
 * Vercel Deployment OpenAI API Test Script
 * 
 * This script tests the OpenAI API configuration on the Vercel deployment
 * Usage: node test_vercel_deployment.js <vercel-url>
 */

// Configuration
const args = process.argv.slice(2);
const VERCEL_URL = args[0] || process.env.VERCEL_URL;

if (!VERCEL_URL) {
  console.log('❌ Please provide a Vercel URL as an argument or set VERCEL_URL environment variable');
  console.log('Usage: node test_vercel_deployment.js <vercel-url>');
  console.log('Example: node test_vercel_deployment.js https://your-app.vercel.app');
  process.exit(1);
}

const FULL_URL = VERCEL_URL.startsWith('http') ? VERCEL_URL : `https://${VERCEL_URL}`;

console.log('🚀 Testing OpenAI API Configuration on Vercel Deployment');
console.log(`📍 Deployment URL: ${FULL_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testDeploymentEndpoints() {
  const results = {};

  // Test debug endpoint
  console.log('🔧 Testing OpenAI Debug Endpoint...');
  try {
    const response = await fetch(`${FULL_URL}/api/debug/openai`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    results.debug = data;
    
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
    
  } catch (error) {
    console.error('❌ OpenAI Debug Endpoint Error:', error.message);
    results.debug = { error: error.message };
  }

  // Test lesson generation endpoint
  console.log('\n📚 Testing Lesson Generation Endpoint...');
  try {
    const response = await fetch(`${FULL_URL}/api/ai/generate-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "Create a simple lesson about addition for grade 1 students. Include basic examples like 1+1=2.",
        subject: "math",
        grade: "grade_1",
        topic: "arithmetic",
        subtopic: "addition"
      }),
    });

    const data = await response.json();
    results.lesson = data;
    
    console.log('📊 Lesson Generation Results:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Content Length: ${data.content ? data.content.length : 0} characters`);
    
    if (data.content) {
      const isAIGenerated = !data.content.includes('This lesson was generated offline');
      console.log(`   AI Generated: ${isAIGenerated ? '✅ YES' : '❌ NO (fallback content)'}`);
      
      const preview = data.content.substring(0, 200);
      console.log(`   Content Preview: "${preview}${data.content.length > 200 ? '...' : ''}"`);
    }
    
    if (data.error) {
      console.log(`   ❌ Error: ${data.error}`);
    }
    
  } catch (error) {
    console.error('❌ Lesson Generation Endpoint Error:', error.message);
    results.lesson = { error: error.message };
  }

  // Test quiz generation endpoint
  console.log('\n🎯 Testing Quiz Generation Endpoint...');
  try {
    const response = await fetch(`${FULL_URL}/api/ai/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "Generate a simple quiz about basic addition for grade 1 students. Include 3 multiple choice questions.",
        subject: "math",
        grade: "grade_1",
        topic: "arithmetic",
        subtopic: "addition"
      }),
    });

    const data = await response.json();
    results.quiz = data;
    
    console.log('📊 Quiz Generation Results:');
    console.log(`   Status: ${response.status}`);
    
    if (data.quiz && data.quiz.questions) {
      console.log(`   Questions Generated: ${data.quiz.questions.length}`);
      console.log(`   AI Generated: ✅ YES`);
      
      if (data.quiz.questions.length > 0) {
        const firstQuestion = data.quiz.questions[0];
        console.log(`   Sample Question: "${firstQuestion.question}"`);
        console.log(`   Options: ${firstQuestion.options?.join(', ') || 'N/A'}`);
      }
    } else if (data.questions) {
      console.log(`   Questions Generated: ${data.questions.length}`);
      console.log(`   AI Generated: ✅ YES`);
    } else {
      console.log(`   AI Generated: ❌ NO (fallback content)`);
    }
    
    if (data.error) {
      console.log(`   ❌ Error: ${data.error}`);
    }
    
  } catch (error) {
    console.error('❌ Quiz Generation Endpoint Error:', error.message);
    results.quiz = { error: error.message };
  }

  return results;
}

async function generateDeploymentReport(results) {
  console.log('\n📋 VERCEL DEPLOYMENT TEST REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let overallStatus = 'UNKNOWN';
  let issues = [];
  let recommendations = [];
  
  // Check debug results
  if (results.debug && !results.debug.error) {
    if (results.debug.connectionTest === 'SUCCESS') {
      overallStatus = 'WORKING';
      console.log('✅ OpenAI API is fully functional in production');
    } else if (results.debug.connectionTest === 'FAILED') {
      overallStatus = 'FAILING';
      issues.push('OpenAI API key is set but connection failed');
      recommendations.push('Check if OpenAI API key is valid and has sufficient credits');
    } else {
      overallStatus = 'NOT_CONFIGURED';
      issues.push('OpenAI API key is not set in Vercel environment variables');
      recommendations.push('Add OPENAI_API_KEY environment variable in Vercel dashboard');
    }
  } else {
    overallStatus = 'ERROR';
    issues.push('Could not reach debug endpoint');
    recommendations.push('Check if the Vercel deployment is accessible');
  }
  
  // Check lesson generation
  if (results.lesson && !results.lesson.error) {
    const isAIGenerated = results.lesson.content && !results.lesson.content.includes('This lesson was generated offline');
    if (isAIGenerated) {
      console.log('✅ Lesson generation is working with AI');
    } else {
      console.log('⚠️ Lesson generation is using fallback content');
    }
  } else {
    console.log('❌ Lesson generation endpoint failed');
  }
  
  // Check quiz generation
  if (results.quiz && !results.quiz.error) {
    if ((results.quiz.quiz && results.quiz.quiz.questions) || results.quiz.questions) {
      console.log('✅ Quiz generation is working with AI');
    } else {
      console.log('⚠️ Quiz generation may be using fallback content');
    }
  } else {
    console.log('❌ Quiz generation endpoint failed');
  }
  
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
  
  // Environment-specific guidance
  console.log('\n🔧 VERCEL ENVIRONMENT SETUP:');
  if (overallStatus === 'NOT_CONFIGURED') {
    console.log('   1. Log into your Vercel dashboard');
    console.log('   2. Go to your project settings');
    console.log('   3. Click on "Environment Variables"');
    console.log('   4. Add new variable: OPENAI_API_KEY');
    console.log('   5. Set the value to your OpenAI API key (starts with sk-...)');
    console.log('   6. Apply to Production, Preview, and Development environments');
    console.log('   7. Redeploy your application');
  } else if (overallStatus === 'WORKING') {
    console.log('   ✅ Your environment variables are correctly configured');
    console.log('   ✅ AI lesson and quiz generation is working in production');
  } else if (overallStatus === 'FAILING') {
    console.log('   ⚠️ Environment variable is set but API calls are failing');
    console.log('   ⚠️ This usually indicates an invalid API key or insufficient credits');
  }
  
  console.log('\n🚀 NEXT STEPS:');
  if (overallStatus === 'WORKING') {
    console.log('   1. Your production deployment is ready!');
    console.log('   2. Students can access AI-generated lessons and quizzes');
    console.log('   3. Monitor API usage and costs in your OpenAI dashboard');
    console.log('   4. Consider setting up usage alerts to avoid unexpected charges');
  } else {
    console.log('   1. Fix the issues listed above');
    console.log('   2. Redeploy your application');
    console.log('   3. Run this test script again');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Main execution
async function main() {
  const results = await testDeploymentEndpoints();
  await generateDeploymentReport(results);
}

main().catch(console.error);