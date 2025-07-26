import React from 'react';
import { Brain, FileSearch, Zap, CheckCircle, Target } from 'lucide-react';

interface ProcessingViewProps {
  isProcessing: boolean;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ isProcessing }) => {
  const steps = [
    {
      icon: FileSearch,
      title: "Analyzing Job Description",
      description: "Extracting key requirements, skills, and qualifications",
      completed: true
    },
    {
      icon: Brain,
      title: "Processing Your CV",
      description: "Identifying your strengths and relevant experience",
      completed: true
    },
    {
      icon: Zap,
      title: "Generating Tailored CV",
      description: "Creating optimized content that matches the job requirements",
      completed: false
    },
    {
      icon: Target,
      title: "Analyzing ATS Compatibility",
      description: "Evaluating resume format and keyword optimization for ATS systems",
      completed: false
    }
  ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">AI is Tailoring Your CV</h2>
          <p className="text-slate-600">
            Our intelligent system is analyzing your experience and optimizing it for the target role
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = (index === 2 || index === 3) && isProcessing;
            const isCompleted = step.completed || (index < 2);
            
            return (
              <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-slate-200">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                  )}
                </div>
                
                <div className="flex-grow text-left">
                  <h3 className={`font-semibold ${isCompleted ? 'text-green-700' : isActive ? 'text-blue-700' : 'text-slate-600'}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
                
                {isActive && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Processing time:</strong> Typically takes 45-90 seconds for complete analysis including ATS scoring
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingView;