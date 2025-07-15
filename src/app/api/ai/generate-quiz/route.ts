import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, subject, grade, topic, subtopic } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      // Fallback quiz when API key is not available
      const fallbackQuiz = generateFallbackQuiz(subject, grade, topic, subtopic);
      return NextResponse.json({ quiz: fallbackQuiz });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational assessment creator. Generate age-appropriate quiz questions in valid JSON format. Always return proper JSON with no additional text or formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the JSON response
    let quiz;
    try {
      quiz = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate quiz structure
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Invalid quiz structure');
    }

    return NextResponse.json({ quiz });

  } catch (error) {
    console.error('AI quiz generation error:', error);
    
    // Return fallback quiz on error
    const { subject, grade, topic, subtopic } = await request.json();
    const fallbackQuiz = generateFallbackQuiz(subject, grade, topic, subtopic);
    
    return NextResponse.json({ quiz: fallbackQuiz });
  }
}

function generateFallbackQuiz(subject: string, grade: string, topic: string, subtopic: string) {
  const subtopicDisplay = subtopic.replace('_', ' ');
  const topicDisplay = topic.replace('_', ' ');

  const mathQuizzes = {
    'counting_to_10': {
      questions: [
        {
          id: 1,
          question: "How many fingers do you have on one hand?",
          type: "multiple_choice",
          options: ["4", "5", "6", "7"],
          correct_answer: 1,
          explanation: "You have 5 fingers on one hand! Great counting!",
          points: 1,
          difficulty: "beginner"
        },
        {
          id: 2,
          question: "What comes after 7?",
          type: "multiple_choice",
          options: ["6", "8", "9", "10"],
          correct_answer: 1,
          explanation: "After 7 comes 8. You're doing great with counting!",
          points: 1,
          difficulty: "beginner"
        },
        {
          id: 3,
          question: "Count the stars: ⭐⭐⭐. How many are there?",
          type: "multiple_choice",
          options: ["2", "3", "4", "5"],
          correct_answer: 1,
          explanation: "There are 3 stars! You counted perfectly!",
          points: 1,
          difficulty: "beginner"
        }
      ],
      total_points: 3,
      passing_score: 2,
      time_estimate: "3-5 minutes"
    },
    'basic_addition': {
      questions: [
        {
          id: 1,
          question: "What is 2 + 3?",
          type: "multiple_choice",
          options: ["4", "5", "6", "7"],
          correct_answer: 1,
          explanation: "2 + 3 = 5. You can count 2 objects, then add 3 more to get 5!",
          points: 1,
          difficulty: "beginner"
        },
        {
          id: 2,
          question: "If you have 1 apple and someone gives you 4 more, how many apples do you have?",
          type: "multiple_choice",
          options: ["3", "4", "5", "6"],
          correct_answer: 2,
          explanation: "1 + 4 = 5 apples! That's a lot of apples!",
          points: 1,
          difficulty: "beginner"
        },
        {
          id: 3,
          question: "What is 0 + 6?",
          type: "multiple_choice",
          options: ["0", "6", "7", "8"],
          correct_answer: 1,
          explanation: "When you add 0 to any number, you get the same number! 0 + 6 = 6",
          points: 1,
          difficulty: "beginner"
        }
      ],
      total_points: 3,
      passing_score: 2,
      time_estimate: "4-6 minutes"
    }
  };

  const englishQuizzes = {
    'letter_sounds': {
      questions: [
        {
          id: 1,
          question: "What sound does the letter 'A' make?",
          type: "multiple_choice",
          options: ["ah", "eh", "oh", "uh"],
          correct_answer: 0,
          explanation: "The letter 'A' makes the 'ah' sound, like in 'apple'!",
          points: 1,
          difficulty: "beginner"
        },
        {
          id: 2,
          question: "Which letter makes the 'mmm' sound?",
          type: "multiple_choice",
          options: ["N", "M", "B", "P"],
          correct_answer: 1,
          explanation: "The letter 'M' makes the 'mmm' sound, like in 'mom'!",
          points: 1,
          difficulty: "beginner"
        },
        {
          id: 3,
          question: "What sound does 'S' make?",
          type: "multiple_choice",
          options: ["zzz", "sss", "ttt", "fff"],
          correct_answer: 1,
          explanation: "The letter 'S' makes the 'sss' sound, like a snake!",
          points: 1,
          difficulty: "beginner"
        }
      ],
      total_points: 3,
      passing_score: 2,
      time_estimate: "3-5 minutes"
    },
    'sight_words': {
      questions: [
        {
          id: 1,
          question: "Which of these is a sight word you should know?",
          type: "multiple_choice",
          options: ["elephant", "the", "butterfly", "enormous"],
          correct_answer: 1,
          explanation: "'The' is a sight word! You see it in almost every sentence.",
          points: 1,
          difficulty: "beginner"
        },
        {
          id: 2,
          question: "Complete this sentence: 'I ___ a dog.'",
          type: "multiple_choice",
          options: ["see", "elephant", "purple", "jumping"],
          correct_answer: 0,
          explanation: "'See' is the right word! 'I see a dog' makes sense.",
          points: 1,
          difficulty: "beginner"
        },
        {
          id: 3,
          question: "Which word appears most often in books?",
          type: "multiple_choice",
          options: ["cat", "and", "house", "blue"],
          correct_answer: 1,
          explanation: "'And' is one of the most common words in English!",
          points: 1,
          difficulty: "beginner"
        }
      ],
      total_points: 3,
      passing_score: 2,
      time_estimate: "4-6 minutes"
    }
  };

  // Get subject-specific quiz
  const quizzes = subject === 'math' ? mathQuizzes : englishQuizzes;
  const quiz = quizzes[subtopic as keyof typeof quizzes];

  if (quiz) {
    return quiz;
  }

  // Generic fallback
  return {
    questions: [
      {
        id: 1,
        question: `What did you learn about ${subtopicDisplay}?`,
        type: "multiple_choice",
        options: ["Important concepts", "Nothing new", "Just basics", "Too difficult"],
        correct_answer: 0,
        explanation: `Great! You learned important concepts about ${subtopicDisplay}!`,
        points: 1,
        difficulty: "beginner"
      },
      {
        id: 2,
        question: `How do you feel about ${subtopicDisplay} now?`,
        type: "multiple_choice",
        options: ["I understand it better", "Still confused", "Need more practice", "It's too hard"],
        correct_answer: 0,
        explanation: `Excellent! Understanding ${subtopicDisplay} better is the goal!`,
        points: 1,
        difficulty: "beginner"
      },
      {
        id: 3,
        question: `What would you like to do next with ${subtopicDisplay}?`,
        type: "multiple_choice",
        options: ["Practice more", "Move to next topic", "Review again", "Take a break"],
        correct_answer: 0,
        explanation: `Practice makes perfect! The more you practice ${subtopicDisplay}, the better you'll get!`,
        points: 1,
        difficulty: "beginner"
      }
    ],
    total_points: 3,
    passing_score: 2,
    time_estimate: "3-5 minutes"
  };
}