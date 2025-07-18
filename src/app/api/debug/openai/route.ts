import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function GET() {
  try {
    const hasApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder-key'
    
    const status = {
      hasApiKey,
      apiKeyPreview: process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 8)}...${process.env.OPENAI_API_KEY.slice(-4)}` : 
        'NOT SET',
      isPlaceholder: process.env.OPENAI_API_KEY === 'placeholder-key',
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    }

    if (hasApiKey) {
      try {
        // Test a simple OpenAI call
        const testResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say 'OpenAI connection test successful' in exactly those words." }
          ],
          max_tokens: 20
        })
        
        return NextResponse.json({
          ...status,
          connectionTest: 'SUCCESS',
          testResponse: testResponse.choices[0].message.content,
          recommendation: 'OpenAI API is working! Your lessons will be AI-generated.'
        })
      } catch (openaiError) {
        return NextResponse.json({
          ...status,
          connectionTest: 'FAILED',
          error: openaiError.message,
          recommendation: 'OpenAI API key is set but connection failed. Check if key is valid and has credits.'
        })
      }
    } else {
      return NextResponse.json({
        ...status,
        connectionTest: 'SKIPPED',
        recommendation: 'Set OPENAI_API_KEY environment variable to enable AI lesson generation.'
      })
    }
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      recommendation: 'Debug script failed. Check server logs.'
    }, { status: 500 })
  }
}

export async function POST() {
  return GET() // Same logic for POST requests
}