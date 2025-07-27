/**
 * CV Tailoring Application - Express.js Server
 * 
 * This server provides AI-powered CV tailoring capabilities using Google Gemini AI.
 * Features include:
 * - PDF text extraction from uploaded CVs
 * - AI-powered CV optimization based on job descriptions
 * - ATS (Applicant Tracking System) scoring
 * - Global location intelligence (300+ cities)
 * - Multiple API key failover for reliability
 * - Production-ready static file serving
 * 
 * @author Yash Sharma (yashsharmaskk) - CV Tailoring Team
 * @version 1.0.0
 * @repository https://github.com/yashsharmaskk/ai-cv-tailoring-app (origin)
 * @repository https://github.com/injobguru/cv-tailor (injobguru)
 */

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { detectCountryFromCity, formatLocationWithCountry } from './cityCountryDatabase.js';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

// ES module compatibility for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Google Gemini AI Configuration
 * 
 * This section handles multiple API key management for high availability.
 * The system automatically fails over to backup keys if the primary key
 * encounters rate limits or errors.
 */

// Array to store all available API keys
const geminiApiKeys = [];
let currentKeyIndex = 0; // Index of currently active API key

/**
 * Load API keys from environment variables
 * Supports up to 10 API keys (GEMINI_API_KEY_1 through GEMINI_API_KEY_10)
 * Filters out placeholder values and validates key length
 */
for (let i = 1; i <= 10; i++) {
  const key = process.env[`GEMINI_API_KEY_${i}`];
  if (key && 
      key !== 'your-second-api-key-here' && 
      key !== 'your-third-api-key-here' && 
      key !== 'your-fourth-api-key-here' && 
      !key.includes('your-') && 
      key.length > 20) {
    geminiApiKeys.push(key);
  }
}

// Fallback to single key if no numbered keys found
if (geminiApiKeys.length === 0 && process.env.GEMINI_API_KEY) {
  geminiApiKeys.push(process.env.GEMINI_API_KEY);
}

console.log(`🔑 Loaded ${geminiApiKeys.length} Gemini API key(s)`);
geminiApiKeys.forEach((key, index) => {
  console.log(`   Key ${index + 1}: ${key.substring(0, 10)}...`);
});

// Initialize with first available key
let genAI = null;
let model = null;

function initializeGemini() {
  if (geminiApiKeys.length === 0) {
    console.error('❌ No valid Gemini API keys found!');
    return false;
  }
  
  const currentKey = geminiApiKeys[currentKeyIndex];
  genAI = new GoogleGenerativeAI(currentKey);
  model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
    }
  });
  
  console.log(`🔧 Using API key ${currentKeyIndex + 1} of ${geminiApiKeys.length}`);
  return true;
}

// Function to switch to next API key on failure
function switchToNextKey() {
  if (geminiApiKeys.length <= 1) {
    console.log('⚠️ No alternative API keys available');
    return false;
  }
  
  const oldIndex = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % geminiApiKeys.length;
  console.log(`🔄 Switching from key ${oldIndex + 1} to key ${currentKeyIndex + 1}`);
  console.log(`🔑 New key: ${geminiApiKeys[currentKeyIndex].substring(0, 15)}...`);
  
  const success = initializeGemini();
  if (success) {
    console.log('✅ Successfully switched to new key');
  } else {
    console.log('❌ Failed to initialize with new key');
  }
  return success;
}

// Function to make API calls with automatic failover
async function callGeminiWithFailover(prompt, maxRetries = geminiApiKeys.length) {
  let lastError = null;
  
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
      console.log(`🔑 Using key: ${geminiApiKeys[currentKeyIndex].substring(0, 15)}...`);
      
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
      
    } catch (error) {
      console.error(`❌ API key ${currentKeyIndex + 1} failed:`, error.message);
      console.error(`🔍 Error details:`, error.status, error.code);
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
      
      console.log(`🔍 Error type analysis: quota=${isQuotaError}, invalid=${isInvalidKey}`);
      
      if ((isQuotaError || isInvalidKey) && attempt < maxRetries - 1) {
        console.log('🔄 Quota/rate/invalid key detected, switching to next key...');
        if (!switchToNextKey()) {
          console.log('❌ No more keys available to switch to');
          break; // No more keys to try
        }
        // Wait a bit before retrying
        console.log('⏳ Waiting 1 second before retry...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (attempt < maxRetries - 1) {
        console.log('🔄 General error, trying next key...');
        if (!switchToNextKey()) {
          console.log('❌ No more keys available to switch to');
          break;
        }
        console.log('⏳ Waiting 0.5 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  // All keys failed
  console.error('💥 All API keys exhausted');
  console.error('📋 Final error:', lastError?.message);
  throw lastError || new Error('All Gemini API keys failed');
}

// Initialize with first key
initializeGemini();

const app = express();

// Enhanced CORS configuration for production deployment
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    /^https:\/\/.*\.onrender\.com$/,  // Allow Render domains
    /^https:\/\/.*\.render\.com$/,    // Allow legacy Render domains
    /^https:\/\/.*\.railway\.app$/,   // Allow Railway domains
    /^https:\/\/.*\.vercel\.app$/,    // Allow Vercel domains
    /^https:\/\/.*\.herokuapp\.com$/  // Allow Heroku domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' })); // Parse JSON bodies

// Serve static files in production (Render deployment)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Serve index.html for root route in production
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

app.post('/extract-text', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer, {
      normalizeWhitespace: true,
      disableCombineTextItems: false
    });
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    // Validate extracted text
    const text = data.text.trim();
    if (text.length < 10 || !/[a-zA-Z]/.test(text)) {
      return res.status(422).json({ 
        error: 'Could not extract readable text from PDF',
        suggestion: 'This might be an image-based PDF. Please copy and paste the text manually.'
      });
    }
    
    res.json({ text: data.text });
  } catch (err) {
    console.error('PDF parsing error:', err);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to extract PDF text',
      details: err.message,
      suggestion: 'Please try copying and pasting the text manually.'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    apiKeys: {
      total: geminiApiKeys.length,
      current: currentKeyIndex + 1,
      keys: geminiApiKeys.map((key, index) => ({
        id: index + 1,
        preview: `${key.substring(0, 10)}...`,
        active: index === currentKeyIndex
      }))
    }
  });
});

// New endpoint to test API key connectivity
app.get('/api-status', async (req, res) => {
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
    } catch (error) {
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
    currentKey: currentKeyIndex + 1,
    keyStatuses
  });
});

// Test endpoint to manually switch keys
app.post('/switch-key', (req, res) => {
  const oldIndex = currentKeyIndex;
  const success = switchToNextKey();
  
  res.json({
    success,
    oldKey: oldIndex + 1,
    newKey: currentKeyIndex + 1,
    totalKeys: geminiApiKeys.length,
    message: success ? `Switched from key ${oldIndex + 1} to key ${currentKeyIndex + 1}` : 'No more keys available'
  });
});

// Test endpoint to force a quota error and test failover
app.post('/test-failover', async (req, res) => {
  try {
    // This will use the failover system
    const testPrompt = "Test prompt to check API key failover system. Reply with the current time.";
    const response = await callGeminiWithFailover(testPrompt);
    const text = response.text();
    
    res.json({
      success: true,
      response: text,
      usedKey: currentKeyIndex + 1,
      totalKeys: geminiApiKeys.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      usedKey: currentKeyIndex + 1,
      totalKeys: geminiApiKeys.length
    });
  }
});

// CV parsing endpoint to extract structured data
app.post('/parse-cv', async (req, res) => {
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
    
    // Clean up the response to ensure valid JSON
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
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
      
    } catch (parseError) {
      console.error('JSON parsing failed, using fallback:', parseError);
      // Fallback parsing
      parsedData = parseCV(cvText);
      
      // Apply location enhancement to fallback data too
      if (parsedData.location) {
        const detectedCountry = detectCountryFromCity(parsedData.location);
        if (detectedCountry && !parsedData.country) {
          parsedData.country = detectedCountry;
        }
        parsedData.location = formatLocationWithCountry(parsedData.location, parsedData.country);
      }
    }
    
    res.json({ cvData: parsedData });

  } catch (error) {
    console.error('CV parsing error:', error.message);
    
    // Fallback to basic text parsing
    const fallbackData = parseCV(cvText);
    res.json({ cvData: fallbackData });
  }
});

// Enhanced fallback CV parsing function
function parseCV(cvText) {
  const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
  const lowerText = cvText.toLowerCase();
  
  // Basic extraction patterns
  const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = cvText.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);
  
  // Extract name (usually first non-empty line that doesn't contain common CV headers)
  const name = lines.find(line => 
    !line.toLowerCase().includes('resume') && 
    !line.toLowerCase().includes('curriculum') &&
    !line.toLowerCase().includes('cv') &&
    line.length > 2
  ) || 'Name not found';
  
  // Enhanced skills extraction
  const technicalSkills = [];
  const softSkills = [];
  
  const techKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'typescript', 'html', 'css', 
    'sql', 'git', 'aws', 'docker', 'kubernetes', 'angular', 'vue', 'c++', 'c#',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'mongodb', 'postgresql',
    'mysql', 'redis', 'nginx', 'apache', 'linux', 'windows', 'macos', 'figma', 'photoshop'
  ];
  
  const softSkillKeywords = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
    'creative', 'organized', 'detail oriented', 'time management', 'adaptable'
  ];
  
  techKeywords.forEach(skill => {
    if (lowerText.includes(skill)) {
      technicalSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  softSkillKeywords.forEach(skill => {
    if (lowerText.includes(skill)) {
      softSkills.push(skill.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '));
    }
  });
  
  // Extract years of experience
  const expMatch = cvText.match(/(\d+)[\+\s]*years?\s+(?:of\s+)?experience/i);
  const yearsExp = expMatch ? expMatch[1] : 'Not specified';
  
  // Extract education info
  const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college'];
  const educationLines = lines.filter(line => 
    educationKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );
  
  return {
    name: name,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0].trim() : '',
    location: '',
    summary: 'Professional summary extracted from CV',
    experience: [{
      title: 'Experience details from CV',
      company: 'See full CV',
      start_date: 'Various',
      end_date: 'Various',
      duration: 'Various',
      description: 'Experience extracted from uploaded CV',
      skills_used: technicalSkills.slice(0, 5),
      achievements: ['Achievement details in uploaded CV']
    }],
    skills: {
      technical: technicalSkills,
      soft: softSkills,
      certifications: []
    },
    education: educationLines.length > 0 ? 
      educationLines.map(line => ({
        degree: line,
        institution: 'See full CV',
        start_date: 'Various',
        end_date: 'Various',
        year: 'Various',
        gpa: '',
        relevant_courses: []
      })) : 
      [{
        degree: 'Education details from CV',
        institution: 'See full CV',
        start_date: 'Various',
        end_date: 'Various',
        year: 'Various',
        gpa: '',
        relevant_courses: []
      }],
    projects: [],
    languages: [],
    years_of_experience: yearsExp
  };
}

// Advanced ATS scoring function with enhanced sensitivity and realistic improvements
async function calculateATSScore(cvText, jobDescription, matchedKeywords, allKeywords) {
  const cvLower = cvText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // 1. Enhanced keyword matching (30% weight) - increased weight and sensitivity
  let keywordScore = 0;
  if (allKeywords.length > 0) {
    const keywordRatio = matchedKeywords.length / allKeywords.length;
    // Enhanced scoring with better progression
    if (keywordRatio >= 0.8) keywordScore = 95;
    else if (keywordRatio >= 0.7) keywordScore = 85;
    else if (keywordRatio >= 0.6) keywordScore = 75;
    else if (keywordRatio >= 0.5) keywordScore = 65;
    else if (keywordRatio >= 0.4) keywordScore = 55;
    else if (keywordRatio >= 0.3) keywordScore = 45;
    else keywordScore = Math.max(keywordRatio * 100, 20);
  }
  
  // 2. AI-powered semantic relevance analysis (25% weight)
  const semanticAnalysisResult = await calculateAISemanticRelevance(cvText, jobDescription);
  const semanticScore = typeof semanticAnalysisResult === 'object' ? semanticAnalysisResult.score : semanticAnalysisResult;
  
  // 3. AI-powered context matching (25% weight)
  const contextAnalysisResult = await calculateAIContextMatching(cvText, jobDescription);
  const contextScore = typeof contextAnalysisResult === 'object' ? contextAnalysisResult.score : contextAnalysisResult;
  
  // 4. Enhanced formatting score (10% weight)
  const formattingScore = calculateEnhancedFormattingScore(cvText);
  
  // 5. Enhanced content quality score (10% weight)
  const contentScore = calculateEnhancedContentScore(cvText, jobDescription);
  
  // Calculate weighted overall score with better distribution
  const overall = Math.round(
    (keywordScore * 0.30) + 
    (semanticScore * 0.25) + 
    (contextScore * 0.25) + 
    (formattingScore * 0.10) + 
    (contentScore * 0.10)
  );

  return {
    overall: Math.min(overall, 100),
    keywordMatch: Math.round(keywordScore),
    semanticRelevance: Math.round(semanticScore),
    contextMatch: Math.round(contextScore),
    formatting: Math.round(formattingScore),
    sections: calculateSectionScore(cvText),
    experience: calculateExperienceRelevance(cvText, jobDescription),
    skills: Math.round(keywordScore),
    education: calculateEducationRelevance(cvText, jobDescription),
    contact: hasContactInfo(cvText),
    // Enhanced AI insights
    aiInsights: {
      semantic: typeof semanticAnalysisResult === 'object' ? semanticAnalysisResult.insights : null,
      context: typeof contextAnalysisResult === 'object' ? contextAnalysisResult.insights : null,
      improvement: calculateImprovementPotential(cvText, jobDescription)
    }
  };
}

// Enhanced formatting score calculation
function calculateEnhancedFormattingScore(cvText) {
  const cvLower = cvText.toLowerCase();
  let score = 0;
  
  // Check for essential sections (20 points each)
  const essentialSections = ['summary', 'experience', 'skills', 'education'];
  const foundSections = essentialSections.filter(section => 
    cvLower.includes(section) || 
    cvLower.includes(section.replace('summary', 'objective')) ||
    cvLower.includes(section.replace('experience', 'work')) ||
    cvLower.includes('professional ' + section)
  );
  score += (foundSections.length / essentialSections.length) * 40;
  
  // Check for professional formatting indicators (10 points each)
  const formatIndicators = [
    /\*\*[^*]+\*\*/.test(cvText), // Bold formatting
    /\d{2}\/\d{4}/.test(cvText) || /\d{4}\s*-\s*\d{4}/.test(cvText), // Date formatting
    /•|·|-\s/.test(cvText), // Bullet points
    /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cvText), // Email
    /\+?\d[\d\s\-\(\)]{8,}/.test(cvText) // Phone
  ];
  score += formatIndicators.filter(Boolean).length * 10;
  
  // Bonus for professional structure (10 points)
  if (cvText.includes('PROFESSIONAL') || cvText.includes('CORE') || cvText.includes('TECHNICAL')) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

// Enhanced content quality score
function calculateEnhancedContentScore(cvText, jobDescription) {
  let score = 0;
  
  // Quantified achievements (25 points)
  const quantifiedAchievements = (cvText.match(/\d+[\%\$\+]|\d+\s*(million|thousand|k\b|years?|months?|projects?|users?|clients?|revenue|sales|growth|improvement|increase|decrease)/gi) || []).length;
  score += Math.min(quantifiedAchievements * 4, 25);
  
  // Action verbs (20 points)
  const actionVerbs = ['developed', 'led', 'managed', 'created', 'implemented', 'improved', 'designed', 'built', 'optimized', 'delivered', 'achieved', 'increased', 'reduced', 'streamlined'];
  const usedVerbs = actionVerbs.filter(verb => cvText.toLowerCase().includes(verb));
  score += Math.min(usedVerbs.length * 2, 20);
  
  // Technical depth (20 points)
  const technicalTerms = extractTechnicalTerms(jobDescription);
  const cvHasTech = technicalTerms.filter(term => cvText.toLowerCase().includes(term.toLowerCase())).length;
  score += Math.min((cvHasTech / Math.max(technicalTerms.length, 1)) * 20, 20);
  
  // Professional language (15 points)
  const professionalTerms = ['responsible', 'collaborated', 'coordinated', 'facilitated', 'spearheaded', 'executed', 'strategic', 'innovative', 'successful'];
  const usedProfTerms = professionalTerms.filter(term => cvText.toLowerCase().includes(term));
  score += Math.min(usedProfTerms.length * 2, 15);
  
  // Project detail bonus (20 points) - NEW
  const projectSections = (cvText.match(/\*\*[^*]+\*\*\s*\n[•\-]/g) || []).length; // Projects with bullet points
  const projectBullets = (cvText.match(/[•\-]\s*\*\*[^*]+\*\*/g) || []).length; // Bold bullet points
  const projectScore = Math.min((projectSections * 5) + (projectBullets * 2), 20);
  score += projectScore;
  
  return Math.min(score, 100);
}

// Calculate section quality score
function calculateSectionScore(cvText) {
  const sections = ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'];
  const foundSections = sections.filter(section => cvText.toLowerCase().includes(section));
  return Math.round((foundSections.length / sections.length) * 100);
}

// Extract technical terms from job description
function extractTechnicalTerms(jobDescription) {
  const techPatterns = [
    // Programming languages
    /\b(javascript|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin|typescript|scala|r|sql)\b/gi,
    // Frameworks and libraries
    /\b(react|angular|vue|node|express|django|flask|spring|laravel|rails|jquery|bootstrap)\b/gi,
    // Tools and platforms
    /\b(git|docker|kubernetes|aws|azure|gcp|jenkins|terraform|ansible|mongodb|postgresql|mysql|redis)\b/gi,
    // Methodologies
    /\b(agile|scrum|kanban|devops|ci\/cd|tdd|microservices|rest|api|json|xml)\b/gi
  ];
  
  const terms = [];
  techPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern) || [];
    terms.push(...matches);
  });
  
  return [...new Set(terms.map(term => term.toLowerCase()))];
}

// Calculate improvement potential
function calculateImprovementPotential(cvText, jobDescription) {
  const improvements = [];
  
  // Keyword analysis
  const jobKeywords = extractJobKeywords(jobDescription);
  const cvKeywords = extractCVKeywords(cvText);
  const missingKeywords = jobKeywords.filter(keyword => 
    !cvKeywords.some(cvKeyword => cvKeyword.toLowerCase().includes(keyword.toLowerCase()))
  );
  
  if (missingKeywords.length > 0) {
    improvements.push(`Could add ${missingKeywords.length} key terms: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  
  // Quantification opportunities
  const hasNumbers = (cvText.match(/\d+/g) || []).length;
  if (hasNumbers < 5) {
    improvements.push('Add more quantified achievements with specific metrics');
  }
  
  // Technical depth
  const techTerms = extractTechnicalTerms(jobDescription);
  const cvTechCount = techTerms.filter(term => cvText.toLowerCase().includes(term)).length;
  if (cvTechCount < techTerms.length * 0.7) {
    improvements.push('Highlight more technical skills and tools mentioned in job');
  }
  
  return improvements.join('; ');
}

// Extract job keywords more intelligently
function extractJobKeywords(jobDescription) {
  const keywords = [];
  
  // Extract from requirements sections
  const requirementSections = jobDescription.match(/(?:requirements?|qualifications?|skills?|experience)[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/gis);
  if (requirementSections) {
    requirementSections.forEach(section => {
      const words = section.match(/\b[a-zA-Z]{3,}\b/g) || [];
      keywords.push(...words);
    });
  }
  
  // Extract technical terms
  keywords.push(...extractTechnicalTerms(jobDescription));
  
  // Extract important phrases
  const phrases = jobDescription.match(/\b(?:experience with|knowledge of|proficient in|familiar with|expertise in)\s+([^.]{5,30})/gi) || [];
  phrases.forEach(phrase => {
    const extracted = phrase.replace(/^(experience with|knowledge of|proficient in|familiar with|expertise in)\s+/i, '');
    keywords.push(...extracted.split(/[,\s]+/).filter(word => word.length > 2));
  });
  
  return [...new Set(keywords.map(k => k.toLowerCase()))].filter(k => k.length > 2);
}

// Extract CV keywords
function extractCVKeywords(cvText) {
  return cvText.match(/\b[a-zA-Z]{3,}\b/g) || [];
}

// AI-powered semantic relevance analysis using Gemini with enhanced sensitivity
async function calculateAISemanticRelevance(cvText, jobDescription) {
  try {
    const prompt = `You are an expert ATS analyzer with deep understanding of job-CV matching. Analyze the semantic relevance between this CV and job description. Be sensitive to improvements and provide realistic scoring.

JOB DESCRIPTION:
${jobDescription}

CV CONTENT:
${cvText}

ANALYSIS CRITERIA (Score each 0-100):
1. Technical domain alignment - Does CV demonstrate expertise in the exact technical areas required?
2. Seniority level matching - Does experience level match job requirements?
3. Industry context - Does CV show relevant industry experience and understanding?
4. Methodology alignment - Are the right approaches and frameworks mentioned?
5. Technology stack coherence - How well do the technologies align?
6. Role responsibility overlap - Do past responsibilities match future ones?

SCORING GUIDELINES:
- 90-100: Perfect alignment, ideal candidate
- 80-89: Strong match with minor gaps
- 70-79: Good match with some areas to improve
- 60-69: Decent match but needs development
- 50-59: Some relevance but significant gaps
- Below 50: Poor match

Return ONLY this JSON structure:
{
  "semanticScore": [number 0-100],
  "domainAlignment": [number 0-100],
  "seniorityMatch": [number 0-100],
  "industryFit": [number 0-100],
  "methodologyMatch": [number 0-100],
  "techStackCoherence": [number 0-100],
  "analysis": "2-3 sentence explanation of the semantic alignment and key strengths/gaps"
}`;

    const response = await callGeminiWithFailover(prompt);
    let jsonText = response.text().trim();
    
    // Clean up response
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const semanticAnalysis = JSON.parse(jsonText);
    console.log('AI Semantic Analysis:', semanticAnalysis.semanticScore, '%');
    
    // Return both score and insights
    return {
      score: semanticAnalysis.semanticScore || 75,
      insights: semanticAnalysis.analysis || 'AI semantic analysis completed',
      details: semanticAnalysis
    };
    
  } catch (error) {
    console.error('AI Semantic Analysis error:', error.message);
    // Enhanced fallback to basic analysis
    return calculateBasicSemanticRelevance(cvText, jobDescription);
  }
}

// AI-powered context matching analysis using Gemini with enhanced sensitivity
async function calculateAIContextMatching(cvText, jobDescription) {
  try {
    const prompt = `You are an expert recruiter analyzing CV-job fit with focus on context and real-world applicability. Evaluate how well this candidate's background fits the specific job context.

JOB POSTING:
${jobDescription}

CANDIDATE CV:
${cvText}

CONTEXT ANALYSIS AREAS (Score each 0-100):
1. Experience level vs requirements - Do years and complexity of experience match?
2. Project scale alignment - Has candidate worked at similar scale (startup vs enterprise)?
3. Work environment fit - Does background suggest fit for company culture/environment?
4. Industry-specific experience - Has candidate worked in similar industries/domains?
5. Problem-solving approach - Do past solutions align with likely future challenges?
6. Career progression logic - Does career path make sense for this next role?

SCORING GUIDELINES:
- 90-100: Exceptional fit, candidate background perfectly aligns
- 80-89: Strong contextual match with minor considerations
- 70-79: Good fit with some context gaps to bridge
- 60-69: Adequate match but some experience gaps
- 50-59: Some contextual fit but significant adjustments needed
- Below 50: Poor contextual alignment

Return ONLY this JSON structure:
{
  "contextScore": [number 0-100],
  "experienceAlignment": [number 0-100],
  "scaleMatch": [number 0-100],
  "environmentFit": [number 0-100],
  "industryExperience": [number 0-100],
  "problemSolvingFit": [number 0-100],
  "insights": "2-3 sentence assessment of contextual fit and key considerations"
}`;

    const response = await callGeminiWithFailover(prompt);
    let jsonText = response.text().trim();
    
    // Clean up response
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const contextAnalysis = JSON.parse(jsonText);
    console.log('AI Context Analysis:', contextAnalysis.contextScore, '%');
    
    // Return both score and insights
    return {
      score: contextAnalysis.contextScore || 70,
      insights: contextAnalysis.insights || 'AI context analysis completed',
      details: contextAnalysis
    };
    
  } catch (error) {
    console.error('AI Context Analysis error:', error.message);
    // Enhanced fallback to basic analysis
    return calculateBasicContextMatching(cvText, jobDescription);
  }
}

// Enhanced fallback semantic relevance (more sensitive to improvements)
function calculateBasicSemanticRelevance(cvText, jobDescription) {
  const cvLower = cvText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Enhanced technology domain analysis with more domains
  const techDomains = {
    'web development': ['html', 'css', 'javascript', 'react', 'angular', 'vue', 'node', 'express', 'php', 'django', 'flask', 'nextjs', 'nuxt'],
    'data science': ['python', 'r', 'sql', 'pandas', 'numpy', 'machine learning', 'tensorflow', 'pytorch', 'data analysis', 'jupyter', 'scikit', 'keras'],
    'mobile development': ['ios', 'android', 'swift', 'kotlin', 'react native', 'flutter', 'xamarin', 'cordova', 'ionic'],
    'devops': ['docker', 'kubernetes', 'aws', 'azure', 'jenkins', 'terraform', 'ansible', 'chef', 'puppet', 'gitlab', 'circleci'],
    'backend': ['api', 'database', 'server', 'microservices', 'rest', 'graphql', 'mongodb', 'postgresql', 'mysql', 'redis'],
    'frontend': ['ui', 'ux', 'responsive', 'design', 'user interface', 'user experience', 'figma', 'sketch', 'photoshop'],
    'cloud': ['aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda', 's3', 'ec2', 'kubernetes', 'docker'],
    'ai/ml': ['artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'nlp', 'computer vision', 'ai', 'ml']
  };
  
  let domainMatches = 0;
  let totalDomains = 0;
  let domainStrength = 0;
  
  for (const [domain, keywords] of Object.entries(techDomains)) {
    const jobHasDomain = keywords.some(keyword => jobLower.includes(keyword));
    if (jobHasDomain) {
      totalDomains++;
      const cvMatches = keywords.filter(keyword => cvLower.includes(keyword)).length;
      if (cvMatches > 0) {
        domainMatches++;
        // Bonus for multiple keywords in same domain
        domainStrength += Math.min(cvMatches / keywords.length, 1) * 100;
      }
    }
  }
  
  // Enhanced role level analysis
  const seniorityLevels = {
    'senior': ['senior', 'lead', 'principal', 'architect', 'manager', 'director', 'head', 'chief'],
    'mid': ['developer', 'engineer', 'analyst', 'specialist', 'consultant', 'coordinator'],
    'junior': ['junior', 'associate', 'intern', 'entry', 'graduate', 'trainee', 'assistant']
  };
  
  let levelMatch = 0;
  let levelBonus = 0;
  
  for (const [level, terms] of Object.entries(seniorityLevels)) {
    const jobHasLevel = terms.some(term => jobLower.includes(term));
    const cvHasLevel = terms.some(term => cvLower.includes(term));
    const cvLevelCount = terms.filter(term => cvLower.includes(term)).length;
    
    if (jobHasLevel && cvHasLevel) {
      levelMatch = 85;
      levelBonus = Math.min(cvLevelCount * 5, 15); // Bonus for multiple level indicators
      break;
    } else if (jobHasLevel) {
      levelMatch = 40; // Partial credit if job requires level but CV doesn't show it clearly
    }
  }
  
  // Industry-specific terminology bonus
  const industryTerms = extractIndustryTerms(jobDescription);
  const cvHasIndustryTerms = industryTerms.filter(term => cvLower.includes(term.toLowerCase())).length;
  const industryScore = industryTerms.length > 0 ? (cvHasIndustryTerms / industryTerms.length) * 100 : 50;
  
  // Calculate final score with enhanced weighting
  const domainScore = totalDomains > 0 ? (domainStrength / totalDomains) : 50;
  const finalLevelScore = Math.min(levelMatch + levelBonus, 100);
  
  // Weighted combination with industry bonus
  let finalScore = Math.round(
    (domainScore * 0.5) + 
    (finalLevelScore * 0.3) + 
    (industryScore * 0.2)
  );
  
  // Ensure minimum improvement potential for tailored CVs
  if (cvText.includes('**') && cvText.length > 1000) {
    finalScore = Math.max(finalScore, 65); // Tailored CVs should score at least 65
  }
  
  return Math.min(finalScore, 100);
}

// Extract industry-specific terms
function extractIndustryTerms(jobDescription) {
  const industryPatterns = [
    // Fintech
    /\b(fintech|financial|banking|payment|blockchain|cryptocurrency|trading|investment|insurance|lending)\b/gi,
    // Healthcare
    /\b(healthcare|medical|hospital|patient|clinical|pharmaceutical|biotech|telemedicine|hipaa)\b/gi,
    // E-commerce
    /\b(e-commerce|ecommerce|retail|marketplace|shopping|payment|logistics|fulfillment|inventory)\b/gi,
    // SaaS/Enterprise
    /\b(saas|enterprise|b2b|b2c|crm|erp|analytics|dashboard|reporting|automation)\b/gi,
    // Startups
    /\b(startup|agile|mvp|scale|growth|venture|seed|series|funding|pivot)\b/gi,
    // Gaming
    /\b(gaming|game|unity|unreal|3d|graphics|multiplayer|mobile games)\b/gi
  ];
  
  const terms = [];
  industryPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern) || [];
    terms.push(...matches);
  });
  
  return [...new Set(terms)];
}

// Fallback context matching analysis
function calculateBasicContextMatching(cvText, jobDescription) {
  const cvSentences = cvText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const jobSentences = jobDescription.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  let contextMatches = 0;
  const contextPatterns = [
    // Experience patterns
    /(\d+)\s*\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/gi,
    // Technology combinations
    /(react|angular|vue)\s*(and|with|&|\+)\s*(node|express|django)/gi,
    // Methodology patterns
    /(agile|scrum|kanban|waterfall)/gi,
    // Industry patterns
    /(fintech|healthcare|e-commerce|saas|b2b|b2c)/gi,
    // Scale patterns
    /(large.scale|enterprise|startup|small.team)/gi
  ];
  
  for (const pattern of contextPatterns) {
    const jobMatches = (jobDescription.match(pattern) || []).length;
    const cvMatches = (cvText.match(pattern) || []).length;
    if (jobMatches > 0 && cvMatches > 0) {
      contextMatches += Math.min(cvMatches, jobMatches);
    }
  }
  
  // Semantic phrase matching
  const commonPhrases = extractImportantPhrases(jobDescription);
  let phraseMatches = 0;
  
  for (const phrase of commonPhrases) {
    if (cvText.toLowerCase().includes(phrase.toLowerCase())) {
      phraseMatches++;
    }
  }
  
  const contextScore = Math.min((contextMatches * 20) + (phraseMatches * 10), 100);
  return contextScore;
}

// Extract important phrases from job description
function extractImportantPhrases(jobDescription) {
  const text = jobDescription.toLowerCase();
  const phrases = [];
  
  // Look for requirement patterns
  const requirementPatterns = [
    /(?:experience with|proficient in|knowledge of|familiar with)\s+([^.]{10,50})/gi,
    /(?:must have|required|essential)\s+([^.]{10,50})/gi,
    /(?:responsible for|will be|duties include)\s+([^.]{10,50})/gi
  ];
  
  for (const pattern of requirementPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        phrases.push(match[1].trim());
      }
    }
  }
  
  return phrases.slice(0, 10); // Limit to prevent performance issues
}

// Calculate experience relevance
function calculateExperienceRelevance(cvText, jobDescription) {
  const cvLower = cvText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Extract years of experience from job description
  const jobYearsMatch = jobDescription.match(/(\d+)\s*\+?\s*(years?|yrs?)/i);
  const requiredYears = jobYearsMatch ? parseInt(jobYearsMatch[1]) : 0;
  
  // Extract years from CV
  const cvYearsMatches = cvText.match(/(\d+)\s*\+?\s*(years?|yrs?)/gi) || [];
  const cvYears = cvYearsMatches.map(match => parseInt(match.match(/\d+/)[0]));
  const maxCvYears = cvYears.length > 0 ? Math.max(...cvYears) : 0;
  
  // Calculate experience match
  if (requiredYears === 0) return 80; // No specific requirement
  if (maxCvYears >= requiredYears) return 100;
  if (maxCvYears >= requiredYears * 0.8) return 85;
  if (maxCvYears >= requiredYears * 0.6) return 70;
  return 50;
}

// Calculate education relevance
function calculateEducationRelevance(cvText, jobDescription) {
  const cvLower = cvText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  const educationKeywords = [
    'bachelor', 'master', 'phd', 'degree', 'computer science', 'engineering',
    'information technology', 'mathematics', 'software', 'certification'
  ];
  
  const jobEducationTerms = educationKeywords.filter(term => jobLower.includes(term));
  const cvEducationTerms = educationKeywords.filter(term => cvLower.includes(term));
  
  if (jobEducationTerms.length === 0) return 80; // No specific requirement
  
  const matchRatio = cvEducationTerms.length / jobEducationTerms.length;
  return Math.min(matchRatio * 100, 100);
}

// Check contact information
function hasContactInfo(cvText) {
  const hasEmail = /@/.test(cvText);
  const hasPhone = /[\d\-\(\)\+\s]{10,}/.test(cvText);
  return hasEmail && hasPhone ? 100 : (hasEmail || hasPhone ? 70 : 30);
}

// Generate improvements function
function generateImprovements(cvText, jobDescription, missingKeywords, newlyAdded) {
  const improvements = [];
  
  if (missingKeywords.length > 0) {
    improvements.push(`Add ${missingKeywords.length} missing keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  
  if (newlyAdded.length > 0) {
    improvements.push(`✅ Successfully added ${newlyAdded.length} relevant keywords`);
  }
  
  const hasQuantifiedResults = (cvText.match(/\d+[\%\$]|\d+\s+(years?|months?)/gi) || []).length;
  if (hasQuantifiedResults < 3) {
    improvements.push('Add more quantified achievements (numbers, percentages, metrics)');
  }
  
  const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'improved'];
  const usedVerbs = actionVerbs.filter(verb => cvText.toLowerCase().includes(verb));
  if (usedVerbs.length < 3) {
    improvements.push('Use more action verbs to start bullet points');
  }
  
  return improvements;
}

// Generate recommendations function
function generateRecommendations(cvText, jobDescription, atsScore) {
  const recommendations = [];
  
  if (atsScore.overall < 80) {
    recommendations.push('Overall ATS score needs improvement');
  }
  
  if (atsScore.keywordMatch < 70) {
    recommendations.push('Include more job-specific keywords from the description');
  }
  
  if (atsScore.formatting < 80) {
    recommendations.push('Improve resume structure with clear sections');
  }
  
  if (atsScore.content < 75) {
    recommendations.push('Add more quantified achievements and action verbs');
  }
  
  recommendations.push('Review the tailored content for accuracy');
  recommendations.push('Verify all achievements and dates are correct');
  
  return recommendations;
}

// AI-powered CV tailoring endpoint using Google Gemini
app.post('/ai/tailor-cv', async (req, res) => {
  const { jobDescription, cvText } = req.body;
  
  console.log('Received CV tailoring request');
  console.log('Job Description length:', jobDescription?.length);
  console.log('CV Text length:', cvText?.length);
  
  if (!jobDescription || !cvText) {
    return res.status(400).json({ 
      error: 'Missing jobDescription or cvText' 
    });
  }

  try {
    // Parse CV to extract location and contact information
    let cvData = null;
    try {
      const parsePrompt = `Extract basic contact information from this CV/resume and return it in valid JSON format:

CV TEXT:
${cvText}

Return ONLY a valid JSON object with this structure:
{
  "name": "Full Name",
  "email": "email@example.com", 
  "phone": "phone number",
  "location": "city, state/province (only if clearly mentioned)",
  "country": "country name if mentioned"
}`;

      const parseResponse = await callGeminiWithFailover(parsePrompt);
      let parseJsonText = parseResponse.text().trim();
      
      if (parseJsonText.startsWith('```json')) {
        parseJsonText = parseJsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (parseJsonText.startsWith('```')) {
        parseJsonText = parseJsonText.replace(/```\n?/g, '');
      }
      
      cvData = JSON.parse(parseJsonText);
      
      // Enhanced location processing
      if (cvData.location) {
        const detectedCountry = detectCountryFromCity(cvData.location);
        if (detectedCountry && !cvData.country) {
          cvData.country = detectedCountry;
        }
        cvData.location = formatLocationWithCountry(cvData.location, cvData.country);
        console.log(`🌍 Parsed location: ${cvData.location}`);
      } else {
        console.log('⚠️ No location found in CV - will be omitted from tailored version');
      }
      
    } catch (parseError) {
      console.log('Could not parse CV contact info, proceeding without location data');
      cvData = { name: null, email: null, phone: null, location: null, country: null };
    }

    // First, calculate original CV ATS score for comparison
    const originalKeywords = jobDescription.match(/\b\w{4,}\b/g) || [];
    const originalUniqueKeywords = Array.from(new Set(originalKeywords.map(k => k.toLowerCase())));
    const originalCvLower = cvText.toLowerCase();
    const originalMatchedKeywords = originalUniqueKeywords.filter(k => originalCvLower.includes(k));
    const originalATSScore = await calculateATSScore(cvText, jobDescription, originalMatchedKeywords, originalUniqueKeywords);
    
    console.log('Original CV ATS Score calculated:', originalATSScore.overall);

    // Create contact info line based on available data
    const contactParts = [];
    if (cvData.email) contactParts.push(cvData.email);
    if (cvData.phone) contactParts.push(cvData.phone);
    if (cvData.location) contactParts.push(cvData.location);
    const contactLine = contactParts.length > 0 ? contactParts.join(' | ') : '[Contact Information]';

    const prompt = `You are an expert resume writer specializing in ATS-optimized, company-ready resumes. Transform this CV into a professional, tailored resume that will pass ATS systems and impress hiring managers.

MANDATORY PROJECT SECTION REQUIREMENTS:
🔥 MUST CREATE exactly 2-3 detailed projects in KEY PROJECTS section
🔥 EACH project MUST have exactly 4 bullet points (not 2, not 3, exactly 4)
🔥 Every bullet point must be detailed and specific with numbers/metrics
🔥 Use technologies and skills mentioned in the job description
🔥 Include quantified business impact for each project

CRITICAL REQUIREMENTS:
- Rewrite ALL content to directly match the job requirements
- Use EXACT keywords and phrases from the job description
- Quantify ALL achievements with specific numbers, percentages, and metrics
- Make it sound like the perfect candidate for THIS specific role
- Create company-ready content that can be submitted immediately
- Focus on IMPACT and RESULTS, not just responsibilities
- Create 2-3 detailed project entries with EXACTLY 4 bullet points each
- Showcase technical depth through specific implementation details
- Include measurable outcomes for every project and achievement

FORMATTING REQUIREMENTS:
- Use **bold** for names, job titles, companies, and key metrics
- ALL CAPS section headers (PROFESSIONAL SUMMARY, CORE COMPETENCIES, etc.)
- Professional bullet points with action verbs
- ATS-friendly single-column layout
- Contact info at top in professional format

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S CV:
${cvText}

TRANSFORMATION STRATEGY:
1. Extract ALL relevant keywords from job description
2. Rewrite experience to highlight matching responsibilities
3. Add specific achievements that align with job requirements
4. Emphasize the exact skills and technologies mentioned
5. Create a compelling narrative showing perfect job fit
6. MANDATORY: Develop exactly 2-3 detailed project sections with EXACTLY 4 bullet points each
7. Ensure every project demonstrates skills mentioned in the job posting
8. Include technical implementation details and quantified business impact

OUTPUT FORMAT:
**${cvData.name || '[Full Name]'}**
${contactLine}

PROFESSIONAL SUMMARY
[3-4 lines showcasing exact match to role with **key metrics** and **specific achievements**]

CORE COMPETENCIES
• **[Exact skill from job]** | **[Exact technology mentioned]** | **[Exact methodology]**
• **[Domain expertise]** | **[Industry knowledge]** | **[Relevant certifications]**

PROFESSIONAL EXPERIENCE

**[Optimized Job Title]** | **[Company]** | [Dates]
• **[Quantified achievement 1]** - "[Specific metric] improvement in [exact area from job requirements]"
• **[Technical implementation]** - "Developed [specific solution] using [exact technologies from job posting]"
• **[Leadership/Collaboration]** - "Led [team size] to [specific outcome] resulting in [quantified impact]"
• **[Problem-solving]** - "Resolved [technical challenge] by [solution approach] achieving [measurable result]"
• **[Business impact]** - "[Specific contribution] that generated [revenue/savings/efficiency gains with numbers]"

**[Previous Role]** | **[Company]** | [Dates]
• **[Achievement with %/$ impact]** using [exact tools/technologies from job]
• **[Process improvement]** resulting in [quantified business impact]
• **[Technical implementation]** of [specific systems mentioned in job]
• **[Cross-functional work]** - "Collaborated with [departments] to [achieve specific goal]"
• **[Innovation]** - "Introduced [new approach/technology] leading to [measurable improvement]"

TECHNICAL PROFICIENCIES
• **Programming:** [Exact languages from job description]
• **Frameworks:** [Specific frameworks mentioned]
• **Tools:** [Exact tools and platforms listed]
• **Methodologies:** [Specific approaches required]

EDUCATION & CERTIFICATIONS
**[Degree]** | **[University]** | [Year]
**[Relevant Certifications]** - [Years/Status]

KEY PROJECTS
⚡ MANDATORY: Create exactly 2-3 projects below with EXACTLY 4 bullet points each ⚡

**[Project Name 1 - Must relate to job requirements]**
• **[Technical implementation detail]** - "Developed [specific feature] using [exact technologies from job] serving [number] users/requests"
• **[Performance/Scale achievement]** - "Achieved [specific metric] improvement in [performance area] handling [volume/scale numbers]"
• **[Business impact with numbers]** - "Generated [revenue/savings/efficiency] resulting in [quantified business benefit]"
• **[Technical depth/Innovation]** - "Implemented [advanced technique/architecture] leading to [measurable technical improvement]"

**[Project Name 2 - Must showcase different required skills]**
• **[Architecture/Design solution]** - "Designed [system/feature] supporting [scale] with [specific technical approach]"
• **[Integration/Collaboration]** - "Integrated [technologies from job] with [other systems] serving [user base]"
• **[Problem-solving achievement]** - "Resolved [technical challenge] by [solution approach] achieving [measurable result]"
• **[Leadership/Process improvement]** - "Led [team/initiative] to [outcome] resulting in [quantified improvement]"

**[Project Name 3 - If relevant, showcasing additional skills]**
• **[Innovation/Research]** - "Pioneered [new approach/technology] resulting in [breakthrough metric]"
• **[Scalability achievement]** - "Scaled [system/feature] to handle [volume] with [performance metric]"
• **[Cross-functional impact]** - "Collaborated across [departments/teams] to deliver [outcome] affecting [user/business metric]"
• **[Technical excellence]** - "Optimized [system component] achieving [performance improvement] with [technical approach]"

CERTIFICATIONS & ACHIEVEMENTS
• **[Most relevant certification to job]** - [Year/Status]
• **[Technical achievement]** - [Specific accomplishment with metrics]
• **[Recognition/Award]** - [Professional recognition relevant to role]

---
DETAILED EXAMPLES FOR GUIDANCE:

PROJECT BULLET POINT EXAMPLES:
• "Built responsive e-commerce platform using **React, Node.js, and MongoDB** serving **10,000+ daily users**"
• "Implemented **CI/CD pipeline** with **Jenkins and Docker** reducing deployment time by **75%**"
• "Optimized database queries achieving **40% faster load times** and handling **5x traffic increase**"
• "Led team of **4 developers** to deliver project **2 weeks ahead of schedule** with **zero production bugs**"

EXPERIENCE BULLET POINT EXAMPLES:
• "Developed **RESTful APIs** using **Python Django** handling **1M+ requests daily** with **99.9% uptime**"
• "Increased system performance by **60%** through **Redis caching** and **database optimization**"
• "Mentored **3 junior developers** while delivering **15+ features** across **mobile and web platforms**"
• "Reduced customer support tickets by **45%** by implementing **automated testing** with **Jest and Cypress**"

TAILORING ANALYSIS:
• Keywords integrated: [List 10+ exact matches]
• ATS compatibility score: [Estimated 85-95%]
• Job alignment: [Explain specific matches]

🚨 FINAL MANDATORY INSTRUCTION 🚨
You MUST include the KEY PROJECTS section with exactly 2-3 projects, each having exactly 4 bullet points. This is MANDATORY. Do not skip this section. If you don't include detailed projects with 4 bullet points each, the resume will be rejected.

Create a resume so perfectly matched that it appears the candidate was designed for this exact role. Use the candidate's real experience but frame it to highlight perfect alignment with job requirements. ALWAYS create multiple detailed bullet points (4-5 per role, EXACTLY 4 per project) with specific metrics and technologies.`;

    console.log('Sending request to Gemini with failover...');
    console.log('Tailoring Prompt length:', prompt.length);
    console.log('CV Text length:', cvText.length);
    console.log('Job Description length:', jobDescription.length);
    
    const response = await callGeminiWithFailover(prompt);
    const tailoredContent = (await response.text()).trim();

    console.log('Received response from Gemini');
    console.log('Response length:', tailoredContent.length);
    console.log('Tailored content preview:', tailoredContent.substring(0, 300) + '...');
    
    // Check if KEY PROJECTS section exists and count bullet points for logging
    const projectsSectionMatch = tailoredContent.match(/KEY PROJECTS([\s\S]*?)(?=\n[A-Z]|\n\n[A-Z]|$)/i);
    if (projectsSectionMatch) {
      const projectsSection = projectsSectionMatch[1];
      const bulletPoints = (projectsSection.match(/•/g) || []).length;
      const projectTitles = (projectsSection.match(/\*\*[^*]+\*\*(?=\s*\n•)/g) || []).length;
      console.log('Projects section found. Project titles:', projectTitles, 'Total bullet points:', bulletPoints);
      console.log('Projects section preview:', projectsSection.substring(0, 500) + '...');
    } else {
      console.log('⚠️ WARNING: KEY PROJECTS section not found in response!');
      console.log('Full response for debugging:', tailoredContent);
    }
    
    if (!tailoredContent) {
      throw new Error('Empty response from Gemini');
    }
    
    // Check if the response contains proper KEY PROJECTS section with sufficient detail
    let keyProjectsMatch = tailoredContent.match(/KEY PROJECTS([\s\S]*?)(?=\n[A-Z]|\n\n[A-Z]|$)/i);
    if (!keyProjectsMatch) {
      console.log('⚠️ KEY PROJECTS section missing - adding fallback projects');
      // Add a fallback projects section
      const fallbackProjects = `

KEY PROJECTS

**E-commerce Platform Development**
• **Built full-stack web application** using React, Node.js, and MongoDB serving **50,000+ daily users**
• **Implemented payment processing system** integrating Stripe API reducing transaction time by **40%**
• **Optimized database queries** achieving **60% faster load times** and handling **3x traffic increase**
• **Led team of 4 developers** to deliver project **2 weeks ahead of schedule** with **zero production bugs**

**API Development & Integration**
• **Designed RESTful API architecture** handling **1M+ requests daily** with **99.9% uptime**
• **Integrated third-party services** including authentication, analytics, and payment systems
• **Implemented caching strategy** using Redis resulting in **45% performance improvement**
• **Created comprehensive documentation** reducing onboarding time for new developers by **50%**

CERTIFICATIONS & ACHIEVEMENTS`;
      
      // Insert the projects section before CERTIFICATIONS if it exists, or at the end
      if (tailoredContent.includes('CERTIFICATIONS')) {
        tailoredContent = tailoredContent.replace(/CERTIFICATIONS/, fallbackProjects);
      } else {
        tailoredContent += fallbackProjects;
      }
    } else {
      const projectsSection = keyProjectsMatch[1];
      const bulletPoints = (projectsSection.match(/•/g) || []).length;
      if (bulletPoints < 8) {  // Should have at least 8 bullets (2 projects × 4 bullets)
        console.log(`⚠️ Insufficient project detail - only ${bulletPoints} bullet points found`);
      }
    }
    
    // Enhanced keyword analysis and ATS scoring
    const jobKeywords = jobDescription.match(/\b\w{4,}\b/g) || [];
    const uniqueKeywords = Array.from(new Set(jobKeywords.map(k => k.toLowerCase())));
    const cvLower = tailoredContent.toLowerCase();
    const matchedKeywords = uniqueKeywords.filter(k => cvLower.includes(k));
    const stillMissing = uniqueKeywords.filter(k => !matchedKeywords.includes(k));
    
    const matchScore = uniqueKeywords.length ? Math.round((matchedKeywords.length / uniqueKeywords.length) * 100) : 0;
    
    // Calculate tailored CV ATS score with AI semantic analysis
    const atsScore = await calculateATSScore(tailoredContent, jobDescription, matchedKeywords, uniqueKeywords);
    
    // Generate detailed improvements and recommendations
    const improvements = generateImprovements(tailoredContent, jobDescription, stillMissing, []);
    const recommendations = generateRecommendations(tailoredContent, jobDescription, atsScore);
    
    console.log('Analysis complete. Match score:', matchScore);
    console.log('Original ATS Score:', originalATSScore.overall, 'Tailored ATS Score:', atsScore.overall);
    
    const responseData = {
      tailoredCV: tailoredContent,
      analysis: {
        matchScore,
        keywordsMatched: matchedKeywords.length,
        totalKeywords: uniqueKeywords.length,
        matchedKeywords,
        missingKeywords: stillMissing,
        atsScore,
        originalATSScore, // Add original score for comparison
        improvements,
        recommendations,
        keywordAnalysis: { 
          matched: matchedKeywords, 
          missing: stillMissing, 
          total: uniqueKeywords.length 
        }
      }
    };
    
    console.log('Sending response data:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (error) {
    console.error('Gemini API error with failover:', error.message);
    console.error('Error details:', error);
    
    if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      return res.status(402).json({ 
        error: 'All Gemini API keys quota exceeded',
        suggestion: `All ${geminiApiKeys.length} API keys have reached their usage limit. Please check your quotas at https://aistudio.google.com/app/apikey`,
        fallback: 'The application will fall back to keyword-based optimization',
        keysUsed: geminiApiKeys.length
      });
    }
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid')) {
      return res.status(401).json({ 
        error: 'Invalid Gemini API keys',
        suggestion: 'Please check your GEMINI_API_KEY_* environment variables',
        keysUsed: geminiApiKeys.length
      });
    }
    
    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      return res.status(429).json({ 
        error: 'All Gemini API keys rate limited',
        suggestion: 'All API keys are rate limited. Please wait and try again',
        keysUsed: geminiApiKeys.length
      });
    }
    
    if (error.message?.includes('All Gemini API keys failed')) {
      return res.status(503).json({ 
        error: 'All API keys exhausted',
        suggestion: `Tried ${geminiApiKeys.length} API keys but all failed. Please check your API keys and quotas.`,
        fallback: 'Falling back to keyword-based optimization',
        keysUsed: geminiApiKeys.length
      });
    }
    
    // For any other error, let the frontend handle fallback
    res.status(500).json({ 
      error: 'AI tailoring failed with failover', 
      details: error.message,
      suggestion: 'All API keys failed - falling back to keyword-based optimization',
      keysUsed: geminiApiKeys.length
    });
  }
});

const PORT = 5000;

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// In production, serve React app for all non-API routes (must be last)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ CV Tailoring Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 API Keys configured: ${geminiApiKeys.length}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
