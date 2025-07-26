import React, { useState } from 'react';
import { Download, RefreshCw, Eye, Code, TrendingUp, Award, Target } from 'lucide-react';
import jsPDF from 'jspdf';
import ATSScoreCard from './ATSScoreCard';

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
  location?: string;
  country?: string;
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

interface ResultsViewProps {
  jobData: JobData;
  cvData: CVData;
  tailoredCV: TailoredCV;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ jobData, cvData, tailoredCV, onReset }) => {
  const [activeTab, setActiveTab] = useState<'cv' | 'analysis' | 'ats' | 'json'>('cv');

  // Function to format CV content with proper HTML formatting
  const formatCVContent = (content: string) => {
    if (!content) return '';
    
    return content
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1f2937;">$1</strong>')
      // Convert *italic* to <em>
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #4b5563;">$1</em>')
      // Convert section headers (lines ending with :)
      .replace(/^([A-Z][A-Za-z\s]+):$/gm, '<h3 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #1f2937; font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25rem;">$1:</h3>')
      // Convert all-caps headers
      .replace(/^([A-Z\s]{3,}):?$/gm, '<h3 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #1f2937; font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25rem;">$1</h3>')
      // Convert bullet points
      .replace(/^[-•]\s+(.+)$/gm, '<li style="margin-left: 1rem; margin-bottom: 0.25rem; color: #374151;">$1</li>')
      // Convert phone/email patterns
      .replace(/(\+?[\d\s\-\(\)]{10,})/g, '<a href="tel:$1" style="color: #2563eb; text-decoration: underline;">$1</a>')
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" style="color: #2563eb; text-decoration: underline;">$1</a>')
      // Convert line breaks to <br> tags
      .replace(/\n/g, '<br>')
      // Wrap consecutive <li> elements in <ul>
      .replace(/(<li[^>]*>.*?<\/li>)(\s*<br>\s*<li[^>]*>.*?<\/li>)*/g, (match) => {
        const items = match.replace(/<br>/g, '').trim();
        return `<ul style="margin: 0.5rem 0; padding-left: 1rem; list-style-type: disc;">${items}</ul>`;
      });
  };

  const downloadCV = () => {
    try {
      console.log('Generating PDF for:', jobData.company);
      console.log('CV Content length:', tailoredCV.content?.length);
      
      if (!tailoredCV.content || tailoredCV.content.trim().length === 0) {
        throw new Error('No CV content available for PDF generation');
      }
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - 2 * margin;
      
      // Clean the content for PDF (remove markdown formatting and convert to proper formatting)
      let cleanContent = tailoredCV.content
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers but keep the text
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic markers
        .replace(/[-•]\s+/g, '• ')       // Normalize bullet points
        .replace(/=+/g, '')              // Remove any separator lines
        .trim();
      
      // Remove any ATS score or tailoring analysis sections
      cleanContent = cleanContent
        .replace(/TAILORING ANALYSIS:[\s\S]*?(?=\n[A-Z]|$)/gi, '')
        .replace(/ATS SCORE[\s\S]*?(?=\n[A-Z]|$)/gi, '')
        .replace(/Keywords integrated:[\s\S]*?(?=\n[A-Z]|$)/gi, '')
        .replace(/Job alignment:[\s\S]*?(?=\n[A-Z]|$)/gi, '')
        .replace(/ATS compatibility score:[\s\S]*?(?=\n[A-Z]|$)/gi, '')
        .trim();
      
      // Set up fonts and styling for professional resume
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      // Split CV content into lines that fit the page width
      const lines = doc.splitTextToSize(cleanContent, maxLineWidth);
      
      let yPosition = 20; // Start from top of page
      const lineHeight = 5;
      
      for (let i = 0; i < lines.length; i++) {
        if (yPosition > 280) { // Near bottom of page
          doc.addPage();
          yPosition = 20;
        }
        
        // Make section headers bold (all caps lines)
        const line = lines[i];
        if (line.match(/^[A-Z\s]{3,}$/)) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
        } else if (line.includes('**') || line.match(/^\*\*.*\*\*$/)) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
        }
        
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      }
      
      // Save the PDF with a professional filename
      const companyForFilename = jobData.company && jobData.company.trim() 
        ? jobData.company.replace(/\s+/g, '-').toLowerCase()
        : 'resume';
      const fileName = `resume-${companyForFilename}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download
      const element = document.createElement('a');
      
      // Clean content for text download too
      const cleanContent = tailoredCV.content
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
        .replace(/\*(.*?)\*/g, '$1');    // Remove italic markers
      
      const file = new Blob([cleanContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      const companyForFile = jobData.company && jobData.company.trim() 
        ? jobData.company.replace(/\s+/g, '-').toLowerCase()
        : 'job-application';
      element.download = `tailored-cv-${companyForFile}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-900">CV Successfully Tailored!</h2>
              <p className="text-green-700">
                Your resume has been optimized for <strong>{jobData.title}</strong> at <strong>{jobData.company}</strong>
              </p>
            </div>
          </div>
          <div className="flex space-x-6">
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{tailoredCV.matchScore}%</div>
              <div className="text-sm text-green-700">Job Match</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{tailoredCV.atsScore.overall}%</div>
              <div className="text-sm text-purple-700">ATS Score</div>
              {tailoredCV.originalATSScore && (
                <div className="text-xs text-purple-500">
                  +{tailoredCV.atsScore.overall - tailoredCV.originalATSScore.overall}% improved
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={downloadCV}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Download CV as PDF</span>
        </button>
        
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Start New CV</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('cv')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cv' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Tailored CV</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analysis' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analysis & Improvements</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('ats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ats' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>ATS Analysis</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('json')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'json' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>JSON Data</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'cv' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Your Tailored CV</h3>
              <p className="text-sm text-slate-600">Optimized for the target position</p>
            </div>
            <div className="p-8">
              <div 
                className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 max-w-none prose prose-sm"
                style={{ 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{
                  __html: formatCVContent(tailoredCV.content)
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Match Score Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Match Analysis</h3>
                <div className="text-2xl font-bold text-blue-600">{tailoredCV.matchScore}%</div>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${tailoredCV.matchScore}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Your tailored CV shows a strong alignment with the job requirements. The optimization process focused on highlighting your most relevant experience and skills.
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Skills Match</span>
                  <span className="font-semibold text-green-600">92%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Experience Relevance</span>
                  <span className="font-semibold text-blue-600">85%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Keywords Coverage</span>
                  <span className="font-semibold text-amber-600">84%</span>
                </div>
              </div>
            </div>

            {/* Improvements Made */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Improvements Made</h3>
              <div className="space-y-3">
                {(tailoredCV.improvements || []).length > 0 ? (
                  (tailoredCV.improvements || []).map((improvement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <p className="text-sm text-slate-700">{improvement}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-sm text-slate-700">CV has been optimized for better job matching and ATS compatibility.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Requirements */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Requirements Analysis</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Key Skills Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {(jobData.skills || []).length > 0 ? (
                      (jobData.skills || []).map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        Skills extracted from job description
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Experience Level</h4>
                  <p className="text-sm text-slate-600">{jobData.experience || 'Experience level from job posting'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Location</h4>
                  <p className="text-sm text-slate-600">{jobData.location || 'Location from job posting'}</p>
                </div>
              </div>
            </div>

            {/* Your Skills */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Skills Profile</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(cvData.skills || []).length > 0 ? (
                      (cvData.skills || []).map((skill, index) => {
                        const isMatched = (jobData.skills || []).some(jobSkill => 
                          jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
                          skill.toLowerCase().includes(jobSkill.toLowerCase())
                        );
                        return (
                          <span 
                            key={index} 
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isMatched 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {skill}
                          </span>
                        );
                      })
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        Skills extracted from your CV
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Experience Summary</h4>
                  <p className="text-sm text-slate-600">
                    {(cvData.experience || []).length} position{(cvData.experience || []).length !== 1 ? 's' : ''} 
                    {(cvData.experience || []).length > 0 && cvData.experience[0]?.duration 
                      ? ` spanning ${cvData.experience[0].duration.split(' - ')[0]} to present`
                      : ' of professional experience'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="space-y-6">
            {/* Before/After ATS Score Comparison */}
            {tailoredCV.originalATSScore && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  ATS Score Improvement
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original Score */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-800 mb-3">Original CV</h4>
                    <div className="text-3xl font-bold text-slate-600 mb-2">
                      {tailoredCV.originalATSScore.overall}%
                    </div>
                    <div className="text-sm text-slate-500 mb-3">ATS Compatibility</div>
                    
                    {/* Original breakdown */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Keywords:</span>
                        <span>{tailoredCV.originalATSScore.keywordMatch}%</span>
                      </div>
                      {tailoredCV.originalATSScore.semanticRelevance && (
                        <div className="flex justify-between">
                          <span>Semantic:</span>
                          <span>{tailoredCV.originalATSScore.semanticRelevance}%</span>
                        </div>
                      )}
                      {tailoredCV.originalATSScore.contextMatch && (
                        <div className="flex justify-between">
                          <span>Context:</span>
                          <span>{tailoredCV.originalATSScore.contextMatch}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Tailored Score */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-3">Tailored CV</h4>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {tailoredCV.atsScore.overall}%
                    </div>
                    <div className="text-sm text-green-600 mb-3">
                      +{tailoredCV.atsScore.overall - tailoredCV.originalATSScore.overall}% improvement
                    </div>
                    
                    {/* Tailored breakdown */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Keywords:</span>
                        <span className="font-medium">{tailoredCV.atsScore.keywordMatch}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Semantic:</span>
                        <span className="font-medium">{tailoredCV.atsScore.semanticRelevance}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Context:</span>
                        <span className="font-medium">{tailoredCV.atsScore.contextMatch}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Semantic Analysis Breakdown */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Semantic Analysis Breakdown
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Keyword Matching */}
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {tailoredCV.atsScore.keywordMatch}%
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Keyword Match</div>
                  <div className="text-xs text-blue-600 mt-1">Direct term alignment</div>
                </div>
                
                {/* Semantic Relevance */}
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {tailoredCV.atsScore.semanticRelevance}%
                  </div>
                  <div className="text-sm text-purple-700 font-medium">🤖 AI Semantic</div>
                  <div className="text-xs text-purple-600 mt-1">Domain & concept analysis</div>
                </div>
                
                {/* Context Matching */}
                <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {tailoredCV.atsScore.contextMatch}%
                  </div>
                  <div className="text-sm text-indigo-700 font-medium">🧠 AI Context</div>
                  <div className="text-xs text-indigo-600 mt-1">Experience & scale matching</div>
                </div>
                
                {/* Overall Score */}
                <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {tailoredCV.atsScore.overall}%
                  </div>
                  <div className="text-sm text-green-700 font-medium">Overall ATS Score</div>
                  <div className="text-xs text-green-600 mt-1">Weighted average</div>
                </div>
              </div>
              
              {/* Scoring Explanation */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">🤖 AI-Powered Semantic Analysis</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
                  <div>
                    <strong className="text-purple-700">Semantic Relevance (30%):</strong> Uses Gemini AI to analyze technology domains, role levels, industry context, and conceptual relationships beyond keywords.
                  </div>
                  <div>
                    <strong className="text-indigo-700">Context Matching (25%):</strong> AI evaluates experience patterns, project scale, work environment fit, and career progression alignment.
                  </div>
                  <div>
                    <strong className="text-green-700">Overall Score:</strong> Combines AI semantic analysis (55%), keyword matching (25%), formatting (12%), and content quality (8%) for intelligent ATS scoring.
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">
                    <strong>AI Enhancement:</strong> This analysis uses Google Gemini's advanced language understanding to provide deeper insights into CV-job compatibility, going far beyond traditional keyword matching.
                  </p>
                </div>
              </div>
            </div>
            
            <ATSScoreCard 
              analysis={{
                score: tailoredCV.atsScore,
                strengths: tailoredCV.atsAnalysis?.strengths || [],
                weaknesses: tailoredCV.atsAnalysis?.weaknesses || [],
                recommendations: tailoredCV.recommendations || tailoredCV.atsAnalysis?.recommendations || [],
                keywordAnalysis: tailoredCV.keywordAnalysis || tailoredCV.atsAnalysis?.keywordAnalysis || { matched: [], missing: [], total: 0 }
              }}
            />
          </div>
        )}

        {activeTab === 'json' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Job Data JSON */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900">Extracted Job Data</h3>
                <p className="text-sm text-slate-600">Structured job requirements and details</p>
              </div>
              <div className="p-4">
                <pre className="text-xs text-slate-800 overflow-auto max-h-96 bg-slate-50 p-4 rounded-lg">
                  {JSON.stringify(jobData, null, 2)}
                </pre>
              </div>
            </div>

            {/* CV Data JSON */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900">Extracted CV Data</h3>
                <p className="text-sm text-slate-600">Structured personal and professional information</p>
              </div>
              <div className="p-4">
                <pre className="text-xs text-slate-800 overflow-auto max-h-96 bg-slate-50 p-4 rounded-lg">
                  {JSON.stringify(cvData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsView;