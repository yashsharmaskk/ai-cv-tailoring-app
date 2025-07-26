import React, { useRef, useState } from 'react';
import { FileText, Upload, File, AlertCircle, CheckCircle } from 'lucide-react';

interface CVInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CVInput: React.FC<CVInputProps> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch('http://localhost:5000/extract-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }
      
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Server-side PDF extraction failed:', error);
      throw error;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setFileName(file.name);
    setUploadStatus('idle');

    try {
      const extractedText = await extractTextFromPDF(file);
      
      // Check if it's the fallback template text
      if (extractedText.includes('Unable to extract text from PDF automatically')) {
        onChange(extractedText);
        setUploadStatus('error'); // Show as error but still populate the text
      } else if (extractedText.trim().length > 0) {
        onChange(extractedText);
        setUploadStatus('success');
      } else {
        throw new Error('No text could be extracted from the PDF');
      }
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      setUploadStatus('error');
      // Still allow the user to paste text manually
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSampleLoad = () => {
    const sampleCV = `John Doe
Software Developer

Contact Information:
Email: john.doe@email.com
Phone: +1 (555) 123-4567
LinkedIn: linkedin.com/in/johndoe
Location: San Francisco, CA

Professional Summary:
Dedicated software developer with 4 years of experience in full-stack web development. Passionate about creating efficient, scalable applications using modern technologies. Strong background in JavaScript, React, and Node.js with a focus on user experience and code quality.

Technical Skills:
• Programming Languages: JavaScript, HTML5, CSS3, Python
• Frontend Frameworks: React, Vue.js, Angular
• Backend Technologies: Node.js, Express.js
• Databases: MySQL, MongoDB
• Tools & Technologies: Git, Webpack, Docker
• Development Practices: Agile, Test-Driven Development

Professional Experience:

Software Developer | StartupXYZ | March 2021 - Present
• Developed and maintained web applications using React and Node.js
• Collaborated with design team to implement responsive user interfaces
• Optimized application performance resulting in 20% faster load times
• Participated in daily standups and sprint planning meetings
• Mentored 2 junior developers on best practices and code review

Junior Web Developer | WebCorp Solutions | June 2019 - February 2021
• Built responsive websites for small to medium businesses
• Maintained existing WordPress and custom PHP applications
• Implemented SEO best practices resulting in improved search rankings
• Worked directly with clients to gather requirements and provide updates
• Managed multiple projects simultaneously using project management tools

Freelance Web Developer | Self-Employed | 2018 - 2019
• Created custom websites for local businesses using HTML, CSS, and JavaScript
• Provided ongoing maintenance and support for client websites
• Developed e-commerce solutions using Shopify and WooCommerce

Education:
Bachelor of Science in Computer Science
University of Technology | 2019
Relevant Coursework: Data Structures, Algorithms, Database Management, Software Engineering

Certifications:
• AWS Certified Cloud Practitioner (2022)
• Google Analytics Certified (2021)

Projects:
• Personal Portfolio Website - React-based portfolio showcasing projects and skills
• Task Management App - Full-stack application built with MERN stack
• Weather Dashboard - JavaScript application using third-party APIs

Languages:
• English (Native)
• Spanish (Conversational)

Interests:
Open source contribution, tech meetups, hiking, photography`;

    onChange(sampleCV);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Current CV/Resume</h3>
              <p className="text-sm text-slate-600">Upload PDF or paste text content</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={triggerFileUpload}
              disabled={isUploading}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 border border-emerald-600 rounded-md hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors"
            >
              <Upload className="h-3 w-3" />
              <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
            </button>
            <button
              onClick={handleSampleLoad}
              className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-white border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
            >
              Load Sample
            </button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {/* Upload Status */}
        {(uploadStatus !== 'idle' || fileName) && (
          <div className="mt-3 flex items-center space-x-2">
            {uploadStatus === 'success' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Successfully extracted text from {fileName}</span>
              </>
            )}
            {uploadStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  {fileName ? 
                    `PDF parsing failed for ${fileName}. The file may be image-based or have complex formatting. Instructions provided below.` :
                    'Invalid file format. Please upload a PDF file.'
                  }
                </span>
              </>
            )}
            {isUploading && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                <span className="text-sm text-emerald-700">Processing {fileName}...</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        {/* PDF Upload Area */}
        <div 
          onClick={triggerFileUpload}
          className="mb-4 p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <div className="text-center">
            <File className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700">Click to upload PDF resume</p>
            <p className="text-xs text-slate-500">or drag and drop your PDF file here</p>
          </div>
        </div>
        
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upload a PDF resume above or paste your current CV/resume content here. Include all sections: contact info, experience, skills, education, etc..."
          className="w-full h-80 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm leading-relaxed"
        />
        
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span>{value.length} characters</span>
            <span>•</span>
            <span>~{Math.ceil(value.split(' ').length)} words</span>
          </div>
          {value.length > 200 && (
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Comprehensive CV</span>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Upload className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="text-xs text-slate-600">
              <p className="font-medium mb-1">Tips for best results:</p>
              <ul className="space-y-1 text-slate-500">
                <li>• Upload PDF files for automatic text extraction</li>
                <li>• Include complete work experience with dates</li>
                <li>• List all relevant skills and technologies</li>
                <li>• Add education and certifications</li>
                <li>• Include quantifiable achievements where possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVInput;