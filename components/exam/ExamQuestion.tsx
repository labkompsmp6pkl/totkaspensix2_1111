import React from 'react';
import MathJaxContent from './MathJaxContent';

interface ExamQuestionProps {
  question: any;
  selectedAnswer: string;
  onAnswer: (answer: string) => void;
}

const ExamQuestion: React.FC<ExamQuestionProps> = ({ question, selectedAnswer, onAnswer }) => {
  if (!question) return null;

  const options = ['A', 'B', 'C', 'D', 'E'].filter(opt => question[`option_${opt.toLowerCase()}`]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-4 mb-8">
           <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
             Pertanyaan {question.index + 1}
           </div>
           <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <MathJaxContent content={question.question_text} className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed" />
        </div>

        {question.image_url && (
          <div className="mt-8 rounded-[2rem] overflow-hidden border border-slate-200">
            <img 
              src={question.image_url} 
              alt="Question" 
              className="w-full h-auto max-h-[400px] object-contain bg-slate-50"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            className={`
              flex items-center gap-6 p-6 rounded-[2rem] border-2 text-left transition-all group
              ${selectedAnswer === opt 
                ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100' 
                : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}
            `}
          >
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all
              ${selectedAnswer === opt 
                ? 'bg-indigo-600 text-white scale-110' 
                : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
            `}>
              {opt}
            </div>
            <div className="flex-1">
              <MathJaxContent 
                content={question[`option_${opt.toLowerCase()}`]} 
                className={`text-base sm:text-lg font-bold transition-colors ${selectedAnswer === opt ? 'text-indigo-900' : 'text-slate-600'}`} 
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamQuestion;
