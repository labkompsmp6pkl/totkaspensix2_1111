import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users } from 'lucide-react';

interface UserDistributionCardProps {
  users: any[];
}

const UserDistributionCard: React.FC<UserDistributionCardProps> = ({ users }) => {
  const data = [
    { name: 'Siswa', value: users.filter(u => u.role === 'STUDENT').length, color: '#4f46e5' },
    { name: 'Guru', value: users.filter(u => u.role === 'TEACHER').length, color: '#10b981' },
    { name: 'Admin', value: users.filter(u => u.role === 'ADMIN').length, color: '#f59e0b' },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-600" />
          <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Distribusi User</h4>
        </div>
      </div>

      <div className="flex-1 min-h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={8}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900}}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900">{users.length}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total User</span>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
            </div>
            <span className="text-xs font-black text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDistributionCard;
