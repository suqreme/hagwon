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
      // Fallback content when API key is not available
      const fallbackContent = generateFallbackContent(subject, grade, topic, subtopic);
      return NextResponse.json({ content: fallbackContent });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful, patient, and encouraging elementary school teacher. Generate educational content that is age-appropriate, engaging, and easy to understand. Use simple language and include practical examples.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content generated');
    }

    return NextResponse.json({ content });

  } catch (error) {
    console.error('AI lesson generation error:', error);
    
    // Return fallback content on error
    const { subject, grade, topic, subtopic } = await request.json();
    const fallbackContent = generateFallbackContent(subject, grade, topic, subtopic);
    
    return NextResponse.json({ content: fallbackContent });
  }
}

function generateFallbackContent(subject: string, grade: string, topic: string, subtopic: string): string {
  const gradeDisplay = grade.replace('_', ' ').toUpperCase();
  const topicDisplay = topic.replace('_', ' ');
  const subtopicDisplay = subtopic.replace('_', ' ');

  const mathContent = `
# Learning About ${subtopicDisplay}

## Welcome to Your ${subject} Lesson!

Hi there! Today we're going to learn about **${subtopicDisplay}** in ${topicDisplay}. This is perfect for ${gradeDisplay} students like you!

## What You'll Learn Today

By the end of this lesson, you'll be able to:
- Understand what ${subtopicDisplay} means
- Practice ${subtopicDisplay} with fun examples
- Use ${subtopicDisplay} in everyday situations

## Let's Start Learning!

### What is ${subtopicDisplay}?

${subtopicDisplay} is an important part of ${topicDisplay}. Think of it like building blocks - each new thing you learn helps you build something bigger and more exciting!

### Why is This Important?

Learning ${subtopicDisplay} helps you:
- Solve problems in school
- Use math in real life
- Build confidence with numbers
- Get ready for more advanced topics

### Practice Examples

Let's try some examples together:

**Example 1:** 
Think about times you might use ${subtopicDisplay} at home or school.

**Example 2:**
Can you think of objects around you that relate to ${subtopicDisplay}?

### Fun Facts

Did you know that ${subtopicDisplay} is all around us? You use it more than you think!

## What's Next?

Great job learning about ${subtopicDisplay}! When you're ready, take the quiz to show what you've learned. Don't worry if you don't get everything right the first time - learning takes practice!

Remember: You're doing amazing, and every step forward is progress! 🌟

---

*This lesson was generated offline. For the full AI-powered experience, please connect to the internet.*
  `;

  const englishContent = `
# Learning About ${subtopicDisplay}

## Welcome to Your ${subject} Lesson!

Hello! Today we're going to explore **${subtopicDisplay}** together. This lesson is designed especially for ${gradeDisplay} learners like you!

## What You'll Learn Today

By the end of this lesson, you'll be able to:
- Understand ${subtopicDisplay} better
- Practice ${subtopicDisplay} skills
- Use ${subtopicDisplay} in your reading and writing

## Let's Begin!

### What is ${subtopicDisplay}?

${subtopicDisplay} is an important part of learning English. It's like a special tool that helps you become a better reader and writer!

### Why is This Important?

Learning ${subtopicDisplay} helps you:
- Read more fluently
- Write more clearly
- Understand stories better
- Communicate with others

### Practice Together

Let's practice ${subtopicDisplay} with some examples:

**Example 1:** 
Look for ${subtopicDisplay} in the books you read.

**Example 2:**
Try using ${subtopicDisplay} in your own sentences.

### Reading Connection

When you read books, you'll notice ${subtopicDisplay} everywhere! It's like a secret code that helps you understand what the author is trying to tell you.

### Writing Practice

Now you can use ${subtopicDisplay} in your own writing. Start with simple sentences and gradually make them more interesting!

## What's Next?

Excellent work learning about ${subtopicDisplay}! Now it's time to take the quiz and show off what you've learned. Remember, it's okay to make mistakes - that's how we learn!

Keep practicing, and you'll become even better at ${subtopicDisplay}! 📚

---

*This lesson was generated offline. For the full AI-powered experience, please connect to the internet.*
  `;

  return subject === 'math' ? mathContent : englishContent;
}