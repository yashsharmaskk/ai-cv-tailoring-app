# Google Gemini Setup Guide for CV Tailor

## Overview
The CV Tailor application now uses Google Gemini 1.5 Flash model for fast, high-quality AI resume tailoring.

## Setup Instructions

### 1. Get Google Gemini API Key (FREE!)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (starts with `AIza...`)

### 2. Configure Environment Variables
1. Open the `.env` file in the project root
2. Replace `your-gemini-api-key-here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSyC-your-actual-api-key-here
   ```

### 3. Benefits of Google Gemini

#### ✅ **Free Tier (Very Generous)**
- **15 requests per minute**
- **1,500 requests per day** 
- **No billing required**
- **No credit card needed**

#### ✅ **Fast & High Quality**
- **Model**: Gemini 1.5 Flash
- **Speed**: 2-5 seconds response time
- **Quality**: Excellent for CV tailoring
- **Context**: 1M token context window

#### ✅ **Deployment Ready**
- Works on any hosting platform
- No local dependencies
- Environment variable configuration
- Reliable error handling

### 4. Cost Comparison
| Service | Free Tier | Speed | Quality |
|---------|-----------|-------|---------|
| **Google Gemini** | 1,500 req/day | Fast ⚡ | Excellent ⭐⭐⭐⭐⭐ |
| OpenAI GPT-3.5 | $5 credit | Fast ⚡ | Excellent ⭐⭐⭐⭐⭐ |
| Groq | 14,400 req/day | Very Fast 🚀 | Good ⭐⭐⭐⭐ |

### 5. Usage Limits
- **Rate Limit**: 15 requests per minute
- **Daily Limit**: 1,500 requests per day
- **Perfect for**: Personal use, demos, small applications
- **For production**: Consider paid plan if needed

### 6. Error Handling
The server handles common Gemini errors:
- Invalid API key
- Quota exceeded
- Rate limiting
- Network issues

### 7. Testing Your Setup
Once you've added your API key:
1. Restart the server
2. Go to http://localhost:3000
3. Enter a job description
4. Upload/paste a CV
5. Click "Start AI CV Tailoring"

The AI should respond within 2-5 seconds with a tailored resume!

## 🚀 Why Gemini is Perfect for This Project
1. **Free to use** - No billing required
2. **High quality** - Excellent text generation
3. **Fast responses** - 2-5 second processing
4. **Large context** - Can handle long resumes and job descriptions
5. **Reliable** - Google's enterprise-grade infrastructure
6. **Easy setup** - Just one API key needed

## Next Steps
1. Get your API key from https://aistudio.google.com/app/apikey
2. Update the `.env` file
3. Restart the server
4. Test the application!

Your CV Tailor app is now powered by Google Gemini! 🎉
