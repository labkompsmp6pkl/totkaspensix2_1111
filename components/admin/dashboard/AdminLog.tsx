import React from 'react';
import { History, Terminal, RefreshCw, Search, Filter, Trash2, Clock, AlertCircle } from 'lucide-react';

interface AdminLogProps {
  accessLogs: any[];
  sessionLogs: any[];
  users: any[];
  fetchLogs: () => void;
  isLoadingLogs: boolean;
}

const AdminLog: React.FC<AdminLogProps> = ({ accessLogs, sessionLogs, users, fetchLogs, isLoadingLogs }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Log */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <History className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Forensics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Audit & Log Sistem</h2>
          <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">Rekam jejak aktivitas pengguna dan kesehatan server.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={fetchLogs}
             className={`flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-sm hover:bg-slate-50 transition-all ${isLoadingLogs ? 'opacity-50' : ''}`}
             disabled={isLoadingLogs}
           >
             <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
             REFRESH LOG
           </button>
        </div>
      </div>

      {/* Log Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Kolom Kiri: Aktivitas Akses */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[700px]">
           <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <Terminal className="w-5 h-5 text-indigo-600" />
                 <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Aktivitas Akses</h4>
              </div>
              <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 uppercase tracking-widest">
                {accessLogs.length} Entri
              </span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {accessLogs.length > 0 ? accessLogs.map((log, i) => {
                const user = users.find(u => u.id === log.user_id);
                return (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                     <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                              {log.action.substring(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.action}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.name || 'Sistem'}</p>
                           </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {new Date(log.created_at).toLocaleTimeString('id-ID')}
                        </span>
                     </div>
                     <p className="text-[11px] text-slate-500 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-100">
                        {log.details}
                     </p>
                     <div className="mt-3 flex items-center gap-4 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        <span>IP: {log.ip_address}</span>
                        <span className="truncate max-w-[150px]">UA: {log.user_agent}</span>
                     </div>
                  </div>
                );
              }) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                   <History className="w-12 h-12" />
                   <p className="text-xs font-black uppercase tracking-widest">Belum ada aktivitas tercatat</p>
                </div>
              )}
           </div>
        </div>

        {/* Kolom Kanan: Event Sesi Ujian */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[700px]">
           <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <Clock className="w-5 h-5 text-emerald-600" />
                 <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Event Sesi Ujian</h4>
              </div>
              <span className="text-[10px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 uppercase tracking-widest">
                Real-time
              </span>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {sessionLogs.length > 0 ? sessionLogs.map((log, i) => {
                const user = users.find(u => u.id === log.user_id);
                const isError = log.action.includes('ERROR') || log.action.includes('ABNORMAL');
                
                return (
                  <div key={i} className={`p-5 rounded-2xl border transition-all ${isError ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${isError ? 'text-red-600' : 'text-emerald-600'}`}>
                              {log.action}
                           </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {new Date(log.created_at).toLocaleTimeString('id-ID')}
                        </span>
                     </div>
                     <p className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">{user?.name || 'Siswa'}</p>
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{log.details}</p>
                  </div>
                );
              }) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                   <AlertCircle className="w-12 h-12" />
                   <p className="text-xs font-black uppercase tracking-widest">Belum ada event sesi tercatat</p>
                </div>
              )}
           </div>
        </div>

      </div>

    </div>
  );
};

export default AdminLog;
