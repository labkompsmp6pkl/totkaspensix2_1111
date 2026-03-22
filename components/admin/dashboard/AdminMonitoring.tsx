import React from 'react';
import { Users, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import MonitoringDNA from '../MonitoringDNA';
import { User, Question, UserRole } from '../../../types';

interface AdminMonitoringProps {
  users: User[];
  groups: any[];
  questions: Question[];
  currentUser: User;
  lastSync?: Date;
  onRefresh: () => void;
}

const AdminMonitoring: React.FC<AdminMonitoringProps> = ({ 
  users, groups, questions, currentUser, lastSync, onRefresh 
}) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-300 uppercase">Online</p>
            <p className="text-lg font-black text-slate-900">{users.filter(u => u.role === UserRole.STUDENT).length} Siswa</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-300 uppercase">Sesi Aktif</p>
            <p className="text-lg font-black text-slate-900">{groups.length} Grup</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-300 uppercase">Error Log</p>
            <p className="text-lg font-black text-red-600">Terpusat</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-300 uppercase">Last Sync</p>
            <p className="text-lg font-black text-slate-900">{lastSync?.toLocaleTimeString() || '-'}</p>
          </div>
        </div>
      </div>
      <MonitoringDNA currentUser={currentUser} groups={groups} questions={questions} search="" refreshData={onRefresh} scores={[]} />
    </div>
  );
};

export default AdminMonitoring;
