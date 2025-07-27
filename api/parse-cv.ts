import { VercelRequest, VercelResponse } from '@vercel/node';

// Minimal serverless CV parsing fallback
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { cvText } = req.body;
  if (!cvText) {
    return res.status(400).json({ error: 'cvText is required' });
  }
  
  // Basic fallback parsing for serverless
  const lines = cvText.split('\n').map((line: string) => line.trim()).filter((line: string) => line);
  const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = cvText.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);
  
  const cvData = {
    name: lines[0] || 'Name not found',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    location: '',
    summary: 'Professional summary extracted from CV',
    experience: [{
      title: 'Experience details from CV',
      company: 'See full CV',
      duration: 'Various',
      description: 'Experience extracted from uploaded CV'
    }],
    skills: ['Skills extracted from CV'],
    education: [{
      degree: 'Education details from CV',
      institution: 'See full CV',
      year: 'Various'
    }]
  };
  
  res.status(200).json({ cvData });
}
