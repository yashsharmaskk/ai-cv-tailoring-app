import React from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ATSScore {
  overall: number;
  keywordMatch: number;
  formatting: number;
  sections: number;
  experience: number;
  skills: number;
  education: number;
  contact: number;
}

interface ATSAnalysis {
  score: ATSScore;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordAnalysis: {
    matched: string[];
    missing: string[];
    total: number;
  };
}

interface ATSScoreCardProps {
  analysis: ATSAnalysis;
}

const ATSScoreCard: React.FC<ATSScoreCardProps> = ({ analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const scoreCategories = [
    { label: 'Keyword Match', value: analysis.score.keywordMatch, key: 'keywordMatch' },
    { label: 'Formatting', value: analysis.score.formatting, key: 'formatting' },
    { label: 'Sections', value: analysis.score.sections, key: 'sections' },
    { label: 'Experience', value: analysis.score.experience, key: 'experience' },
    { label: 'Skills', value: analysis.score.skills, key: 'skills' },
    { label: 'Education', value: analysis.score.education, key: 'education' },
    { label: 'Contact Info', value: analysis.score.contact, key: 'contact' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">ATS Compatibility Score</h3>
              <p className="text-sm text-slate-600">Applicant Tracking System analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.score.overall)}`}>
              {analysis.score.overall}%
            </div>
            <div className="text-sm text-slate-600">Overall Score</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Score Visualization */}
        <div className="relative">
          <div className="w-full bg-slate-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                analysis.score.overall >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                analysis.score.overall >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${analysis.score.overall}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Poor (0-40)</span>
            <span>Fair (40-60)</span>
            <span>Good (60-80)</span>
            <span>Excellent (80-100)</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Score Breakdown</h4>
          <div className="grid grid-cols-2 gap-3">
            {scoreCategories.map((category) => (
              <div key={category.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${getScoreBgColor(category.value)}`}>
                    <div className={getScoreColor(category.value)}>
                      {getScoreIcon(category.value)}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{category.label}</span>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(category.value)}`}>
                  {category.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Keyword Analysis */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Keyword Analysis</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Matched Keywords</span>
              <span className="text-sm font-bold text-green-600">
                {analysis.keywordAnalysis.matched.length} / {analysis.keywordAnalysis.total}
              </span>
            </div>
            
            <div>
              <p className="text-xs font-medium text-green-700 mb-2">Found Keywords:</p>
              <div className="flex flex-wrap gap-1">
                {analysis.keywordAnalysis.matched.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {analysis.keywordAnalysis.missing.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-2">Missing Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywordAnalysis.missing.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Strengths</span>
            </h4>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-slate-700 flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Areas for Improvement</span>
            </h4>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-slate-700 flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Recommendations</span>
          </h4>
          <div className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSScoreCard;