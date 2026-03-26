import React from 'react';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';

interface ActiveExamsProps {
  exams: any[];
  onStart: (exam: any) => void;
}

const ActiveExams: React.FC<ActiveExamsProps> = ({ exams, onStart }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col h-full overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Ujian Tersedia</h4>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {exams.map((exam, i) => (
          <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xs border border-slate-100 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{exam.name}</p>
              <div className="flex items-center gap-3 mt-1">
                 <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{exam.duration}m</span>
                 </div>
                 <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{exam.question_count || 0} Soal</span>
              </div>
            </div>
            <button 
              onClick={() => onStart(exam)}
              className="p-3 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-slate-100 shadow-sm"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ))}
        {exams.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 opacity-50 py-10">
            <BookOpen className="w-10 h-10" />
            <p className="text-[10px] font-black uppercase tracking-widest">Tidak ada ujian aktif</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveExams;
