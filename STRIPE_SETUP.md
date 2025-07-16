# 🏦 Stripe Integration Setup Guide

This guide walks you through setting up Stripe for subscription payments in your EduRoot application.

## 📋 Prerequisites

- Stripe account (free to create at https://stripe.com)
- Access to your Supabase database
- Environment variables configured

## 🔧 Setup Steps

### 1. Create Stripe Account and Get API Keys

1. **Sign up for Stripe**: Go to https://stripe.com and create an account
2. **Get your API keys**:
   - In Stripe Dashboard → Developers → API keys
   - Copy your **Publishable key** and **Secret key** (use test keys for development)

### 2. Create Products and Price IDs

1. **Go to Stripe Dashboard → Products**
2. **Create "Supporter" product**:
   - Name: "Supporter Plan"
   - Pricing: $5/month recurring
   - Copy the **Price ID** (starts with `price_`)
3. **Create "Sponsor" product**:
   - Name: "Education Sponsor Plan" 
   - Pricing: $25/month recurring
   - Copy the **Price ID** (starts with `price_`)

### 3. Configure Environment Variables

Update your `.env.local` file with your Stripe credentials:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_SUPPORTER_PRICE_ID=price_your_supporter_price_id_here
STRIPE_SPONSOR_PRICE_ID=price_your_sponsor_price_id_here
```

### 4. Update Database Schema

Run this SQL in your Supabase SQL Editor to add the missing Stripe customer ID field:

```sql
-- Add stripe_customer_id column to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
```

Or run the provided migration file:
```bash
# Copy the contents of add_stripe_customer_id.sql and run in Supabase SQL Editor
```

### 5. Configure Stripe Webhooks

1. **Go to Stripe Dashboard → Developers → Webhooks**
2. **Add endpoint**: `https://your-domain.com/api/stripe/webhooks`
3. **Select events to listen for**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy the webhook signing secret** and add it to your environment variables

### 6. Configure Stripe Customer Portal

1. **Go to Stripe Dashboard → Settings → Billing → Customer portal**
2. **Enable customer portal**
3. **Configure settings**:
   - Allow customers to update payment methods: ✅
   - Allow customers to view invoices: ✅
   - Allow customers to cancel subscriptions: ✅
   - Allow customers to switch plans: ✅ (optional)

## 🧪 Testing

### Test Mode Setup

1. **Use Stripe test mode** during development
2. **Test credit card numbers**:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Requires 3D Secure: `4000 0027 6000 3184`

### Test the Integration

1. **Start your development server**: `npm run dev`
2. **Go to subscription page**: `/subscription`
3. **Try subscribing to a paid plan**
4. **Use test card**: `4242 4242 4242 4242` with any future date and CVC
5. **Check Stripe Dashboard** to see the subscription created
6. **Check your database** to see the subscription record updated

## 🚀 Production Setup

### Before Going Live

1. **Switch to live API keys** in Stripe Dashboard
2. **Update environment variables** with live keys
3. **Test with real payments** (small amounts)
4. **Set up proper webhook endpoint** (not localhost)
5. **Configure business settings** in Stripe Dashboard

### Required Business Information

1. **Business details** in Stripe Dashboard → Settings → Business settings
2. **Bank account** for payouts
3. **Tax information** if required
4. **Terms of service** and privacy policy links

## 🛠️ Features Included

### ✅ Implemented Features

- **Subscription checkout** via Stripe Checkout
- **Webhook handling** for subscription events
- **Customer portal** for managing subscriptions
- **Plan management** (Free, Supporter, Sponsor)
- **Hardship applications** (free access)
- **Database integration** with Supabase
- **Beautiful notifications** for user feedback

### 🎯 Subscription Plans

1. **Free Plan** ($0/month)
   - 3 lessons per day
   - Basic progress tracking
   - Community support

2. **Supporter Plan** ($5/month)
   - Unlimited lessons
   - Advanced analytics
   - Priority support
   - Certificates

3. **Education Sponsor** ($25/month)
   - Everything in Supporter
   - Sponsor scholarship students
   - Impact reports
   - Monthly community calls

## 🔍 Troubleshooting

### Common Issues

1. **Webhook signature verification failed**
   - Check webhook secret in environment variables
   - Ensure webhook URL is correct

2. **Customer not found errors**
   - Check user profile exists in database
   - Verify user ID in metadata

3. **Price ID not found**
   - Verify price IDs in environment variables
   - Check products are created in Stripe Dashboard

### Debug Mode

Enable debug mode by adding to your environment:
```bash
STRIPE_DEBUG=true
```

This will log additional information for troubleshooting.

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Webhook Security](https://stripe.com/docs/webhooks/signatures)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)

## 🆘 Support

If you encounter issues:

1. Check Stripe Dashboard logs
2. Check application console logs  
3. Verify webhook events are being received
4. Test with Stripe's test cards
5. Review this setup guide

Your Stripe integration is now ready! 🎉