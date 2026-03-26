import React from 'react';
import { LayoutGrid, CheckCircle2, AlertCircle, Circle } from 'lucide-react';

interface ExamSidebarProps {
  questions: any[];
  answers: Record<string, string>;
  uncertain: Record<string, boolean>;
  currentIndex: number;
  onSelect: (index: number) => void;
}

const ExamSidebar: React.FC<ExamSidebarProps> = ({ 
  questions, 
  answers, 
  uncertain, 
  currentIndex, 
  onSelect 
}) => {
  const answeredCount = Object.keys(answers).length;
  const uncertainCount = Object.values(uncertain).filter(Boolean).length;

  return (
    <aside className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-8">
          <LayoutGrid className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Navigasi Soal</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Terjawab</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xl font-black text-slate-900">{answeredCount}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ragu-ragu</p>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xl font-black text-slate-900">{uncertainCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-5 gap-3">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q.id];
            const isUncertain = !!uncertain[q.id];
            const isActive = currentIndex === i;

            return (
              <button
                key={q.id}
                onClick={() => onSelect(i)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all border-2
                  ${isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-lg shadow-indigo-100 z-10' 
                    : isUncertain
                      ? 'bg-amber-500 text-white border-amber-500'
                      : isAnswered
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'}
                `}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-8 border-t border-slate-100 bg-slate-50/50">
         <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sedang Dikerjakan</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sudah Terjawab</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-amber-500"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ragu-ragu</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-200"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Belum Dijawab</span>
            </div>
         </div>
      </div>
    </aside>
  );
};

export default ExamSidebar;
