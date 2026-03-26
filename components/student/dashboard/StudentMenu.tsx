import React from 'react';
import { BookOpen, History, User, Settings, HelpCircle, LogOut } from 'lucide-react';

interface StudentMenuProps {
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const StudentMenu: React.FC<StudentMenuProps> = ({ onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'EXAMS', label: 'Ujian Aktif', icon: BookOpen, color: 'indigo' },
    { id: 'HISTORY', label: 'Riwayat Nilai', icon: History, color: 'blue' },
    { id: 'PROFILE', label: 'Profil Saya', icon: User, color: 'emerald' },
    { id: 'HELP', label: 'Bantuan', icon: HelpCircle, color: 'amber' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className="flex flex-col items-center gap-4 p-8 bg-white border border-slate-200 rounded-[2.5rem] hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all group"
        >
          <div className={`p-4 bg-${item.color}-50 text-${item.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
            <item.icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-900 uppercase tracking-widest text-center leading-tight">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default StudentMenu;
