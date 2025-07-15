import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

function createFallbackLesson(subject: string, topic: string, subtopic: string, grade_level: string) {
  let lessonContent = `# ${subtopic} Lesson\n\n`
  
  if (subject === 'math' && topic.includes('addition')) {
    lessonContent += `
## What is Addition?
Addition means putting things together to find out how many you have in total.

## Examples:
- 2 + 3 = 5 (If you have 2 apples and get 3 more, you have 5 apples total)
- 4 + 1 = 5 (4 toys plus 1 more toy equals 5 toys)

## Let's Practice:
When we add numbers, we can:
1. Count on our fingers
2. Use objects like blocks or toys
3. Draw pictures to help us

## Remember:
- The + sign means "plus" or "add"
- The = sign means "equals" or "the same as"
    `
  } else if (subject === 'english' && topic.includes('reading')) {
    lessonContent += `
## Learning About ${subtopic}
Reading is one of the most important skills you can learn!

## Key Points:
- Letters make sounds
- Sounds make words
- Words tell us stories and information

## Practice Tips:
1. Read a little bit every day
2. Ask questions about what you read
3. Talk about the stories with others

## Remember:
Reading gets easier with practice. Don't worry if some words are hard at first!
    `
  } else {
    lessonContent += `
## Learning About ${subtopic}

This lesson will help you understand ${subtopic} better.

## What You'll Learn:
- Key concepts about ${subtopic}
- How to apply what you learn
- Ways to practice and improve

## Getting Started:
Let's explore ${subtopic} together and learn step by step.

## Practice:
Remember that learning takes time and practice. You're doing great!
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
    const { grade_level, subject, topic, subtopic, learning_objective, estimated_duration } = await request.json()
    
    console.log('Lesson generation request:', { grade_level, subject, topic, subtopic })
    console.log('OpenAI API key available:', !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder-key')
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder-key') {
      console.log('No OpenAI API key, using fallback lesson')
      return createFallbackLesson(subject, topic, subtopic, grade_level)
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
            content: `Please teach me about ${subtopic} in ${subject} for ${grade_level} level. Focus on the learning objective: ${learning_objective}`
          }
        ],
        temperature: 0.7,
      })

      const lessonContent = completion.choices[0].message.content || 'No lesson generated'

      return NextResponse.json({
        lesson: lessonContent,
        metadata: {
          topic,
          subtopic,
          grade_level,
          subject
        }
      })
    } catch (openaiError) {
      console.error('OpenAI API error in lesson generation:', openaiError)
      return createFallbackLesson(subject, topic, subtopic, grade_level)
    }
  } catch (error) {
    console.error('Error generating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    )
  }
}