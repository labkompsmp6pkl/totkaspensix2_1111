import React from 'react';
import { BookOpen, Layers, Users, Activity, History } from 'lucide-react';

interface AdminMenuProps {
  setActiveTab: (tab: any) => void;
}

const AdminMenu: React.FC<AdminMenuProps> = ({ setActiveTab }) => {
  const menuItems = [
    { id: 'SOAL', label: 'Bank Soal', desc: 'Kelola butir soal dan kunci jawaban', icon: <BookOpen className="w-8 h-8" />, color: 'bg-blue-500' },
    { id: 'SESI', label: 'Sesi Ujian', desc: 'Atur jadwal dan kode akses ujian', icon: <Layers className="w-8 h-8" />, color: 'bg-indigo-500' },
    { id: 'PENGGUNA', label: 'Data Pengguna', desc: 'Manajemen akun siswa dan guru', icon: <Users className="w-8 h-8" />, color: 'bg-emerald-500' },
    { id: 'MONITORING', label: 'Monitoring', desc: 'Pantau aktivitas ujian real-time', icon: <Activity className="w-8 h-8" />, color: 'bg-amber-500' },
    { id: 'LOG', label: 'Audit Log', desc: 'Riwayat sistem dan audit kesalahan', icon: <History className="w-8 h-8" />, color: 'bg-rose-500' },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as any)}
          className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all text-left overflow-hidden active:scale-[0.98]"
        >
          <div className={`w-16 h-16 ${item.color} text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
            {item.icon}
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">{item.label}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
          
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
            {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-24 h-24' })}
          </div>
        </button>
      ))}
    </div>
  );
};

export default AdminMenu;
