import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';

interface MonitoringCardProps {
  activeCount: number;
  onClick: () => void;
}

const MonitoringCard: React.FC<MonitoringCardProps> = ({ activeCount, onClick }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-indigo-500 transition-all">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Activity className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
          </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-3">Monitoring DNA</h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight leading-relaxed">
          Pantau aktivitas real-time siswa yang sedang mengerjakan ujian.
        </p>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Siswa Aktif</p>
          <p className="text-2xl font-black text-indigo-600">{activeCount}</p>
        </div>
        <button 
          onClick={onClick}
          className="p-4 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl transition-all"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MonitoringCard;
