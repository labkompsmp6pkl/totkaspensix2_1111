
import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, Terminal, Trash2, Send } from 'lucide-react';
import { API_BASE_URL } from '../../utils';
import { logEventToRemote } from '../../utils/logger';

const ErrorLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}?action=get_error_logs`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || 'Belum ada log error.');
      } else {
        setError(data.message || 'Gagal mengambil log.');
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLog = async () => {
    await logEventToRemote('MANUAL_TEST_LOG', { message: 'Ini adalah log tes manual dari Admin Dashboard' });
    setSuccessMessage('Log tes berhasil dikirim! Silakan refresh untuk melihat.');
    setTimeout(() => setSuccessMessage(null), 5000);
    fetchLogs();
  };

  const handleClearLogs = async () => {
    setShowClearConfirm(false);
    setIsLoading(true);
    try {
      // We need a clear action in api.php/LogController
      const res = await fetch(`${API_BASE_URL}?action=clear_error_logs`);
      const data = await res.json();
      if (data.success) {
        setLogs('Log berhasil dihapus.');
        setSuccessMessage('Semua log berhasil dihapus.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Gagal menghapus log.');
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/10 text-red-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">REMOTE ERROR AUDIT</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Log kesalahan sistem dari sisi klien (Frontend).</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestLog}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase hover:bg-indigo-100 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            Test Log
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase hover:bg-red-100 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs uppercase hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold animate-in slide-in-from-top duration-300">
          <RefreshCw className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Terminal className="w-32 h-32 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">error_logs.txt</span>
          </div>
          
          <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-[600px] no-scrollbar leading-relaxed">
            {logs}
          </pre>
        </div>
      </div>
      
      <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-200">
        <h3 className="text-lg font-black italic uppercase tracking-tighter mb-2">Informasi Audit</h3>
        <p className="text-indigo-100 text-xs leading-relaxed">
          Log ini mencatat kesalahan yang terjadi di browser pengguna secara real-time. 
          Gunakan data ini untuk mendiagnosa masalah tampilan atau fungsionalitas yang dilaporkan oleh siswa atau guru.
        </p>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2 uppercase italic tracking-tighter">HAPUS SEMUA LOG?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 font-medium">Tindakan ini tidak dapat dibatalkan. Semua catatan kesalahan akan dihapus selamanya.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
              >
                BATAL
              </button>
              <button
                onClick={handleClearLogs}
                className="px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                YA, HAPUS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorLogViewer;
