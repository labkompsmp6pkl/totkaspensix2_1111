import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Cpu, Database, Globe } from 'lucide-react';

const SystemHealthCard: React.FC = () => {
  const metrics = [
    { label: 'API Node', status: 'Healthy', icon: Globe, color: 'emerald' },
    { label: 'Database', status: 'Connected', icon: Database, color: 'emerald' },
    { label: 'CPU Load', status: '12%', icon: Cpu, color: 'blue' },
  ];

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] -mr-16 -mt-16"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-white/10 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-lg font-black uppercase italic tracking-tighter leading-none">System Health</h4>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Status Infrastruktur</p>
        </div>
      </div>

      <div className="space-y-5">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <m.icon className={`w-4 h-4 text-${m.color}-400`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
            </div>
            <span className={`text-[10px] font-black text-${m.color}-400 uppercase tracking-widest`}>{m.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">All Systems Operational</span>
         </div>
         <span className="text-[9px] font-mono font-bold text-slate-500">v9.9.0</span>
      </div>
    </div>
  );
};

export default SystemHealthCard;
