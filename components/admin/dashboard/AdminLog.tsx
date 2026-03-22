import React from 'react';
import { Users, History, AlertTriangle } from 'lucide-react';
import AuditTimeline from '../AuditTimeline';
import ErrorLogViewer from '../ErrorLogViewer';
import { User } from '../../../types';

interface AdminLogProps {
  accessLogs: any[];
  sessionLogs: any[];
  users: User[];
  fetchLogs: () => void;
  isLoadingLogs: boolean;
}

const AdminLog: React.FC<AdminLogProps> = ({ 
  accessLogs, sessionLogs, users, fetchLogs, isLoadingLogs 
}) => {
  return (
    <div className="space-y-12">
      {/* SYSTEM HEALTH SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Aktivitas</p>
            <p className="text-2xl font-black text-slate-900">{accessLogs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Sesi</p>
            <p className="text-2xl font-black text-slate-900">{sessionLogs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-red-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Error Terdeteksi</p>
            <p className="text-2xl font-black text-red-600">Terpusat</p>
          </div>
        </div>
      </div>

      <AuditTimeline 
        accessLogs={accessLogs} 
        sessionLogs={sessionLogs} 
        users={users}
        onRefresh={fetchLogs} 
        isLoading={isLoadingLogs} 
      />
      <div className="border-t-4 border-slate-200/30 pt-12">
        <ErrorLogViewer />
      </div>
    </div>
  );
};

export default AdminLog;
