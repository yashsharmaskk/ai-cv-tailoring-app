import { useState } from 'react';
import { FileText, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import JobDescriptionInput from './components/JobDescriptionInput';
import CVInput from './components/CVInput';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';

interface JobData {
  title: string;
  company: string;
  requirements: string[];
  skills: string[];
  experience: string;
  location: string;
}

interface CVData {
  name: string;
  email: string;
  phone: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  education: Array<{
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
    formatting: number;
    sections: number;
    experience: number;
    skills: number;
    education: number;
    contact: number;
  };
  atsAnalysis: {
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

  const handleStartProcessing = () => {
    if (!jobDescription.trim() || !currentCV.trim()) {
      alert('Please fill in both the job description and current CV');
      return;
    }
    
    setCurrentStep('processing');
    setIsProcessing(true);
    
    // Simulate processing
    // Process job description and CV to compute ATS scores and tailored suggestions
    setTimeout(() => {
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
          formatting: 80,
          sections: 80,
          experience: 80,
          skills: 80,
          education: 80,
          contact: 80
        },
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
      // Provide minimal CV data for results view
      setExtractedCVData({
        name: '',
        email: '',
        phone: '',
        experience: [],
        skills: [],
        education: []
      });
      setTailoredCV(tailored);
      setIsProcessing(false);
      setCurrentStep('results');
    }, 1000);
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
                <p className="text-sm text-slate-600">Optimize your resume for any job</p>
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
                <span className="text-sm font-medium text-slate-700">Processing</span>
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
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Tailor Your CV to Any Job</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your current CV and paste the job description. Our AI will analyze both and create a perfectly tailored resume that highlights your most relevant skills and experience.
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
                <span>Start CV Tailoring</span>
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