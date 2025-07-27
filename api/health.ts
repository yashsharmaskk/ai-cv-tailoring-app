import { VercelRequest, VercelResponse } from '@vercel/node';

// Health check endpoint for serverless deployment
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  res.status(200).json({
    status: 'Serverless functions are running',
    timestamp: new Date().toISOString(),
    environment: 'serverless'
  });
}
