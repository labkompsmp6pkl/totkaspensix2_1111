import React from 'react';
import { CheckCircle2, AlertCircle, Circle } from 'lucide-react';

interface QuestionStatusProps {
  isAnswered: boolean;
  isUncertain: boolean;
  isActive: boolean;
}

const QuestionStatus: React.FC<QuestionStatusProps> = ({ isAnswered, isUncertain, isActive }) => {
  if (isActive) return <div className="w-2 h-2 rounded-full bg-indigo-600"></div>;
  if (isUncertain) return <AlertCircle className="w-4 h-4 text-amber-500" />;
  if (isAnswered) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  return <Circle className="w-4 h-4 text-slate-200" />;
};

export default QuestionStatus;
