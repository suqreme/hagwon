import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables (without exposing secrets)
    const config = {
      stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
        secretKey: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
        supporterPriceId: process.env.STRIPE_SUPPORTER_PRICE_ID ? '✅ Set' : '❌ Missing',
        sponsorPriceId: process.env.STRIPE_SPONSOR_PRICE_ID ? '✅ Set' : '❌ Missing',
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing',
      },
      app: {
        url: process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing',
      }
    }

    // Check if critical services are working
    const services = {
      stripe: process.env.STRIPE_SECRET_KEY ? 'Available' : 'Not configured',
      supabase: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Available' : 'Not configured',
      openai: process.env.OPENAI_API_KEY ? 'Available' : 'Not configured',
    }

    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      config,
      services,
      recommendations: [
        ...(config.stripe.secretKey === '❌ Missing' ? ['Add STRIPE_SECRET_KEY to environment variables'] : []),
        ...(config.stripe.supporterPriceId === '❌ Missing' ? ['Add STRIPE_SUPPORTER_PRICE_ID to environment variables'] : []),
        ...(config.stripe.sponsorPriceId === '❌ Missing' ? ['Add STRIPE_SPONSOR_PRICE_ID to environment variables'] : []),
        ...(config.supabase.serviceRoleKey === '❌ Missing' ? ['Add SUPABASE_SERVICE_ROLE_KEY to environment variables'] : []),
      ]
    })
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}