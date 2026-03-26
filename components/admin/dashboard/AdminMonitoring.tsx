import React, { useState, useMemo } from 'react';
import { Activity, Users, Clock, Shield, Search, Filter, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import MonitoringDNA from '../MonitoringDNA';
import AuditTimeline from '../AuditTimeline';

interface AdminMonitoringProps {
  users: any[];
  groups: any[];
  questions: any[];
  currentUser: any;
  lastSync?: Date;
  onRefresh: () => void;
}

const AdminMonitoring: React.FC<AdminMonitoringProps> = ({ users, groups, questions, currentUser, lastSync, onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<'DNA' | 'AUDIT'>('DNA');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Monitoring */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Activity className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Live System Pulse</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Pusat Monitoring</h2>
          <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">Pantau aktivitas real-time dan integritas sistem ujian.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
           <button
             onClick={() => setActiveSubTab('DNA')}
             className={`
               flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
               ${activeSubTab === 'DNA' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
             `}
           >
             <Activity className="w-4 h-4" />
             Live DNA
           </button>
           <button
             onClick={() => setActiveSubTab('AUDIT')}
             className={`
               flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
               ${activeSubTab === 'AUDIT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
             `}
           >
             <Shield className="w-4 h-4" />
             Audit Log
           </button>
        </div>
      </div>

      {/* Stats Summary Monitoring */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Siswa Aktif', value: '24', icon: Users, color: 'blue' },
           { label: 'Sesi Live', value: groups.filter(g => g.last_started_at).length, icon: Activity, color: 'emerald' },
           { label: 'Rata-rata Durasi', value: '42m', icon: Clock, color: 'amber' },
           { label: 'Sistem Health', value: '99.9%', icon: Shield, color: 'indigo' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-5">
              <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Main Monitoring Content */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-8 sm:p-12 min-h-[600px]">
         {activeSubTab === 'DNA' ? (
           <MonitoringDNA users={users} groups={groups} />
         ) : (
           <AuditTimeline logs={[]} />
         )}
      </div>

    </div>
  );
};

export default AdminMonitoring;
