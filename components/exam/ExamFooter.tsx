import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExamFooterProps {
  currentIndex: number;
  totalQuestions: number;
  onNavigate: (index: number) => void;
  onToggleUncertain: (qId: string) => void;
  onFinish: () => void;
  isUncertain: boolean;
  isSubmitting: boolean;
  currentQuestionId: string;
}

const ExamFooter: React.FC<ExamFooterProps> = ({ 
  currentIndex, 
  totalQuestions, 
  onNavigate,
  onToggleUncertain,
  onFinish,
  isUncertain,
  isSubmitting,
  currentQuestionId
}) => {
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="bg-white border-t border-slate-200 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-30 hover:bg-slate-200 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali
          </button>
          
          <button
            onClick={() => onToggleUncertain(currentQuestionId)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-2 ${
              isUncertain 
                ? 'bg-amber-50 border-amber-200 text-amber-600' 
                : 'bg-white border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            Ragu-ragu
          </button>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isLast ? (
            <button
              onClick={onFinish}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim...' : 'Selesai Ujian'}
              <CheckCircle2 className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
            >
              Selanjutnya
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamFooter;
