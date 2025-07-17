import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations
const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null

export async function POST(request: NextRequest) {
  try {
    console.log('Stripe checkout API called')
    
    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe not configured - missing STRIPE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 500 }
      )
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.error('Supabase not configured - missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json(
        { error: 'Supabase not configured. Please add SUPABASE_SERVICE_ROLE_KEY to environment variables.' },
        { status: 500 }
      )
    }

    const { priceId, userId, planId } = await request.json()
    console.log('Checkout request data:', { priceId, userId, planId })

    if (!priceId || !userId || !planId) {
      console.error('Missing required parameters:', { priceId: !!priceId, userId: !!userId, planId: !!planId })
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get user profile to use as customer info
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if customer already exists in Stripe
    let customerId: string | undefined
    const existingCustomers = await stripe.customers.list({
      email: userProfile.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: userProfile.email,
        name: userProfile.first_name && userProfile.last_name 
          ? `${userProfile.first_name} ${userProfile.last_name}`
          : userProfile.email,
        metadata: {
          userId: userId,
          planId: planId,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: {
        userId: userId,
        planId: planId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}