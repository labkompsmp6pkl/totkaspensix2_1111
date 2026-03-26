import React from 'react';
import { Users, GraduationCap, CheckCircle2, AlertCircle, TrendingUp, Activity } from 'lucide-react';

interface TeacherStatsProps {
  scores: any[];
}

const TeacherStats: React.FC<TeacherStatsProps> = ({ scores }) => {
  const totalStudents = new Set(scores.map(s => s.student_id)).size;
  const averageScore = scores.length > 0 
    ? scores.reduce((acc, s) => acc + parseFloat(s.score), 0) / scores.length 
    : 0;
  const passCount = scores.filter(s => parseFloat(s.score) >= 75).length;
  const passRate = scores.length > 0 ? (passCount / scores.length) * 100 : 0;

  const stats = [
    { label: 'Total Siswa', value: totalStudents, icon: Users, color: 'blue' },
    { label: 'Rata-rata Nilai', value: averageScore.toFixed(1), icon: TrendingUp, color: 'indigo' },
    { label: 'Tingkat Kelulusan', value: `${passRate.toFixed(0)}%`, icon: CheckCircle2, color: 'emerald' },
    { label: 'Total Ujian', value: scores.length, icon: Activity, color: 'rose' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-all">
          <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-2">
             <div className={`w-1.5 h-1.5 bg-${stat.color}-500 rounded-full`}></div>
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Real-time</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherStats;
