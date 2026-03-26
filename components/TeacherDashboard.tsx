import React, { useState, useEffect, useMemo } from 'react';
import { Question, QuestionGroup, User, Score } from '../types';
import { 
  LayoutDashboard, BookOpen, Users, 
  CheckCircle2, Clock, TrendingUp, Search, 
  Filter, Download, ArrowUpRight, GraduationCap,
  Calendar, ChevronRight, MoreVertical, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';

interface TeacherDashboardProps {
  scores: Score[];
  groups: QuestionGroup[];
  questions: Question[];
  users: User[];
  activeGroupId: number | null;
  API_BASE_URL: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  scores, groups, questions, users, activeGroupId, API_BASE_URL 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<string | 'all'>('all');

  // 1. STATS CALCULATION
  const stats = useMemo(() => {
    const totalExams = scores.length;
    const avgScore = totalExams > 0 ? Math.round(scores.reduce((acc, s) => acc + Number(s.score), 0) / totalExams) : 0;
    const passingCount = scores.filter(s => Number(s.score) >= 75).length;
    const passingRate = totalExams > 0 ? Math.round((passingCount / totalExams) * 100) : 0;
    
    return { totalExams, avgScore, passingRate, totalStudents: users.filter(u => u.role === 'STUDENT').length };
  }, [scores, users]);

  // 2. DATA FILTERING
  const filteredScores = useMemo(() => {
    return scores.filter(s => {
      const student = users.find(u => u.id === s.studentId);
      const matchesSearch = student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           student?.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === 'all' || Number(s.groupId) === Number(selectedGroup);
      const matchesClass = selectedClass === 'all' || student?.kelas === selectedClass;
      
      return matchesSearch && matchesGroup && matchesClass;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [scores, users, searchTerm, selectedGroup, selectedClass]);

  // 3. CHART DATA
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { name: '0-20', count: 0, color: '#ef4444' },
      { name: '21-40', count: 0, color: '#f97316' },
      { name: '41-60', count: 0, color: '#f59e0b' },
      { name: '61-80', count: 0, color: '#84cc16' },
      { name: '81-100', count: 0, color: '#10b981' },
    ];
    
    scores.forEach(s => {
      const score = Number(s.score);
      if (score <= 20) ranges[0].count++;
      else if (score <= 40) ranges[1].count++;
      else if (score <= 60) ranges[2].count++;
      else if (score <= 80) ranges[3].count++;
      else ranges[4].count++;
    });
    
    return ranges;
  }, [scores]);

  const classes = useMemo(() => {
    const unique = new Set(users.filter(u => u.role === 'STUDENT' && u.kelas).map(u => u.kelas));
    return Array.from(unique).sort();
  }, [users]);

  return (
    <div className="p-6 sm:p-10 space-y-10 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <LayoutDashboard className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Teacher Analytics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Dashboard Guru</h2>
          <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">Pantau progres dan hasil ujian siswa secara real-time.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
           <div className="px-4 py-2 border-r border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Periode Aktif</p>
              <p className="text-xs font-black text-slate-700">Semester Genap 2025/2026</p>
           </div>
           <div className="p-2 text-indigo-600">
              <Calendar className="w-5 h-5" />
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Ujian', value: stats.totalExams, icon: BookOpen, color: 'blue', trend: '+12%' },
          { label: 'Rata-rata Nilai', value: stats.avgScore, icon: TrendingUp, color: 'indigo', trend: '+5.4' },
          { label: 'Tingkat Kelulusan', value: `${stats.passingRate}%`, icon: CheckCircle2, color: 'emerald', trend: '+2.1%' },
          { label: 'Siswa Terdaftar', value: stats.totalStudents, icon: Users, color: 'orange', trend: 'Stabil' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full bg-${stat.color === 'emerald' ? 'emerald' : 'slate'}-50 text-${stat.color === 'emerald' ? 'emerald' : 'slate'}-600 uppercase tracking-widest`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart: Distribusi Nilai */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Distribusi Nilai Siswa</h4>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Rentang Nilai
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  labelStyle={{fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px'}}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Card: Sesi Terpopuler */}
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[5rem] -mr-16 -mt-16"></div>
           
           <div className="relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl w-fit mb-6">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-2">Sesi Ujian <br/> Teraktif</h4>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">Berdasarkan jumlah partisipan</p>
           </div>

           <div className="relative z-10 space-y-4 mt-8">
              {groups.slice(0, 3).map((g, i) => (
                <div key={i} className="flex items-center justify-between bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-[10px] font-black">0{i+1}</div>
                      <span className="text-xs font-black uppercase tracking-tight truncate max-w-[120px]">{g.group_name}</span>
                   </div>
                   <ArrowUpRight className="w-4 h-4 text-indigo-300" />
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Table Section: Recent Results */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Table Header & Filters */}
        <div className="p-8 border-b border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Hasil Ujian Terbaru</h4>
            <div className="flex items-center gap-2">
               <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Download className="w-5 h-5" />
               </button>
               <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Filter className="w-5 h-5" />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari nama siswa..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>
            <select 
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            >
              <option value="all">Semua Sesi</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
            </select>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesi Ujian</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nilai</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Selesai</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScores.length > 0 ? filteredScores.map((s, i) => {
                const student = users.find(u => u.id === s.studentId);
                const group = groups.find(g => Number(g.id) === Number(s.groupId));
                const scoreNum = Number(s.score);
                const isPassing = scoreNum >= 75;

                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                          {student?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{student?.name || 'Unknown'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelas {student?.kelas || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">{group?.group_name || 'Sesi Terhapus'}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-lg font-black ${isPassing ? 'text-emerald-600' : 'text-red-500'}`}>
                        {scoreNum}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {new Date(s.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isPassing ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                        {isPassing ? 'Lulus' : 'Remidi'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                          <AlertCircle className="w-8 h-8" />
                       </div>
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tidak ada data hasil ujian ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menampilkan {filteredScores.length} dari {scores.length} data</p>
           <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30" disabled><ChevronRight className="w-5 h-5 rotate-180" /></button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30" disabled><ChevronRight className="w-5 h-5" /></button>
           </div>
        </div>
      </div>

    </div>
  );
};

export default TeacherDashboard;
