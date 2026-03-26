import React from 'react';
import { Shield, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface SystemStatusProps {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync?: Date;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ isOnline, isSyncing, lastSync }) => {
  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center gap-6 text-white">
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
          <span className="text-[9px] font-black uppercase tracking-widest">
            {isOnline ? 'System Online' : 'System Offline'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isSyncing ? (
            <div className="flex items-center gap-2 text-indigo-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-widest">Syncing...</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Last Sync</span>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {lastSync ? lastSync.toLocaleTimeString('id-ID') : '--:--'}
              </span>
            </div>
          )}
        </div>

        <div className="p-2 bg-white/10 rounded-xl">
          <Shield className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
