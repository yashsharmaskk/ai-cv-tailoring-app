import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Gather all available Gemini API keys
const geminiApiKeys: string[] = [];
for (let i = 1; i <= 10; i++) {
  const key = process.env[`GEMINI_API_KEY_${i}`];
  if (key && key.length > 20 && !key.includes('your-')) {
    geminiApiKeys.push(key);
  }
}
if (geminiApiKeys.length === 0 && process.env.GEMINI_API_KEY) {
  geminiApiKeys.push(process.env.GEMINI_API_KEY);
}
if (geminiApiKeys.length === 0) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

// Failover function for Gemini API
export async function callGeminiWithFailover(prompt: string, options?: { model?: string, maxRetries?: number, generationConfig?: any }) {
  let lastError: any = null;
  const maxRetries = options?.maxRetries || geminiApiKeys.length;
  const modelName = options?.model || 'gemini-pro';
  const generationConfig = options?.generationConfig || {};

  for (let i = 0; i < Math.min(geminiApiKeys.length, maxRetries); i++) {
    const apiKey = geminiApiKeys[i];
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
      const result = await model.generateContent(prompt);
      return await result.response;
    } catch (error: any) {
      lastError = error;
      const msg = error?.message || '';
      const status = error?.status;
      const isQuotaError = msg.includes('quota') || msg.includes('QUOTA_EXCEEDED') || msg.includes('RATE_LIMIT_EXCEEDED') || msg.includes('429') || status === 429 || status === 403;
      const isInvalidKey = msg.includes('API_KEY_INVALID') || msg.includes('invalid') || status === 401;
      if (!(isQuotaError || isInvalidKey)) {
        break; // Not a failover error, don't try next key
      }
      // Otherwise, try next key
    }
  }
  throw lastError || new Error('All Gemini API keys failed');
}
