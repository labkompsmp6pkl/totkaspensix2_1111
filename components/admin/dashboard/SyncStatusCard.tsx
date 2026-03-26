import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface SyncStatusCardProps {
  lastSync?: Date;
  isSyncing: boolean;
  onRefresh: () => void;
}

const SyncStatusCard: React.FC<SyncStatusCardProps> = ({ lastSync, isSyncing, onRefresh }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${isSyncing ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Sinkronisasi</p>
          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
            {isSyncing ? 'Sedang Sinkron...' : lastSync ? `Terakhir: ${lastSync.toLocaleTimeString('id-ID')}` : 'Belum Sinkron'}
          </p>
        </div>
      </div>
      <button 
        onClick={onRefresh}
        disabled={isSyncing}
        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-30"
      >
        <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default SyncStatusCard;
