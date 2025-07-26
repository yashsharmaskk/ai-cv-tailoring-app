# Multiple API Keys Setup Guide

## Overview
The CV Tailoring application now supports multiple Google Gemini API keys for automatic failover. This ensures continuous service even if one API key reaches its quota limit or fails.

## How It Works
- The system automatically switches to the next available API key when one fails
- It tries each key in sequence until one succeeds or all fail
- After a successful request, it resets to the primary key for efficiency
- Supports up to 10 API keys (easily expandable)

## Setting Up Multiple API Keys

### 1. Get Additional API Keys
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create multiple API keys (recommended: 3-5 keys)
3. Each key has its own quota, so more keys = more requests per day

### 2. Update .env File
Edit your `.env` file:

```env
# Google Gemini API Configuration - Multiple Keys for Failover
GEMINI_API_KEY_1=AIzaSyCcg99dgefACjIA-2FW1ybRakXz4zRDmGc
GEMINI_API_KEY_2=AIzaSyD1234567890abcdefghijklmnopqrstuvw
GEMINI_API_KEY_3=AIzaSyE9876543210zyxwvutsrqponmlkjihgfed
GEMINI_API_KEY_4=AIzaSyF1122334455667788990011223344556677
GEMINI_API_KEY_5=AIzaSyG9988776655443322110099887766554433
# Add more keys as needed: GEMINI_API_KEY_6, GEMINI_API_KEY_7, etc.

# Server Configuration
PORT=5000
```

### 3. Key Requirements
- Use the format: `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, etc.
- Start numbering from 1 (not 0)
- Don't leave gaps in numbering
- Each key must be valid and active

## Monitoring API Keys

### Health Check
Visit: `http://localhost:5000/health`
- Shows total number of loaded keys
- Displays which key is currently active
- Shows preview of each key (first 10 characters)

### API Status Check
Visit: `http://localhost:5000/api-status`
- Tests all API keys with a simple request
- Shows which keys are working vs failed
- Displays error messages for failed keys
- Use this to verify your setup

## Failover Behavior

### When Keys Switch
1. **Quota Exceeded**: Automatically tries next key
2. **Rate Limiting**: Waits 1 second, tries next key
3. **General Errors**: Waits 0.5 seconds, tries next key
4. **Success**: Resets to primary key for next request

### Error Messages
- **All keys exhausted**: All API keys failed or reached quota
- **Quota exceeded**: All keys have reached their daily limits
- **Rate limited**: All keys are temporarily rate limited
- **Invalid keys**: One or more keys are invalid

## Best Practices

### Key Management
- Use 3-5 API keys for optimal redundancy
- Monitor usage across all keys
- Rotate keys periodically for security
- Keep backup keys for high-traffic periods

### Quota Management
- Each free Gemini API key has daily limits
- Paid keys have higher quotas
- Distribute usage across multiple keys
- Monitor quota usage in Google AI Studio

### Security
- Never commit API keys to version control
- Use environment variables only
- Regularly rotate keys
- Monitor for unusual usage patterns

## Troubleshooting

### Common Issues
1. **"No valid API keys found"**
   - Check .env file formatting
   - Ensure keys don't contain placeholder text
   - Verify key numbering starts from 1

2. **"All keys exhausted"**
   - Check quota limits in Google AI Studio
   - Verify keys are active and valid
   - Add more API keys

3. **Keys not loading**
   - Restart the server after updating .env
   - Check for typos in environment variable names
   - Ensure no spaces around = in .env file

### Testing Your Setup
1. Start the server
2. Check console logs for "Loaded X Gemini API key(s)"
3. Visit `/api-status` to test all keys
4. Try the CV tailoring feature
5. Monitor logs for failover messages

## Example Console Output

```
🔑 Loaded 3 Gemini API key(s)
   Key 1: AIzaSyCcg9...
   Key 2: AIzaSyD123...
   Key 3: AIzaSyE987...
🔧 Using API key 1 of 3

# During failover:
❌ API key 1 failed: QUOTA_EXCEEDED
🔄 Quota/rate limit detected, switching to next key...
🔄 Switching to API key 2
🤖 Attempt 2 with API key 2
✅ Request successful, resetting to primary key
```

This setup ensures your CV tailoring application remains available even when individual API keys hit their limits!
