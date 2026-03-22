import React from 'react';
import { User } from '../../../types';
import { formatFullDateTime } from '../../../utils';

interface UserLogInspectorProps {
  user: User;
  onClose: () => void;
  accessLogs: any[];
  sessionLogs: any[];
}

const UserLogInspector: React.FC<UserLogInspectorProps> = ({ user, onClose, accessLogs, sessionLogs }) => {
  const userAccessLogs = accessLogs.filter(l => String(l.user_id) === String(user.id));
  const userSessionLogs = sessionLogs.filter(l => String(l.user_id) === String(user.id));

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[5000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl border-4 border-white animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h3 className="text-2xl font-black uppercase text-blue-900 italic tracking-tighter">📋 Audit Jejak: {user.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">NIS/ID: {user.username} • #{user.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Aktivitas Login Terakhir</h4>
            <div className="space-y-3">
              {userAccessLogs.length > 0 ? (
                userAccessLogs.map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border shadow-sm">
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase">{log.group_name || 'Portal Utama'}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatFullDateTime(log.created_at)}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[8px] font-black rounded-lg uppercase">LOGIN</span>
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-slate-300 uppercase italic text-center py-4">Belum ada jejak login</p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Aktivitas Ujian (Session Events)</h4>
            <div className="space-y-3">
              {userSessionLogs.length > 0 ? (
                userSessionLogs.map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border shadow-sm">
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase">{log.event_type}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatFullDateTime(log.created_at)}</p>
                      {log.details && <p className="text-[8px] text-slate-400 mt-1 italic">{log.details}</p>}
                    </div>
                    <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase ${log.event_type === 'finish' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{log.event_type}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-slate-300 uppercase italic text-center py-4">Belum ada aktivitas ujian</p>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="mt-8 w-full py-4 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase shadow-xl border-b-4 border-blue-950 active:scale-95 transition-all"
        >
          TUTUP AUDIT
        </button>
      </div>
    </div>
  );
};

export default UserLogInspector;
