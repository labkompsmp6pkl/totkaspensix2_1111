import React from 'react';
import { 
  Users, BookOpen, Layers, CheckCircle2, 
  TrendingUp, Activity, ShieldCheck, Clock 
} from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalQuestions: number;
    totalGroups: number;
    activeGroups: number;
  };
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const statCards = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'blue', trend: '+12' },
    { label: 'Bank Soal', value: stats.totalQuestions, icon: BookOpen, color: 'indigo', trend: '+45' },
    { label: 'Sesi Ujian', value: stats.totalGroups, icon: Layers, color: 'emerald', trend: 'Stabil' },
    { label: 'Sesi Aktif', value: stats.activeGroups, icon: Activity, color: 'rose', trend: 'Live' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className={`text-[9px] font-black px-2 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600 uppercase tracking-widest`}>
              {stat.trend}
            </span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
             <div className={`w-1.5 h-1.5 bg-${stat.color}-500 rounded-full`}></div>
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Updated 2m ago</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
