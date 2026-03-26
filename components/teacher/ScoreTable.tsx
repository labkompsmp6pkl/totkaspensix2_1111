import React from 'react';
import { User, BookOpen, Clock, CheckCircle2, AlertCircle, Search, Filter, Download } from 'lucide-react';

interface ScoreTableProps {
  scores: any[];
  onViewDetails?: (score: any) => void;
}

const ScoreTable: React.FC<ScoreTableProps> = ({ scores, onViewDetails }) => {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full border-separate border-spacing-y-4">
        <thead>
          <tr className="text-left">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesi Ujian</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, i) => (
            <tr key={i} className="bg-white hover:bg-slate-50 transition-all group">
              <td className="px-6 py-5 rounded-l-[1.5rem] border-y border-l border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs border border-indigo-100">
                    {score.student_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{score.student_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{score.student_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 border-y border-slate-100">
                <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{score.group_name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(score.created_at).toLocaleDateString('id-ID')}
                </p>
              </td>
              <td className="px-6 py-5 border-y border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black ${parseFloat(score.score) >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {parseFloat(score.score).toFixed(1)}
                  </span>
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${parseFloat(score.score) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${score.score}%` }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 border-y border-slate-100">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                  parseFloat(score.score) >= 75 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {parseFloat(score.score) >= 75 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {parseFloat(score.score) >= 75 ? 'Lulus' : 'Remedi'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 rounded-r-[1.5rem] border-y border-r border-slate-100 text-right">
                <button 
                  onClick={() => onViewDetails?.(score)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
                >
                  <Search className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {scores.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
          <BookOpen className="w-16 h-16 opacity-20" />
          <p className="text-xs font-black uppercase tracking-widest">Belum ada data nilai</p>
        </div>
      )}
    </div>
  );
};

export default ScoreTable;
