import React from 'react';
import { BookOpen, Clock, ArrowRight, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

interface ExamCardProps {
  exam: any;
  onStart: (exam: any) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onStart }) => {
  const isStarted = !!exam.last_started_at;
  const isCompleted = !!exam.completed_at;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-indigo-500 transition-all">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            isStarted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
          }`}>
             <div className={`w-1.5 h-1.5 rounded-full ${isStarted ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
             <span className="text-[9px] font-black uppercase tracking-widest">
               {isStarted ? 'Aktif' : 'Belum Mulai'}
             </span>
          </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-3">{exam.name}</h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight leading-relaxed mb-6">
          {exam.description || 'Ujian digital SMP Negeri 06 Pekalongan.'}
        </p>
        
        <div className="flex flex-wrap gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{exam.duration} Menit</span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secure</span>
           </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
        <div className="flex -space-x-2">
           {[1,2,3].map(i => (
             <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">
               {i}
             </div>
           ))}
           <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-black text-indigo-600 uppercase">
             +12
           </div>
        </div>
        <button 
          onClick={() => onStart(exam)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-3"
        >
          Mulai Ujian
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ExamCard;
