const { execSync } = require('child_process');

// Test different lesson generation scenarios
const testCases = [
  // Math lessons
  {
    name: "Math - Counting to 20",
    data: {
      grade_level: "grade_1",
      subject: "math",
      topic: "numbers_and_counting",
      subtopic: "counting_to_20",
      learning_objective: "Students will be able to count objects from 11 to 20 accurately",
      estimated_duration: "15-20 minutes",
      target_language: "en"
    }
  },
  {
    name: "Math - Basic Addition",
    data: {
      grade_level: "grade_1",
      subject: "math",
      topic: "addition",
      subtopic: "basic_addition",
      learning_objective: "Students will be able to add two single-digit numbers with sums up to 10",
      estimated_duration: "20-25 minutes",
      target_language: "en"
    }
  },
  {
    name: "Math - Basic Shapes",
    data: {
      grade_level: "grade_1",
      subject: "math",
      topic: "shapes",
      subtopic: "basic_shapes",
      learning_objective: "Students will be able to identify and name basic geometric shapes",
      estimated_duration: "20-25 minutes",
      target_language: "en"
    }
  },
  {
    name: "Math - Spanish Counting",
    data: {
      grade_level: "grade_1",
      subject: "math",
      topic: "numbers_and_counting",
      subtopic: "counting_to_10",
      learning_objective: "Students will be able to count objects from 1 to 10 accurately",
      estimated_duration: "15-20 minutes",
      target_language: "es"
    }
  },
  {
    name: "Math - Korean Counting",
    data: {
      grade_level: "grade_1",
      subject: "math",
      topic: "numbers_and_counting",
      subtopic: "counting_to_10",
      learning_objective: "Students will be able to count objects from 1 to 10 accurately",
      estimated_duration: "15-20 minutes",
      target_language: "ko"
    }
  }
];

async function testLessonGeneration() {
  console.log('🧪 Testing Lesson Generation for Different Topics\n');
  
  for (const testCase of testCases) {
    console.log(`📚 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/ai/lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ SUCCESS: Generated lesson (${result.metadata?.generation_type || 'unknown'} type)`);
        
        // Show first 100 characters of lesson
        const preview = result.lesson.substring(0, 100).replace(/\n/g, ' ');
        console.log(`   Preview: ${preview}...`);
        
        // Show language info
        console.log(`   Language: ${result.metadata?.target_language || 'en'}`);
        console.log(`   Cache: ${result.metadata?.generation_type === 'ai' ? 'NEW' : 'FALLBACK'}`);
        
      } else {
        console.log(`❌ FAILED: ${response.status} - ${await response.text()}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log(''); // Empty line
  }
  
  console.log('🎯 Test completed! Check if all topics generate lessons successfully.');
}

// Run the test
testLessonGeneration().catch(console.error);