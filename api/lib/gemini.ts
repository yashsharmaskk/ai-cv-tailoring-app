import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Array to store all available API keys
const geminiApiKeys: string[] = [];
let currentKeyIndex = 0;

// Load API keys from environment variables
const loadApiKeys = () => {
  geminiApiKeys.length = 0; // Clear existing keys
  
  // Load primary key
  if (process.env.GEMINI_API_KEY) {
    geminiApiKeys.push(process.env.GEMINI_API_KEY);
  }
  
  // Load backup keys (GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
  let keyIndex = 1;
  while (process.env[`GEMINI_API_KEY_${keyIndex}`]) {
    geminiApiKeys.push(process.env[`GEMINI_API_KEY_${keyIndex}`]);
    keyIndex++;
  }
  
  if (geminiApiKeys.length === 0) {
    throw new Error('No Gemini API keys found. Please set GEMINI_API_KEY or GEMINI_API_KEY_1 environment variable.');
  }
  
  console.log(`🔑 Loaded ${geminiApiKeys.length} Gemini API key(s)`);
};

// Initialize API keys
loadApiKeys();

// Initialize Gemini client
let gemini: GoogleGenerativeAI;
let model: any;

const initializeGemini = (): boolean => {
  try {
    if (currentKeyIndex >= geminiApiKeys.length) {
      currentKeyIndex = 0;
    }
    
    gemini = new GoogleGenerativeAI(geminiApiKeys[currentKeyIndex]);
    model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log(`✅ Gemini initialized with key ${currentKeyIndex + 1}/${geminiApiKeys.length}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini:', error);
    return false;
  }
};

// Function to switch to next API key on failure
const switchToNextKey = (): boolean => {
  if (geminiApiKeys.length <= 1) {
    console.log('⚠️ No alternative API keys available');
    return false;
  }
  
  const oldIndex = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % geminiApiKeys.length;
  console.log(`🔄 Switching from key ${oldIndex + 1} to key ${currentKeyIndex + 1}`);
  
  const success = initializeGemini();
  if (success) {
    console.log('✅ Successfully switched to new key');
  } else {
    console.log('❌ Failed to initialize with new key');
  }
  return success;
};

// Function to make API calls with automatic failover
export const callGeminiWithFailover = async (prompt: string, maxRetries: number = geminiApiKeys.length) => {
  let lastError: any = null;
  
  console.log(`🔄 Starting failover process with ${geminiApiKeys.length} available keys`);
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (!model) {
        console.log(`🔧 Initializing model for attempt ${attempt + 1}`);
        if (!initializeGemini()) {
          throw new Error('No valid API keys available');
        }
      }
      
      console.log(`🤖 Attempt ${attempt + 1}/${maxRetries} with API key ${currentKeyIndex + 1}/${geminiApiKeys.length}`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Success - reset to first key for next request
      if (currentKeyIndex !== 0) {
        console.log('✅ Request successful, resetting to primary key');
        currentKeyIndex = 0;
        initializeGemini();
      } else {
        console.log('✅ Request successful with primary key');
      }
      
      return response;
      
    } catch (error: any) {
      console.error(`❌ API key ${currentKeyIndex + 1} failed:`, error.message);
      lastError = error;
      
      // Check if this is a quota/rate limit error
      const isQuotaError = error.message?.includes('quota') || 
                          error.message?.includes('QUOTA_EXCEEDED') ||
                          error.message?.includes('RATE_LIMIT_EXCEEDED') ||
                          error.message?.includes('429') ||
                          error.status === 429 ||
                          error.status === 403;
      
      const isInvalidKey = error.message?.includes('API_KEY_INVALID') ||
                          error.message?.includes('invalid') ||
                          error.status === 401;
      
      if ((isQuotaError || isInvalidKey) && attempt < maxRetries - 1) {
        console.log('🔄 Quota/rate/invalid key detected, switching to next key...');
        if (!switchToNextKey()) {
          console.log('❌ No more keys available to switch to');
          break;
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (attempt < maxRetries - 1) {
        console.log('🔄 General error, trying next key...');
        if (!switchToNextKey()) {
          console.log('❌ No more keys available to switch to');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  // All keys failed
  console.error('💥 All API keys exhausted');
  throw lastError || new Error('All Gemini API keys failed');
};

// Initialize with first key
initializeGemini();

export { gemini };
