import React from 'react';
import { BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface StudentStatsGridProps {
  scores: any[];
}

const StudentStatsGrid: React.FC<StudentStatsGridProps> = ({ scores }) => {
  const totalExams = scores.length;
  const averageScore = scores.length > 0 
    ? scores.reduce((acc, s) => acc + parseFloat(s.score), 0) / scores.length 
    : 0;
  const passCount = scores.filter(s => parseFloat(s.score) >= 75).length;
  const passRate = scores.length > 0 ? (passCount / scores.length) * 100 : 0;

  const stats = [
    { label: 'Ujian Selesai', value: totalExams, icon: BookOpen, color: 'blue', trend: '+2' },
    { label: 'Rata-rata Nilai', value: averageScore.toFixed(1), icon: TrendingUp, color: 'indigo', trend: '+5.2' },
    { label: 'Tingkat Kelulusan', value: `${passRate.toFixed(0)}%`, icon: CheckCircle2, color: 'emerald', trend: 'Stabil' },
    { label: 'Total Menit', value: totalExams * 60, icon: Clock, color: 'rose', trend: '+120' },
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

export default StudentStatsGrid;
