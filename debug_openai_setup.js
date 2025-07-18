// Debug OpenAI API setup
console.log('🔍 OpenAI API Setup Check\n');

// Check environment variables
console.log('Environment Variables:');
console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('- OPENAI_API_KEY value:', process.env.OPENAI_API_KEY ? 
  `${process.env.OPENAI_API_KEY.substring(0, 8)}...${process.env.OPENAI_API_KEY.slice(-4)}` : 
  'NOT SET');
console.log('- Is placeholder?', process.env.OPENAI_API_KEY === 'placeholder-key');

// Check Vercel deployment environment
console.log('\nDeployment Environment:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VERCEL_ENV:', process.env.VERCEL_ENV);

// Test OpenAI API connection
async function testOpenAIConnection() {
  console.log('\n🧪 Testing OpenAI API Connection...');
  
  try {
    const response = await fetch('http://localhost:3000/api/ai/lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grade_level: "grade_1",
        subject: "math",
        topic: "numbers_and_counting",
        subtopic: "counting_to_10",
        learning_objective: "Students will be able to count objects from 1 to 10 accurately",
        estimated_duration: "15-20 minutes",
        target_language: "en"
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Response received');
      console.log('- Generation type:', result.metadata?.generation_type || 'unknown');
      console.log('- Content length:', result.lesson?.length || 0);
      
      if (result.metadata?.generation_type === 'ai') {
        console.log('🤖 SUCCESS: OpenAI API is working!');
      } else {
        console.log('⚠️  WARNING: Using fallback content, not OpenAI');
      }
    } else {
      console.log('❌ API call failed:', response.status);
      console.log('Error:', await response.text());
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

// Run the test
testOpenAIConnection().catch(console.error);

// Instructions for fixing
console.log('\n📋 To Enable OpenAI API:');
console.log('1. Get OpenAI API key from https://platform.openai.com/api-keys');
console.log('2. Add to Vercel environment variables:');
console.log('   - Go to Vercel dashboard → Settings → Environment Variables');
console.log('   - Add: OPENAI_API_KEY = sk-your-actual-key-here');
console.log('3. Redeploy your app');
console.log('4. Test again with this script');