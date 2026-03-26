import React from 'react';
import { BookOpen, Users, FileText, BarChart2, Settings, HelpCircle } from 'lucide-react';

interface TeacherMenuProps {
  onTabChange: (tab: string) => void;
}

const TeacherMenu: React.FC<TeacherMenuProps> = ({ onTabChange }) => {
  const menuItems = [
    { id: 'ANALYTICS', label: 'Analisis Nilai', icon: BarChart2, color: 'indigo' },
    { id: 'STUDENTS', label: 'Data Siswa', icon: Users, color: 'blue' },
    { id: 'EXAMS', label: 'Bank Soal', icon: BookOpen, color: 'emerald' },
    { id: 'REPORTS', label: 'Laporan', icon: FileText, color: 'amber' },
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

export default TeacherMenu;
