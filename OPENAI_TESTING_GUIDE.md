# OpenAI API Testing Guide

This guide helps you test the OpenAI API configuration in both local development and production environments.

## Test Scripts

### 1. Local Development Testing

Use `test_openai_deployment.js` to test your local development server:

```bash
# Start your development server
npm run dev

# In a new terminal, run the test
node test_openai_deployment.js
```

### 2. Production/Vercel Testing

Use `test_vercel_deployment.js` to test your Vercel deployment:

```bash
# Test your Vercel deployment
node test_vercel_deployment.js https://your-app.vercel.app

# Or set environment variable
VERCEL_URL=your-app.vercel.app node test_vercel_deployment.js
```

## What the Tests Check

Both scripts test three main endpoints:

1. **Debug Endpoint** (`/api/debug/openai`)
   - Verifies OpenAI API key is set
   - Tests basic OpenAI API connection
   - Shows environment information

2. **Lesson Generation** (`/api/ai/generate-lesson`)
   - Tests AI-powered lesson creation
   - Verifies content generation is working
   - Falls back to static content if API fails

3. **Quiz Generation** (`/api/ai/generate-quiz`)
   - Tests AI-powered quiz creation
   - Validates JSON structure from OpenAI
   - Falls back to pre-built quizzes if API fails

## Understanding the Results

### ✅ WORKING Status
- OpenAI API key is set and valid
- API calls are successful
- AI-generated content is being created
- Students will receive personalized lessons

### ⚠️ NOT_CONFIGURED Status
- OpenAI API key is missing or using placeholder
- Fallback content will be used
- Students will receive static lessons

### ❌ FAILING Status
- OpenAI API key is set but invalid
- API calls are failing
- Check your OpenAI account for issues

### 🔧 ERROR Status
- Cannot reach the application endpoints
- Check if the server is running
- Verify the URL is correct

## Setting Up OpenAI API Key

### For Local Development

1. Create/update `.env.local` file:
```
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

2. Restart your development server:
```bash
npm run dev
```

### For Vercel Production

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add new variable:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-proj-your-actual-api-key-here`
   - Environments: Production, Preview, Development
5. Redeploy your application

## Troubleshooting

### Common Issues

1. **"Invalid JSON response from AI"**
   - OpenAI returned malformed JSON
   - System will automatically fall back to static content
   - Usually resolves itself on retry

2. **"API key not set"**
   - Environment variable is missing
   - Check spelling: `OPENAI_API_KEY`
   - Ensure no extra spaces or quotes

3. **"Connection failed"**
   - API key is invalid
   - OpenAI account has insufficient credits
   - Check OpenAI API status

4. **"Body is unusable"**
   - Internal server error (fixed in current version)
   - Restart the server if encountered

### OpenAI API Key Requirements

- Must start with `sk-proj-` (new format) or `sk-` (legacy format)
- Must be associated with an active OpenAI account
- Account must have sufficient credits
- Key must have appropriate permissions

## Cost Monitoring

- Each lesson generation costs ~$0.01-0.02
- Each quiz generation costs ~$0.005-0.01
- Set up usage alerts in your OpenAI dashboard
- Consider implementing rate limiting for high-traffic applications

## Fallback Behavior

The application is designed to work even without OpenAI API:

- **Lessons**: Static educational content based on curriculum
- **Quizzes**: Pre-built question sets for each topic
- **Graceful degradation**: No errors shown to students
- **Transparent operation**: Students may not notice the difference

## Support

If you encounter issues:

1. Run the appropriate test script
2. Check the detailed error messages
3. Verify your OpenAI API key is valid
4. Ensure your OpenAI account has credits
5. Check OpenAI API status at status.openai.com