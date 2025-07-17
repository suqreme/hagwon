import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { lessonCacheService } from '@/services/lessonCacheService'

function createFallbackQuiz(subject: string, topic: string, subtopic: string, grade_level: string, target_language: string = 'en') {
  const questions = []
  
  // Math quizzes
  if (subject === 'Mathematics' || subject === 'math') {
    if (subtopic === 'counting_to_10') {
      questions.push({
        id: 1,
        question: "What number comes after 4?",
        type: "multiple_choice",
        options: ["3", "5", "6", "7"],
        correct_answer: 1,
        explanation: "5 comes after 4. When we count: 1, 2, 3, 4, 5!",
        points: 1,
        difficulty: grade_level
      })
      questions.push({
        id: 2,
        question: "Count the apples: 🍎🍎🍎. How many are there?",
        type: "multiple_choice",
        options: ["2", "3", "4", "5"],
        correct_answer: 1,
        explanation: "There are 3 apples. Count them: 1, 2, 3!",
        points: 1,
        difficulty: grade_level
      })
      questions.push({
        id: 3,
        question: "Which number is bigger: 7 or 3?",
        type: "multiple_choice",
        options: ["7", "3", "They are the same", "I don't know"],
        correct_answer: 0,
        explanation: "7 is bigger than 3. When we count up from 3: 3, 4, 5, 6, 7 - we see 7 comes later!",
        points: 1,
        difficulty: grade_level
      })
    } else if (subtopic === 'counting_to_20') {
      questions.push({
        id: 1,
        question: "What number comes after 10?",
        type: "multiple_choice",
        options: ["9", "11", "12", "20"],
        correct_answer: 1,
        explanation: "11 comes after 10. When we count: 8, 9, 10, 11!",
        points: 1,
        difficulty: grade_level
      })
      questions.push({
        id: 2,
        question: "How many fingers and toes do you have in total?",
        type: "multiple_choice",
        options: ["10", "15", "20", "25"],
        correct_answer: 2,
        explanation: "You have 10 fingers and 10 toes, so 10 + 10 = 20 total!",
        points: 1,
        difficulty: grade_level
      })
      questions.push({
        id: 3,
        question: "What number comes before 16?",
        type: "multiple_choice",
        options: ["14", "15", "17", "18"],
        correct_answer: 1,
        explanation: "15 comes before 16. Count: 13, 14, 15, 16!",
        points: 1,
        difficulty: grade_level
      })
    } else if (subtopic === 'basic_addition') {
      questions.push({
        id: 1,
        question: "What is 2 + 3?",
        type: "multiple_choice",
        options: ["4", "5", "6", "7"],
        correct_answer: 1,
        explanation: "2 + 3 = 5. Count: 1, 2 (pause) 3, 4, 5!",
        points: 1,
        difficulty: grade_level
      })
      questions.push({
        id: 2,
        question: "If you have 4 toys and get 2 more toys, how many toys do you have?",
        type: "multiple_choice",
        options: ["5", "6", "7", "8"],
        correct_answer: 1,
        explanation: "4 + 2 = 6 toys total. Addition means putting groups together!",
        points: 1,
        difficulty: grade_level
      })
      questions.push({
        id: 3,
        question: "What does the + sign mean?",
        type: "multiple_choice",
        options: ["Take away", "Put together", "Count backwards", "Stop"],
        correct_answer: 1,
        explanation: "The + sign means 'put together' or 'add'. It tells us to combine groups!",
        points: 1,
        difficulty: grade_level
      })
    } else if (topic.includes('addition') || subtopic.includes('addition')) {
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
      // Generic math quiz
      questions.push({
        id: 1,
        question: `Which of these is an example of ${subtopic.replace(/_/g, ' ')}?`,
        type: "multiple_choice",
        options: ["Using numbers to solve problems", "Drawing pictures", "Reading stories", "Playing games"],
        correct_answer: 0,
        explanation: `Great! ${subtopic.replace(/_/g, ' ')} involves working with numbers and math concepts.`,
        points: 1,
        difficulty: grade_level
      })
      questions.push({
        id: 2,
        question: `What did you practice in this ${subtopic.replace(/_/g, ' ')} lesson?`,
        type: "multiple_choice",
        options: ["Important math skills", "Just reading", "Only drawing", "Nothing useful"],
        correct_answer: 0,
        explanation: `Excellent! You practiced important math skills related to ${subtopic.replace(/_/g, ' ')}.`,
        points: 1,
        difficulty: grade_level
      })
    }
  } 
  // English quizzes
  else if (subject === 'English Language Arts' || subject === 'english') {
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
      questions.push({
        id: 2,
        question: "What do letters make when we put them together?",
        type: "multiple_choice",
        options: ["Numbers", "Words", "Pictures", "Colors"],
        correct_answer: 1,
        explanation: "Letters make words! When we put letters together, they spell words.",
        points: 1,
        difficulty: grade_level
      })
    } else {
      questions.push({
        id: 1,
        question: `What is the main purpose of learning ${subtopic.replace(/_/g, ' ')}?`,
        type: "multiple_choice",
        options: ["To communicate better", "To do math", "To play games", "To draw pictures"],
        correct_answer: 0,
        explanation: `Learning ${subtopic.replace(/_/g, ' ')} helps you communicate and express yourself better!`,
        points: 1,
        difficulty: grade_level
      })
      questions.push({
        id: 2,
        question: `How can you practice ${subtopic.replace(/_/g, ' ')}?`,
        type: "multiple_choice",
        options: ["Reading and writing every day", "Only watching TV", "Just sleeping", "Avoiding books"],
        correct_answer: 0,
        explanation: "Reading and writing every day is the best way to improve your language skills!",
        points: 1,
        difficulty: grade_level
      })
    }
  } 
  // Generic subject quiz
  else {
    questions.push({
      id: 1,
      question: `What is the most important thing about learning ${subtopic.replace(/_/g, ' ')}?`,
      type: "multiple_choice",
      options: ["Practice and understanding", "Memorizing everything", "Going fast", "Skipping steps"],
      correct_answer: 0,
      explanation: "Practice and understanding are the most important parts of learning any subject!",
      points: 1,
      difficulty: grade_level
    })
    questions.push({
      id: 2,
      question: `How do you feel about learning ${subtopic.replace(/_/g, ' ')}?`,
      type: "multiple_choice",
      options: ["Excited to learn more!", "It's okay", "A bit challenging", "Need more help"],
      correct_answer: 0,
      explanation: "Great attitude! Being excited to learn helps you succeed in any subject.",
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
    const { grade_level, subject, topic, subtopic, learning_objective, lesson_summary, target_language } = await request.json()
    
    console.log('Quiz generation request:', { grade_level, subject, topic, subtopic, target_language })
    
    // Step 1: Check cache first
    const cachedQuiz = await lessonCacheService.getCachedQuiz(
      subject,
      grade_level,
      topic,
      subtopic,
      target_language || 'en'
    )
    
    if (cachedQuiz) {
      console.log('Using cached quiz')
      return NextResponse.json(cachedQuiz)
    }
    
    // Step 2: Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder-key') {
      console.log('No OpenAI API key, using fallback quiz')
      const fallbackResult = createFallbackQuiz(subject, topic, subtopic, grade_level, target_language || 'en')
      
      // Cache the fallback quiz
      const fallbackData = await fallbackResult.json()
      await lessonCacheService.cacheQuiz(
        subject,
        grade_level,
        topic,
        subtopic,
        target_language || 'en',
        fallbackData,
        'fallback'
      )
      
      return fallbackResult
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
            content: `Generate a quiz for the lesson on ${subtopic} in ${subject} for ${grade_level}. Focus on testing: ${learning_objective}. ${target_language && target_language !== 'en' ? `Please generate questions in ${target_language} language.` : ''} Return the response in valid JSON format.`
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
          time_estimate: quizData.time_estimate || '5-10 minutes',
          metadata: {
            generation_type: 'ai' as const,
            version: 1
          }
        }

        // Cache the AI-generated quiz
        await lessonCacheService.cacheQuiz(
          subject,
          grade_level,
          topic,
          subtopic,
          target_language || 'en',
          formattedQuiz,
          'ai'
        )

        return NextResponse.json(formattedQuiz)
      } catch (parseError) {
        console.error('Failed to parse quiz JSON:', parseError)
        const fallbackResult = createFallbackQuiz(subject, topic, subtopic, grade_level, target_language || 'en')
        
        // Cache the fallback quiz
        const fallbackData = await fallbackResult.json()
        await lessonCacheService.cacheQuiz(
          subject,
          grade_level,
          topic,
          subtopic,
          target_language || 'en',
          fallbackData,
          'fallback'
        )
        
        return fallbackResult
      }
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      const fallbackResult = createFallbackQuiz(subject, topic, subtopic, grade_level, target_language || 'en')
      
      // Cache the fallback quiz
      const fallbackData = await fallbackResult.json()
      await lessonCacheService.cacheQuiz(
        subject,
        grade_level,
        topic,
        subtopic,
        target_language || 'en',
        fallbackData,
        'fallback'
      )
      
      return fallbackResult
    }
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}