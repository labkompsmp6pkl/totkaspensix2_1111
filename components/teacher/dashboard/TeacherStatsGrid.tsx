import React from 'react';
import { Users, TrendingUp, CheckCircle2, Activity } from 'lucide-react';

interface TeacherStatsGridProps {
  scores: any[];
}

const TeacherStatsGrid: React.FC<TeacherStatsGridProps> = ({ scores }) => {
  const totalStudents = new Set(scores.map(s => s.student_id)).size;
  const averageScore = scores.length > 0 
    ? scores.reduce((acc, s) => acc + parseFloat(s.score), 0) / scores.length 
    : 0;
  const passCount = scores.filter(s => parseFloat(s.score) >= 75).length;
  const passRate = scores.length > 0 ? (passCount / scores.length) * 100 : 0;

  const stats = [
    { label: 'Total Siswa', value: totalStudents, icon: Users, color: 'blue', trend: '+4' },
    { label: 'Rata-rata Nilai', value: averageScore.toFixed(1), icon: TrendingUp, color: 'indigo', trend: '+2.5' },
    { label: 'Tingkat Kelulusan', value: `${passRate.toFixed(0)}%`, icon: CheckCircle2, color: 'emerald', trend: '+12%' },
    { label: 'Total Ujian', value: scores.length, icon: Activity, color: 'rose', trend: 'Live' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between mb-6">
            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className={`text-[9px] font-black px-2 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600 uppercase tracking-widest`}>
              {stat.trend}
            </span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
};

export default TeacherStatsGrid;
