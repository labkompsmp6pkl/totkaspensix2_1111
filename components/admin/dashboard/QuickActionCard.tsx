import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, icon: Icon, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-4 p-6 bg-slate-50 border border-slate-200 rounded-3xl hover:bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-50 transition-all group"
    >
      <div className="p-3 bg-white text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl border border-slate-100 group-hover:border-blue-100 transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-900 uppercase tracking-widest text-center leading-tight">
        {title}
      </span>
    </button>
  );
};

export default QuickActionCard;
