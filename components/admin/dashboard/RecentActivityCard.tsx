import React from 'react';
import { History, Clock, User, ArrowRight } from 'lucide-react';

interface RecentActivityCardProps {
  logs: any[];
  onClick: () => void;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ logs, onClick }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col h-full overflow-hidden group">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-indigo-600" />
          <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Aktivitas Terbaru</h4>
        </div>
        <button onClick={onClick} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {logs.slice(0, 5).map((log, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{log.action}</p>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">{log.details}</p>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 opacity-50 py-10">
            <History className="w-10 h-10" />
            <p className="text-[10px] font-black uppercase tracking-widest">Belum ada aktivitas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityCard;
