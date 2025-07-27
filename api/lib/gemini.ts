import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI client with single API key (fallback behavior simplified)
const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1;
if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

export const gemini = new GoogleGenerativeAI(apiKey);
