import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Trash2, RefreshCw, Terminal, Search, Filter, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_BASE_URL } from '../../utils';

interface ErrorLog {
  id: number;
  error_message: string;
  stack_trace: string;
  url: string;
  user_id: string | null;
  created_at: string;
}

const ErrorLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}?action=get_error_logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Gagal memuat log error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm("Hapus semua log error?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}?action=clear_error_logs`);
      if (res.ok) fetchLogs();
    } catch (err) {}
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => 
    log.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.stack_trace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">System Error Logs</h4>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Pantau pengecualian runtime dan kegagalan API.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={clearLogs}
            className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            BERSIHKAN LOG
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Cari pesan error atau stack trace..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
        />
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? filteredLogs.map((log) => (
          <div 
            key={log.id} 
            className={`
              bg-white rounded-[2rem] border transition-all overflow-hidden
              ${expandedId === log.id ? 'border-indigo-200 shadow-xl ring-4 ring-indigo-50' : 'border-slate-200 shadow-sm hover:border-slate-300'}
            `}
          >
            <div 
              className="p-6 cursor-pointer flex items-start gap-5"
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            >
              <div className={`p-3 rounded-xl shrink-0 ${expandedId === log.id ? 'bg-indigo-600 text-white' : 'bg-red-50 text-red-500'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    ID: {log.id}
                  </span>
                </div>
                <h5 className="text-sm font-black text-slate-800 leading-tight break-words">
                  {log.error_message}
                </h5>
                <p className="text-[10px] font-mono text-indigo-500 mt-2 truncate">
                  {log.url}
                </p>
              </div>
              <div className={`p-2 text-slate-300 transition-transform duration-300 ${expandedId === log.id ? 'rotate-90 text-indigo-400' : ''}`}>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {expandedId === log.id && (
              <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto border-t-4 border-indigo-500 shadow-inner">
                  <div className="flex items-center gap-2 mb-4 text-indigo-400">
                    <Terminal className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Stack Trace & Context</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {log.stack_trace || 'No stack trace available.'}
                  </pre>
                  
                  <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">User Context</p>
                      <p className="text-xs font-bold text-white">{log.user_id ? `User ID: ${log.user_id}` : 'Anonymous / System'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Endpoint</p>
                      <p className="text-xs font-bold text-white break-all">{log.url}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-10 h-10" />
             </div>
             <h5 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Sistem Bersih</h5>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Tidak ada log error yang perlu diperhatikan.</p>
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total {logs.length} log tersimpan</p>
         <div className="flex items-center gap-2">
            <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
            <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronRight className="w-6 h-6" /></button>
         </div>
      </div>

    </div>
  );
};

export default ErrorLogViewer;
