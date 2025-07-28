import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Check if API keys are configured
  const hasApiKeys = !!(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1);
  
  // Count configured API keys
  let keyCount = 0;
  if (process.env.GEMINI_API_KEY) keyCount++;
  
  let keyIndex = 1;
  while (process.env[`GEMINI_API_KEY_${keyIndex}`]) {
    keyCount++;
    keyIndex++;
  }

  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      'cv-tailoring': 'operational',
      'pdf-extraction': 'operational',
      'cv-parsing': 'operational',
      'gemini-ai': hasApiKeys ? 'operational' : 'degraded'
    },
    configuration: {
      apiKeysConfigured: keyCount,
      hasBackupKeys: keyCount > 1,
      serverless: true
    },
    uptime: process.uptime ? Math.floor(process.uptime()) : 0
  };

  res.status(200).json(status);
}
