import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Load API keys from environment variables
  const geminiApiKeys: string[] = [];
  
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
    return res.status(500).json({
      error: 'No API keys configured',
      totalKeys: 0,
      activeKeys: 0,
      keyStatuses: []
    });
  }

  const keyStatuses = [];
  
  for (let i = 0; i < geminiApiKeys.length; i++) {
    try {
      const testGenAI = new GoogleGenerativeAI(geminiApiKeys[i]);
      const testModel = testGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Simple test prompt
      const result = await testModel.generateContent("Reply with just 'OK'");
      const response = await result.response;
      const text = response.text();
      
      keyStatuses.push({
        keyIndex: i + 1,
        status: 'active',
        preview: `${geminiApiKeys[i].substring(0, 10)}...`,
        testResponse: text.trim()
      });
    } catch (error: any) {
      keyStatuses.push({
        keyIndex: i + 1,
        status: 'failed',
        preview: `${geminiApiKeys[i].substring(0, 10)}...`,
        error: error.message
      });
    }
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    totalKeys: geminiApiKeys.length,
    activeKeys: keyStatuses.filter(k => k.status === 'active').length,
    keyStatuses
  });
}