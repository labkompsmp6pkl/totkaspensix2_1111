import React from 'react';
import { 
  BookOpen, Layers, Users, Activity, 
  History, Settings, ShieldCheck, ArrowRight,
  PlusCircle, FileText, UserPlus, Zap
} from 'lucide-react';
import QuickActionCard from './QuickActionCard';

interface AdminMenuProps {
  setActiveTab: (tab: 'MENU' | 'SOAL' | 'SESI' | 'PENGGUNA' | 'MONITORING' | 'LOG') => void;
}

const AdminMenu: React.FC<AdminMenuProps> = ({ setActiveTab }) => {
  
  const mainCards = [
    { 
      id: 'SOAL', 
      title: 'Bank Soal', 
      desc: 'Kelola butir soal, materi, dan kategori ujian.', 
      icon: BookOpen, 
      color: 'blue',
      stats: '800+ Soal'
    },
    { 
      id: 'SESI', 
      title: 'Sesi Ujian', 
      desc: 'Atur jadwal, durasi, dan token akses ujian.', 
      icon: Layers, 
      color: 'indigo',
      stats: '12 Aktif'
    },
    { 
      id: 'PENGGUNA', 
      title: 'Data Pengguna', 
      desc: 'Manajemen akun siswa, guru, dan staf.', 
      icon: Users, 
      color: 'emerald',
      stats: '1.2k User'
    },
    { 
      id: 'MONITORING', 
      title: 'Monitoring', 
      desc: 'Pantau aktivitas ujian siswa secara real-time.', 
      icon: Activity, 
      color: 'rose',
      stats: 'Live DNA'
    },
  ];

  const quickActions = [
    { title: 'Tambah Soal', icon: PlusCircle, tab: 'SOAL' as const },
    { title: 'Buat Sesi', icon: Zap, tab: 'SESI' as const },
    { title: 'Input Siswa', icon: UserPlus, tab: 'PENGGUNA' as const },
    { title: 'Cek Log', icon: History, tab: 'LOG' as const },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Welcome Section */}
      <div className="relative bg-blue-900 rounded-[3rem] p-10 sm:p-16 text-white overflow-hidden shadow-2xl shadow-blue-200">
         {/* Background Pattern */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
         
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
               <ShieldCheck className="w-4 h-4 text-blue-300" />
               System Administrator Verified
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] mb-6">
               Selamat Datang <br />
               <span className="text-blue-400">Di Dashboard.</span>
            </h1>
            <p className="text-blue-100/70 text-lg font-medium leading-relaxed mb-10">
               Pusat kendali akademik SMP Negeri 06 Pekalongan. Kelola seluruh aspek ujian digital Anda dari satu antarmuka terpadu.
            </p>
            <div className="flex flex-wrap gap-4">
               <button 
                 onClick={() => setActiveTab('MONITORING')}
                 className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3"
               >
                 Mulai Monitoring
                 <ArrowRight className="w-5 h-5" />
               </button>
               <div className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Node Status: Online</span>
               </div>
            </div>
         </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
         {mainCards.map((card, i) => (
           <button 
             key={card.id}
             onClick={() => setActiveTab(card.id as any)}
             className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-500 hover:shadow-blue-100 transition-all text-left overflow-hidden"
           >
              <div className={`w-16 h-16 bg-${card.color}-50 text-${card.color}-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                 <card.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-3">{card.title}</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 uppercase tracking-tight">{card.desc}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                 <span className={`text-[10px] font-black px-3 py-1 bg-${card.color}-50 text-${card.color}-600 rounded-full uppercase tracking-widest`}>
                    {card.stats}
                 </span>
                 <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
              </div>
           </button>
         ))}
      </div>

      {/* Quick Actions & Secondary Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Quick Action Panel */}
         <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-10">
               <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Aksi Cepat</h4>
               <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
               {quickActions.map((action, i) => (
                 <QuickActionCard 
                   key={i} 
                   title={action.title} 
                   icon={action.icon} 
                   onClick={() => setActiveTab(action.tab)} 
                 />
               ))}
            </div>
         </div>

         {/* System Info Panel */}
         <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] -mr-16 -mt-16"></div>
            <h4 className="text-xl font-black uppercase italic tracking-tighter mb-8">System Info</h4>
            <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Version</span>
                  <span className="text-xs font-black text-blue-400">9.9.0-STABLE</span>
               </div>
               <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Database</span>
                  <span className="text-xs font-black text-emerald-400">CONNECTED</span>
               </div>
               <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Storage</span>
                  <span className="text-xs font-black text-slate-300">84% FREE</span>
               </div>
               <div className="pt-4">
                  <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
                     Check For Updates
                  </button>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
};

export default AdminMenu;
