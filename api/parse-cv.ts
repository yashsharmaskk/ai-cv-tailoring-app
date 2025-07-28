import { VercelRequest, VercelResponse } from '@vercel/node';
import { callGeminiWithFailover } from './lib/gemini';
import { detectCountryFromCity, formatLocationWithCountry } from './lib/location';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { cvText } = req.body;
  
  console.log('Received CV parsing request');
  console.log('CV Text length:', cvText?.length);
  
  if (!cvText) {
    return res.status(400).json({ 
      error: 'Missing cvText' 
    });
  }

  try {
    const prompt = `Extract detailed structured data from this CV/resume and return it in valid JSON format. Analyze the content thoroughly and parse dates carefully:

CV TEXT:
${cvText}

Return ONLY a valid JSON object with this exact structure (no additional text or formatting):
{
  "name": "Full Name",
  "email": "email@example.com", 
  "phone": "phone number",
  "location": "city, state/province",
  "country": "country name if mentioned",
  "summary": "professional summary or objective",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "start_date": "Start date (MM/YYYY or Month Year)",
      "end_date": "End date (MM/YYYY or Month Year or 'Present')",
      "duration": "Total duration (e.g., 2 years 3 months)", 
      "description": "Detailed job description and key achievements",
      "skills_used": ["skill1", "skill2"],
      "achievements": ["achievement1", "achievement2"]
    }
  ],
  "skills": {
    "technical": ["programming languages, tools, technologies"],
    "soft": ["communication, leadership, etc"],
    "certifications": ["any certifications mentioned"]
  },
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "start_date": "Start date",
      "end_date": "End date or 'Present'",
      "year": "Year or duration",
      "gpa": "GPA if mentioned",
      "relevant_courses": ["course1", "course2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"],
      "start_date": "Start date",
      "end_date": "End date"
    }
  ],
  "languages": ["language1", "language2"],
  "years_of_experience": "estimated total years"
}`;

    console.log('Sending CV parsing request to Gemini with failover...');
    
    const response = await callGeminiWithFailover(prompt);
    let jsonText = response.text().trim();
    
    // Enhanced JSON cleaning to handle various AI response formats
    // Remove markdown code blocks
    jsonText = jsonText.replace(/^```json\s*/g, '').replace(/^```\s*/g, '');
    jsonText = jsonText.replace(/\s*```$/g, '');
    
    // Remove any leading/trailing text that's not JSON
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }
    
    // Remove any trailing commas before closing brackets/braces
    jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
    
    console.log('Received CV parsing response from Gemini');
    console.log('Parsed JSON preview:', jsonText.substring(0, 200) + '...');
    
    // Try to parse the JSON
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
      
      // Enhanced location processing with city-country detection
      if (parsedData.location) {
        const detectedCountry = detectCountryFromCity(parsedData.location);
        if (detectedCountry && !parsedData.country) {
          parsedData.country = detectedCountry;
        }
        
        // Format location with country if not already included
        parsedData.location = formatLocationWithCountry(parsedData.location, parsedData.country);
        
        console.log(`🌍 Location processed: ${parsedData.location}, Country: ${parsedData.country || 'Not detected'}`);
      } else {
        console.log('⚠️ No location found in CV');
      }
      
    } catch (parseError: any) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.error('Raw response length:', jsonText.length);
      console.error('Raw response preview:', jsonText.substring(0, 500) + '...');
      
      return res.status(500).json({ 
        error: 'CV parsing failed - invalid JSON response from AI',
        details: parseError.message,
        suggestion: 'The AI response could not be parsed. Please try again.'
      });
    }
    
    // Validate required fields
    if (!parsedData.name && !parsedData.email) {
      console.log('⚠️ No name or email found in parsed data');
      return res.status(422).json({ 
        error: 'CV parsing incomplete',
        details: 'Could not extract basic contact information',
        suggestion: 'Please ensure your CV contains clear contact information'
      });
    }
    
    console.log('✅ CV parsing successful');
    console.log('Parsed data keys:', Object.keys(parsedData));
    
    res.status(200).json({
      success: true,
      data: parsedData,
      metadata: {
        originalLength: cvText.length,
        parsedFields: Object.keys(parsedData).length,
        hasLocation: !!parsedData.location,
        hasExperience: !!(parsedData.experience && parsedData.experience.length > 0),
        hasEducation: !!(parsedData.education && parsedData.education.length > 0),
        hasSkills: !!(parsedData.skills && Object.keys(parsedData.skills).length > 0)
      }
    });
    
  } catch (error: any) {
    console.error('❌ CV parsing error:', error.message);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      error: 'CV parsing failed',
      details: error.message,
      suggestion: 'Please try again or check if the CV content is readable'
    });
  }
}
