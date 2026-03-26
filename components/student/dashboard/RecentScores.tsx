import React from 'react';
import { History, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface RecentScoresProps {
  scores: any[];
  onViewAll: () => void;
}

const RecentScores: React.FC<RecentScoresProps> = ({ scores, onViewAll }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col h-full overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-indigo-600" />
          <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Riwayat Nilai</h4>
        </div>
        <button onClick={onViewAll} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {scores.slice(0, 6).map((score, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 ${
              parseFloat(score.score) >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {parseFloat(score.score) >= 75 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{score.group_name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {new Date(score.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-black ${parseFloat(score.score) >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {parseFloat(score.score).toFixed(0)}
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SKOR</p>
            </div>
          </div>
        ))}
        {scores.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 opacity-50 py-10">
            <History className="w-10 h-10" />
            <p className="text-[10px] font-black uppercase tracking-widest">Belum ada riwayat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentScores;
