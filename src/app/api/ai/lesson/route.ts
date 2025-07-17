import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { lessonCacheService } from '@/services/lessonCacheService'

function createFallbackLesson(subject: string, topic: string, subtopic: string, grade_level: string, target_language: string = 'en') {
  const cleanSubtopic = subtopic.replace(/_/g, ' ')
  const cleanTopic = topic.replace(/_/g, ' ')
  let lessonContent = `# ${cleanSubtopic.charAt(0).toUpperCase() + cleanSubtopic.slice(1)} Lesson\n\n`
  
  // Math lessons
  if (subject === 'Mathematics' || subject === 'math') {
    if (subtopic === 'counting_to_10') {
      lessonContent += `
## Welcome to Counting!

Hi there! Today we're going to learn how to count from 1 to 10. Counting is one of the most important math skills you'll ever learn!

## What is Counting?
Counting means saying numbers in order to find out how many things there are.

## Let's Learn the Numbers 1-10

**1 (One)** - Hold up 1 finger
**2 (Two)** - Hold up 2 fingers  
**3 (Three)** - Hold up 3 fingers
**4 (Four)** - Hold up 4 fingers
**5 (Five)** - Hold up 5 fingers
**6 (Six)** - Hold up 6 fingers
**7 (Seven)** - Hold up 7 fingers
**8 (Eight)** - Hold up 8 fingers
**9 (Nine)** - Hold up 9 fingers
**10 (Ten)** - Hold up 10 fingers

## Practice Activities

### Activity 1: Count Your Toys
Look around and find some toys or objects. Count them:
- 1 toy car
- 2 toy cars  
- 3 toy cars
- Keep going up to 10!

### Activity 2: Count and Touch
Touch each object as you count:
- Touch 1 book and say "One"
- Touch 2 books and say "One, Two"
- Keep going!

### Activity 3: Count Your Steps
Take steps while counting:
- 1 step, 2 steps, 3 steps... up to 10!

## Important Tips
- Always start with 1
- Say each number clearly
- Count slowly at first
- Use your fingers to help
- Practice every day!

## Let's Practice Together
Count these objects:
🍎 (1 apple)
🍎🍎 (2 apples)  
🍎🍎🍎 (3 apples)

Can you count them? 1, 2, 3!

## Remember
- Counting helps us know "how many"
- Practice makes perfect
- You're doing great!

Great job learning to count! Next, we'll learn to count even higher numbers!
      `
    } else if (subtopic === 'counting_to_20') {
      lessonContent += `
## Counting to 20 - Let's Go Higher!

Now that you know how to count to 10, let's learn to count all the way to 20!

## Review: Numbers 1-10
Let's quickly count together: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

## New Numbers: 11-20
**11 (Eleven)** - This is 10 + 1 more
**12 (Twelve)** - This is 10 + 2 more
**13 (Thirteen)** - This is 10 + 3 more
**14 (Fourteen)** - This is 10 + 4 more
**15 (Fifteen)** - This is 10 + 5 more
**16 (Sixteen)** - This is 10 + 6 more
**17 (Seventeen)** - This is 10 + 7 more
**18 (Eighteen)** - This is 10 + 8 more
**19 (Nineteen)** - This is 10 + 9 more
**20 (Twenty)** - This is 2 groups of 10

## Practice Activities
Count objects around you from 1 to 20. Try counting:
- Your fingers and toes (that's 20!)
- Blocks or toys
- Books on a shelf

## Memory Tip
The teens (11-19) all end in "teen" except eleven and twelve. Remember:
- ThirTEEN, FourTEEN, FifTEEN, SixTEEN, SevenTEEN, EighTEEN, NineTEEN

Great job! You can now count to 20!
      `
    } else if (subtopic === 'basic_addition') {
      lessonContent += `
## Introduction to Addition

Addition means putting groups together to find the total!

## What is Addition?
When you have some objects and you get more objects, addition helps you find out how many you have altogether.

## The Plus Sign (+)
The + sign means "add" or "put together"
The = sign means "equals" or "the same as"

## Let's Start Simple

### Adding with 1
- 1 + 1 = 2 (1 apple + 1 apple = 2 apples)
- 2 + 1 = 3 (2 cats + 1 cat = 3 cats)
- 3 + 1 = 4 (3 books + 1 book = 4 books)

### Adding with 2
- 1 + 2 = 3 (1 ball + 2 balls = 3 balls)
- 2 + 2 = 4 (2 dogs + 2 dogs = 4 dogs)  
- 3 + 2 = 5 (3 cars + 2 cars = 5 cars)

## Practice Activities

### Use Your Fingers
Hold up fingers to add:
- Hold up 2 fingers on one hand, 3 on the other
- Count all your fingers: 1, 2, 3, 4, 5
- So 2 + 3 = 5!

### Use Objects
Get some blocks, toys, or snacks:
- Put 3 blocks in one pile
- Put 2 blocks in another pile  
- Push them together and count: 1, 2, 3, 4, 5
- So 3 + 2 = 5!

## Remember
- Addition means "putting together"
- Count everything to find the answer
- Practice with objects you can touch
- Start with small numbers

Great job learning addition!
      `
    } else {
      // Generic math fallback
      lessonContent += `
## Welcome to ${cleanSubtopic}!

Today we're learning about ${cleanSubtopic} in mathematics. This is an important skill that will help you with many other math concepts!

## What You'll Learn
In this lesson, you will:
- Understand what ${cleanSubtopic} means
- See examples of ${cleanSubtopic} in everyday life
- Practice ${cleanSubtopic} step by step
- Build confidence with ${cleanSubtopic}

## Let's Get Started!
Mathematics is all around us! ${cleanSubtopic.charAt(0).toUpperCase() + cleanSubtopic.slice(1)} helps us solve problems and understand our world better.

## Practice Activities
- Look for examples of ${cleanSubtopic} around you
- Practice with real objects when possible
- Ask questions if you need help
- Take your time learning

## Remember
- Every math expert started as a beginner
- Practice makes perfect
- You're doing great!

Keep practicing and you'll master ${cleanSubtopic}!
      `
    }
  } 
  // English lessons
  else if (subject === 'English Language Arts' || subject === 'english') {
    if (topic.includes('reading')) {
      lessonContent += `
## Learning About ${cleanSubtopic}

Reading is one of the most important skills you can learn! It opens up whole new worlds of stories, information, and imagination.

## Key Points
- Letters make sounds
- Sounds make words  
- Words tell us stories and information
- Reading helps us learn about everything!

## Practice Tips
1. Read a little bit every day
2. Ask questions about what you read
3. Talk about stories with family and friends
4. Look at the pictures for clues

## Remember
Reading gets easier with practice. Don't worry if some words are hard at first - every reader started just like you!
      `
    } else {
      // Generic English fallback
      lessonContent += `
## Welcome to ${cleanSubtopic}!

Language arts helps us communicate, express ourselves, and understand others. Today we're focusing on ${cleanSubtopic}.

## What You'll Learn
- Key concepts about ${cleanSubtopic}
- How to use ${cleanSubtopic} in speaking and writing
- Practice activities to improve your skills

## Practice Activities
- Read examples of ${cleanSubtopic}
- Practice with everyday conversations
- Write or draw about what you learn

Great job working on your language skills!
      `
    }
  }
  // Science lessons
  else if (subject === 'Science' || subject === 'science') {
    lessonContent += `
## Exploring ${cleanSubtopic}!

Science is all about exploring and discovering how things work! Today we're learning about ${cleanSubtopic}.

## What is ${cleanSubtopic}?
${cleanSubtopic.charAt(0).toUpperCase() + cleanSubtopic.slice(1)} is an important concept in science that helps us understand our world.

## Let's Investigate!
- Observe examples around you
- Ask questions about what you see
- Make predictions about what might happen
- Test your ideas safely

## Science Skills
- Observe carefully
- Ask good questions
- Make predictions
- Test ideas safely
- Share what you learn

Keep exploring and asking questions!
    `
  }
  // Generic fallback for other subjects
  else {
    lessonContent += `
## Welcome to ${cleanSubtopic}!

Today we're learning about ${cleanSubtopic}. This is an important topic that will help you understand ${cleanTopic} better.

## Learning Objectives
By the end of this lesson, you will:
- Understand the key concepts of ${cleanSubtopic}
- Be able to explain ${cleanSubtopic} in your own words
- Apply what you learn in practice activities

## Key Concepts
${cleanSubtopic.charAt(0).toUpperCase() + cleanSubtopic.slice(1)} is an important part of ${cleanTopic} that helps us understand and work with related ideas.

## Practice Activities
- Look for examples in everyday life
- Practice the skills you learn
- Ask questions when you need help
- Review what you've learned

## Remember
- Learning takes time and practice
- Everyone learns at their own pace
- Asking questions helps you learn better
- You're making great progress!

Keep up the excellent work!
    `
  }
  
  return NextResponse.json({
    lesson: lessonContent,
    metadata: {
      topic,
      subtopic,
      grade_level,
      subject
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { grade_level, subject, topic, subtopic, learning_objective, estimated_duration, target_language } = await request.json()
    
    console.log('Lesson generation request:', { grade_level, subject, topic, subtopic, target_language })
    console.log('OpenAI API key available:', !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder-key')
    
    // Step 1: Check cache first
    const cachedLesson = await lessonCacheService.getCachedLesson(
      subject,
      grade_level,
      topic,
      subtopic,
      target_language || 'en'
    )
    
    if (cachedLesson) {
      console.log('Using cached lesson')
      return NextResponse.json(cachedLesson)
    }
    
    // Step 2: Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder-key') {
      console.log('No OpenAI API key, using fallback lesson')
      const fallbackResult = createFallbackLesson(subject, topic, subtopic, grade_level, target_language || 'en')
      
      // Cache the fallback lesson
      const fallbackData = await fallbackResult.json()
      await lessonCacheService.cacheLesson(
        subject,
        grade_level,
        topic,
        subtopic,
        target_language || 'en',
        fallbackData.lesson,
        fallbackData.metadata,
        'fallback'
      )
      
      return fallbackResult
    }
    
    try {
      // Get the teacher prompt
    const promptResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/prompts/ai-teacher`, {
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
          previous_performance: 'No previous data',
          estimated_duration
        }
      })
    })
    
      if (!promptResponse.ok) {
        console.log('Failed to load teacher prompt, using fallback')
        return createFallbackLesson(subject, topic, subtopic, grade_level)
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
            content: `Please teach me about ${subtopic} in ${subject} for ${grade_level} level. Focus on the learning objective: ${learning_objective}. ${target_language && target_language !== 'en' ? `Please respond in ${target_language} language.` : ''}`
          }
        ],
        temperature: 0.7,
      })

      const lessonContent = completion.choices[0].message.content || 'No lesson generated'

      const lessonData = {
        lesson: lessonContent,
        metadata: {
          topic,
          subtopic,
          grade_level,
          subject,
          target_language: target_language || 'en',
          generation_type: 'ai' as const,
          version: 1
        }
      }

      // Cache the AI-generated lesson
      await lessonCacheService.cacheLesson(
        subject,
        grade_level,
        topic,
        subtopic,
        target_language || 'en',
        lessonContent,
        lessonData.metadata,
        'ai'
      )

      return NextResponse.json(lessonData)
    } catch (openaiError) {
      console.error('OpenAI API error in lesson generation:', openaiError)
      const fallbackResult = createFallbackLesson(subject, topic, subtopic, grade_level, target_language || 'en')
      
      // Cache the fallback lesson
      const fallbackData = await fallbackResult.json()
      await lessonCacheService.cacheLesson(
        subject,
        grade_level,
        topic,
        subtopic,
        target_language || 'en',
        fallbackData.lesson,
        fallbackData.metadata,
        'fallback'
      )
      
      return fallbackResult
    }
  } catch (error) {
    console.error('Error generating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    )
  }
}