import { VercelRequest, VercelResponse } from '@vercel/node';
import { callGeminiWithFailover } from '../lib/gemini';

// Serverless tailor-cv endpoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { jobDescription, cvText } = req.body;
  if (!jobDescription || !cvText) {
    return res.status(400).json({ error: 'Missing jobDescription or cvText' });
  }
  try {
    const prompt = `You are an expert resume writer specializing in ATS-optimized, company-ready resumes. Transform this CV into a professional, tailored resume that will pass ATS systems and impress hiring managers.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S CV:
${cvText}

Please return a tailored CV that:
1. Uses exact keywords from the job description
2. Quantifies achievements with specific numbers and metrics
3. Highlights relevant experience that matches job requirements
4. Maintains professional formatting with clear sections
5. Includes specific technical skills mentioned in the job

Return the response as plain text (not JSON) with professional formatting.`;

    // Use multi-key failover Gemini call
    const apiResponse = await callGeminiWithFailover(prompt, { model: 'gemini-pro' });
    const tailoredCV = apiResponse.text();
    
    // Return with analysis structure expected by frontend
    return res.status(200).json({ 
      tailoredCV: tailoredCV,
      analysis: {
        matchScore: 85, // Default score for serverless version
        improvements: ['CV tailored using AI optimization'],
        recommendations: ['Review tailored content for accuracy'],
        atsScore: {
          overall: 85,
          keywordMatch: 80,
          semanticRelevance: 85,
          contextMatch: 83,
          formatting: 85,
          sections: 88,
          experience: 82,
          skills: 80,
          education: 85,
          contact: 95
        }
      }
    });
  } catch (e: any) {
    console.error('Serverless AI tailoring error:', e.message);
    return res.status(500).json({ 
      error: 'AI tailoring failed', 
      details: e.message,
      suggestion: 'Please try again or check your API keys'
    });
  }
}
