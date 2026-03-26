import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'indigo' | 'emerald' | 'rose' | 'amber';
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 group hover:scale-[1.02] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-4 ${colorClasses[color]} rounded-2xl group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-[9px] font-black px-2 py-1 rounded-full ${colorClasses[color]} uppercase tracking-widest`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
    </div>
  );
};

export default StatCard;
