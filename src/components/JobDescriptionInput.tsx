import React from 'react';
import { Briefcase, Building } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ value, onChange }) => {
  const handleSampleLoad = () => {
    const sampleJD = `Senior Software Engineer - Tech Innovation Corp

We are seeking a highly skilled Senior Software Engineer to join our dynamic development team. The ideal candidate will have extensive experience in full-stack development and a passion for creating innovative solutions.

Key Responsibilities:
• Design and develop scalable web applications using modern technologies
• Collaborate with cross-functional teams in an agile environment
• Mentor junior developers and contribute to technical decisions
• Optimize application performance and ensure code quality
• Participate in code reviews and maintain best practices

Required Qualifications:
• 5+ years of professional software development experience
• Strong proficiency in React, Node.js, and TypeScript
• Experience with cloud platforms (AWS, Azure, or GCP)
• Knowledge of database systems (PostgreSQL, MongoDB)
• Familiarity with agile methodologies and DevOps practices
• Excellent problem-solving and communication skills

Preferred Qualifications:
• Experience with microservices architecture
• Knowledge of containerization (Docker, Kubernetes)
• Previous experience in a leadership or mentoring role
• Bachelor's degree in Computer Science or related field

Location: San Francisco, CA (Hybrid work available)
Salary: $130,000 - $160,000 per year
Benefits: Health insurance, 401k, flexible PTO, professional development budget`;

    onChange(sampleJD);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Job Description</h3>
              <p className="text-sm text-slate-600">Paste the complete job posting</p>
            </div>
          </div>
          <button
            onClick={handleSampleLoad}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
          >
            Load Sample
          </button>
        </div>
      </div>

      <div className="p-6">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the complete job description here. Include all requirements, responsibilities, and company information for the best results..."
          className="w-full h-80 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
        />
        
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span>{value.length} characters</span>
            <span>•</span>
            <span>~{Math.ceil(value.split(' ').length)} words</span>
          </div>
          {value.length > 100 && (
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Good length</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionInput;