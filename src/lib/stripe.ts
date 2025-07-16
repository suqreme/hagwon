import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Price IDs for each plan (you'll need to create these in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  supporter: process.env.STRIPE_SUPPORTER_PRICE_ID!,
  sponsor: process.env.STRIPE_SPONSOR_PRICE_ID!,
} as const

// Product configuration matching our subscription plans
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free Access',
    price: 0,
    interval: 'forever',
    description: 'Basic learning with limited features',
    features: [
      '3 lessons per day',
      'Basic progress tracking',
      'Community support',
      'Mobile access'
    ],
    stripePriceId: null,
  },
  supporter: {
    id: 'supporter',
    name: 'Supporter',
    price: 5,
    interval: 'month',
    description: 'Support global education while learning',
    features: [
      'Unlimited lessons',
      'Advanced progress analytics',
      'Priority support',
      'Offline lesson downloads',
      'Certificate generation',
      'Help fund scholarships'
    ],
    stripePriceId: STRIPE_PRICE_IDS.supporter,
  },
  sponsor: {
    id: 'sponsor',
    name: 'Education Sponsor',
    price: 25,
    interval: 'month',
    description: 'Sponsor education for underserved communities',
    features: [
      'Everything in Supporter',
      'Sponsor 5 scholarship students',
      'Impact reports and updates',
      'Donor recognition (optional)',
      'Priority feature requests',
      'Monthly community calls'
    ],
    stripePriceId: STRIPE_PRICE_IDS.sponsor,
  },
} as const

export type PlanId = keyof typeof SUBSCRIPTION_PLANS