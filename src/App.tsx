/**
 * CV Tailoring Application - Main Component
 * 
 * This is the primary React component that orchestrates the entire CV tailoring workflow.
 * It provides a step-by-step interface for users to:
 * 1. Input their current CV (via upload or text paste)
 * 2. Input the target job description
 * 3. Process the CV using AI optimization
 * 4. View and download the tailored results
 * 
 * Features:
 * - Multi-step workflow with progress indicators
 * - Real-time processing feedback
 * - Professional PDF export
 * - ATS score calculation
 * - Location intelligence integration
 * 
 * @author CV Tailoring Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { FileText, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import JobDescriptionInput from './components/JobDescriptionInput';
import CVInput from './components/CVInput';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';

/**
 * Interface defining the structure of job description data
 * parsed from user input
 */
interface JobData {
  title: string;           // Job position title
  company: string;         // Company name
  requirements: string[];  // List of job requirements
  skills: string[];        // Required technical/soft skills
  experience: string;      // Experience level required
  location: string;        // Job location
}

/**
 * Interface defining the structure of CV data
 * parsed from user input or PDF extraction
 */
interface CVData {
  name: string;           // Candidate's full name
  email: string;          // Contact email
  phone: string;          // Contact phone number
  location?: string;      // Current location (optional)
  country?: string;       // Detected country (optional)
  experience: Array<{     // Work experience entries
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  skills: string[];       // List of candidate skills
  education: Array<{      // Education background
    degree: string;
    institution: string;
    year: string;
  }>;
}

interface TailoredCV {
  content: string;
  matchScore: number;
  improvements: string[];
  atsScore: {
    overall: number;
    keywordMatch: number;
    semanticRelevance: number;
    contextMatch: number;
    formatting: number;
    sections: number;
    experience: number;
    skills: number;
    education: number;
    contact: number;
  };
  originalATSScore?: {
    overall: number;
    keywordMatch: number;
    semanticRelevance: number;
    contextMatch: number;
    formatting: number;
    sections: number;
    experience: number;
    skills: number;
    education: number;
    contact: number;
  };
  recommendations: string[];
  keywordAnalysis: {
    matched: string[];
    missing: string[];
    total: number;
  };
  atsAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    keywordAnalysis: {
      matched: string[];
      missing: string[];
      total: number;
    };
  };
}

type Step = 'input' | 'processing' | 'results';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [jobDescription, setJobDescription] = useState('');
  const [currentCV, setCurrentCV] = useState('');
  const [extractedJobData, setExtractedJobData] = useState<JobData | null>(null);
  const [extractedCVData, setExtractedCVData] = useState<CVData | null>(null);
  const [tailoredCV, setTailoredCV] = useState<TailoredCV | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartProcessing = async () => {
    if (!jobDescription.trim() || !currentCV.trim()) {
      alert('Please fill in both the job description and current CV');
      return;
    }
    
    setCurrentStep('processing');
    setIsProcessing(true);

    // Initialize CV data structure
    let extractedCV: CVData = {
      name: '',
      email: '',
      phone: '',
      experience: [],
      skills: [],
      education: []
    };
    
    try {
      // First, parse the CV to extract structured data
      console.log('Parsing CV data...');
      const cvParseResponse = await fetch('/parse-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvText: currentCV })
      });

      if (cvParseResponse.ok) {
        const cvParseData = await cvParseResponse.json();
        extractedCV = cvParseData.cvData;
        console.log('CV parsed successfully:', extractedCV);
      } else {
        console.warn('CV parsing failed, using fallback');
      }

      // Call Google Gemini-powered AI tailoring endpoint
      const response = await fetch('/ai/tailor-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          cvText: currentCV
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI tailoring failed');
      }

      const { tailoredCV, analysis } = await response.json();
      
      // Process additional keyword analysis
      const reqLines = jobDescription
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l);
      
      const titleLine = reqLines[0] || 'Tailored Position';

      const tailored: TailoredCV = {
        content: tailoredCV,
        matchScore: analysis.matchScore,
        improvements: analysis.improvements || analysis.missingKeywords?.map((k: string) => `Consider adding keyword "${k}"`) || [],
        atsScore: analysis.atsScore || {
          overall: analysis.matchScore,
          keywordMatch: analysis.matchScore,
          semanticRelevance: 85, // AI-generated content should have good semantic relevance
          contextMatch: 83, // AI should provide good context matching
          formatting: 85, // AI-generated content should have good formatting
          sections: 88,
          experience: 82,
          skills: analysis.matchScore,
          education: 80,
          contact: 90
        },
        originalATSScore: analysis.originalATSScore,
        recommendations: analysis.recommendations || [],
        keywordAnalysis: analysis.keywordAnalysis || { matched: [], missing: [], total: 0 },
        atsAnalysis: analysis.atsAnalysis || {
          strengths: analysis.matchedKeywords?.map((k: string) => `Contains relevant keyword "${k}"`) || [],
          weaknesses: analysis.missingKeywords?.slice(0, 5).map((k: string) => `Could benefit from keyword "${k}"`) || [],
          recommendations: analysis.recommendations || [
            'Review the tailored content for accuracy',
            'Verify all achievements and dates are correct',
            'Consider adding specific metrics where mentioned'
          ],
          keywordAnalysis: analysis.keywordAnalysis || { 
            matched: analysis.matchedKeywords || [], 
            missing: analysis.missingKeywords?.slice(0, 10) || [], // Limit to prevent UI overflow
            total: analysis.totalKeywords || 0 
          }
        }
      };

      // Prepare extracted job data
      setExtractedJobData({
        title: titleLine,
        company: '',
        requirements: reqLines,
        skills: analysis.matchedKeywords,
        experience: '',
        location: ''
      });
      
      // Use the parsed CV data instead of empty data
      setExtractedCVData(extractedCV);
      
      setTailoredCV(tailored);
      setCurrentStep('results');
      
    } catch (error) {
      console.error('AI tailoring error:', error);
      
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('quota exceeded')) {
        alert(`⚠️ Gemini API Quota Exceeded\n\nYour Google AI Studio account has reached its usage limit.\n\n🔧 Solutions:\n1. Check your quota at https://aistudio.google.com/app/apikey\n2. Wait for quota to reset (15 requests/minute, 1500/day)\n3. Use a different Google account\n\n📝 The app will continue with keyword-based analysis...`);
      } else {
        alert(`AI tailoring failed: ${errorMessage}\n\nFalling back to keyword analysis...`);
      }
      
      // Fallback to original keyword-based logic
      const reqLines = jobDescription
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l);
      const rawKeywords = jobDescription.match(/\b\w{4,}\b/g) || [];
      const keywords = Array.from(new Set(rawKeywords.map(k => k.toLowerCase())));
      const totalKeywords = keywords.length;
      const cvLower = currentCV.toLowerCase();
      const matched = keywords.filter(k => cvLower.includes(k));
      const matchScore = totalKeywords ? Math.round((matched.length / totalKeywords) * 100) : 0;
      const missing = keywords.filter(k => !matched.includes(k));

      const tailored: TailoredCV = {
        content: currentCV,
        matchScore,
        improvements: missing.map(k => `Include keyword "${k}"`),
        atsScore: {
          overall: matchScore,
          keywordMatch: matchScore,
          semanticRelevance: 75, // Default fallback value
          contextMatch: 70, // Default fallback value
          formatting: 80,
          sections: 80,
          experience: 80,
          skills: 80,
          education: 80,
          contact: 80
        },
        recommendations: missing.map(k => `Add "${k}" to your CV`),
        keywordAnalysis: { matched, missing, total: totalKeywords },
        atsAnalysis: {
          strengths: matched.map(k => `Keyword "${k}" present`),
          weaknesses: missing.map(k => `Missing keyword "${k}"`),
          recommendations: missing.map(k => `Add "${k}" to your CV`),
          keywordAnalysis: { matched, missing, total: totalKeywords }
        }
      };

      // Prepare extracted job data
      const titleLine = reqLines[0] || '';
      setExtractedJobData({
        title: titleLine,
        company: '',
        requirements: reqLines,
        skills: keywords,
        experience: '',
        location: ''
      });
      
      // Use the parsed CV data for fallback too
      setExtractedCVData(extractedCV);
      
      setTailoredCV(tailored);
      setCurrentStep('results');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setCurrentStep('input');
    setJobDescription('');
    setCurrentCV('');
    setExtractedJobData(null);
    setExtractedCVData(null);
    setTailoredCV(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CV Tailor</h1>
                <p className="text-sm text-slate-600">AI-powered resume optimization</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'input' ? 'bg-blue-600 text-white' : 
                  currentStep === 'processing' || currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep === 'processing' || currentStep === 'results' ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className="text-sm font-medium text-slate-700">Input</span>
              </div>
              
              <ArrowRight className="h-4 w-4 text-slate-400" />
              
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'processing' ? 'bg-blue-600 text-white' : 
                  currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep === 'results' ? <CheckCircle className="h-4 w-4" /> : '2'}
                </div>
                <span className="text-sm font-medium text-slate-700">AI Processing</span>
              </div>
              
              <ArrowRight className="h-4 w-4 text-slate-400" />
              
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep === 'results' ? <CheckCircle className="h-4 w-4" /> : '3'}
                </div>
                <span className="text-sm font-medium text-slate-700">Results</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'input' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">AI-Powered CV Tailoring</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your current CV and paste the job description. Our AI (Google Gemini) will analyze both and create a perfectly tailored, ATS-optimized resume.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <JobDescriptionInput 
                value={jobDescription}
                onChange={setJobDescription}
              />
              <CVInput 
                value={currentCV}
                onChange={setCurrentCV}
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStartProcessing}
                disabled={!jobDescription.trim() || !currentCV.trim()}
                className="flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Zap className="h-5 w-5" />
                <span>Start AI CV Tailoring</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'processing' && (
          <ProcessingView isProcessing={isProcessing} />
        )}

        {currentStep === 'results' && extractedJobData && extractedCVData && tailoredCV && (
          <ResultsView
            jobData={extractedJobData}
            cvData={extractedCVData}
            tailoredCV={tailoredCV}
            onReset={resetApp}
          />
        )}
      </main>
    </div>
  );
}

export default App;
