import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

function createFallbackQuiz(subject: string, topic: string, subtopic: string, grade_level: string) {
  // Create a simple quiz based on the subject and topic
  const questions = []
  
  if (subject === 'math') {
    if (topic.includes('addition') || subtopic.includes('addition')) {
      questions.push({
        id: 1,
        question: "What is 5 + 3?",
        type: "multiple_choice",
        options: ["6", "7", "8", "9"],
        correct_answer: 2,
        explanation: "5 + 3 = 8. When we add 5 and 3, we get 8.",
        points: 1,
        difficulty: grade_level
      })
      questions.push({
        id: 2,
        question: "If you have 4 apples and someone gives you 2 more, how many apples do you have?",
        type: "multiple_choice",
        options: ["5", "6", "7", "8"],
        correct_answer: 1,
        explanation: "4 + 2 = 6 apples total.",
        points: 1,
        difficulty: grade_level
      })
    } else {
      questions.push({
        id: 1,
        question: `What did you learn about ${subtopic} in ${topic}?`,
        type: "multiple_choice",
        options: ["I understand it well", "I need more practice", "I'm confused", "I want to review"],
        correct_answer: 0,
        explanation: "Great! Understanding the concept is important.",
        points: 1,
        difficulty: grade_level
      })
    }
  } else if (subject === 'english') {
    if (topic.includes('reading') || subtopic.includes('phonics')) {
      questions.push({
        id: 1,
        question: "Which word rhymes with 'cat'?",
        type: "multiple_choice",
        options: ["dog", "hat", "run", "big"],
        correct_answer: 1,
        explanation: "Hat rhymes with cat because they both end with the 'at' sound.",
        points: 1,
        difficulty: grade_level
      })
    } else {
      questions.push({
        id: 1,
        question: `What did you learn about ${subtopic}?`,
        type: "multiple_choice",
        options: ["I understand it", "I need practice", "I'm confused", "I want to review"],
        correct_answer: 0,
        explanation: "Understanding the lesson is the first step to learning!",
        points: 1,
        difficulty: grade_level
      })
    }
  } else {
    questions.push({
      id: 1,
      question: `How well do you understand ${subtopic}?`,
      type: "multiple_choice",
      options: ["Very well", "Pretty well", "Need more help", "Confused"],
      correct_answer: 0,
      explanation: "Great! Keep practicing to master the concept.",
      points: 1,
      difficulty: grade_level
    })
  }
  
  const quiz = {
    questions,
    total_points: questions.length,
    passing_score: Math.ceil(questions.length * 0.7),
    time_estimate: "3-5 minutes"
  }
  
  return NextResponse.json(quiz)
}

export async function POST(request: NextRequest) {
  try {
    const { grade_level, subject, topic, subtopic, learning_objective, lesson_summary } = await request.json()
    
    console.log('Quiz generation request:', { grade_level, subject, topic, subtopic })
    console.log('OpenAI API key available:', !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder-key')
    console.log('Environment variables check:', {
      hasKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length || 0,
      isPlaceholder: process.env.OPENAI_API_KEY === 'placeholder-key'
    })
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder-key') {
      console.log('No OpenAI API key, using fallback quiz')
      return createFallbackQuiz(subject, topic, subtopic, grade_level)
    }
    
    console.log('Using OpenAI for quiz generation')
    
    try {
      // Get the quiz generator prompt
      const promptResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/prompts/quiz-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: {
            grade_level,
            subject,
            topic,
            subtopic,
            learning_objective,
            lesson_summary,
            quiz_type: 'lesson_completion'
          }
        })
      })
      
      if (!promptResponse.ok) {
        console.log('Failed to load quiz prompt, using fallback')
        return createFallbackQuiz(subject, topic, subtopic, grade_level)
      }
      
      const { prompt } = await promptResponse.json()
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: prompt
          },
          {
            role: "user",
            content: `Generate a quiz for the lesson on ${subtopic} in ${subject} for ${grade_level}. Focus on testing: ${learning_objective}. Return the response in valid JSON format.`
          }
        ],
        temperature: 0.5,
      })

      const quizContent = completion.choices[0].message.content || '{}'
      
      try {
        const quizData = JSON.parse(quizContent)
        
        // Ensure the quiz has the expected structure
        const formattedQuiz = {
          questions: quizData.questions || [],
          total_points: quizData.total_points || quizData.questions?.length || 0,
          passing_score: quizData.passing_score || Math.ceil((quizData.questions?.length || 0) * 0.7),
          time_estimate: quizData.time_estimate || '5-10 minutes'
        }

        return NextResponse.json(formattedQuiz)
      } catch (parseError) {
        console.error('Failed to parse quiz JSON:', parseError)
        return createFallbackQuiz(subject, topic, subtopic, grade_level)
      }
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      return createFallbackQuiz(subject, topic, subtopic, grade_level)
    }
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}