import React, { useMemo, useState } from 'react';
import { Clock, User, Shield, AlertCircle, CheckCircle2, Info, Search, Filter } from 'lucide-react';

interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user_name?: string;
}

interface AuditTimelineProps {
  logs: AuditLog[];
}

const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = (log.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, filterAction]);

  const getActionStyles = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN': return { icon: User, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'SUBMIT_SCORE': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'DELETE_USER':
      case 'DELETE_QUESTION': return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
      case 'UPDATE_CONFIG': return { icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      default: return { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari log audit..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
           <Filter className="w-4 h-4 text-slate-400 ml-2" />
           <select 
             value={filterAction}
             onChange={(e) => setFilterAction(e.target.value)}
             className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all min-w-[140px]"
           >
             <option value="all">Semua Aksi</option>
             <option value="LOGIN">Login</option>
             <option value="SUBMIT_SCORE">Submit Ujian</option>
             <option value="UPDATE_CONFIG">Konfigurasi</option>
             <option value="DELETE_USER">Hapus User</option>
           </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
        {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => {
          const styles = getActionStyles(log.action);
          const Icon = styles.icon;
          
          return (
            <div key={log.id} className="relative flex items-start gap-8 group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
              
              {/* Timeline Indicator */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-2xl ${styles.bg} ${styles.border} border-2 shadow-sm transition-transform group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${styles.color}`} />
              </div>

              {/* Log Content */}
              <div className="flex-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${styles.bg} ${styles.color} uppercase tracking-widest border ${styles.border}`}>
                      {log.action}
                    </span>
                    <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                      {log.user_name || 'Sistem'}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4">
                  {log.details}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IP ADDRESS</span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg">{log.ip_address}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">DEVICE</span>
                      <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]" title={log.user_agent}>
                        {log.user_agent.split(')')[0].split('(')[1] || 'Unknown Device'}
                      </span>
                   </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tidak ada log audit yang ditemukan.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuditTimeline;
