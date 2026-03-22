import React from 'react';
import { Question, ExamSession } from '../../types';

interface QuestionPaletteProps {
  questions: Question[];
  activeSession: ExamSession;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({ questions, activeSession, currentIndex, onNavigate }) => {
  const getStatus = (qId: string) => {
    const ans = activeSession.answers[qId];
    
    // Keandalan pengecekan apakah soal sudah dijawab (Array, Object, atau String)
    let isAnswered = false;
    if (ans !== null && ans !== undefined) {
      if (Array.isArray(ans)) {
        isAnswered = ans.length > 0;
      } else if (typeof ans === 'object') {
        // Mencegah deteksi salah pada null atau array kosong
        isAnswered = Object.keys(ans).length > 0;
      } else {
        isAnswered = ans.toString().trim() !== "";
      }
    }
    
    if (activeSession.uncertainAnswers.includes(qId.toString())) return 'UNCERTAIN';
    if (isAnswered) return 'ANSWERED';
    return 'EMPTY';
  };

  return (
    <div className="w-full lg:w-72 space-y-4">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border-2 border-slate-50">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center italic">NAVIGASI SOAL</h4>
        <div className="grid grid-cols-5 gap-3">
          {questions.map((q, i) => {
            const status = getStatus(q.id);
            let btnClass = "bg-slate-50 text-slate-400 border-slate-100";
            
            if (status === 'ANSWERED') btnClass = "bg-blue-900 text-white border-blue-900 shadow-md shadow-blue-100";
            if (status === 'UNCERTAIN') btnClass = "bg-amber-400 text-amber-950 border-amber-500 shadow-md shadow-amber-100 font-black";
            
            if (currentIndex === i) btnClass += " ring-4 ring-offset-2 ring-blue-200 scale-110 z-10";

            return (
              <button 
                key={q.id} 
                onClick={() => onNavigate(i)} 
                className={`w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center border-2 transition-all hover:scale-105 active:scale-95 ${btnClass}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-50 space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
              <span className="text-[8px] font-black text-slate-400 uppercase">Sudah Dijawab</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-sm"></div>
              <span className="text-[8px] font-black text-slate-400 uppercase">Ragu-Ragu</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-slate-100 border rounded-sm"></div>
              <span className="text-[8px] font-black text-slate-400 uppercase">Belum Dilihat</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;