import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ScoreDistributionProps {
  scores: any[];
}

const ScoreDistribution: React.FC<ScoreDistributionProps> = ({ scores }) => {
  const distribution = [
    { range: '0-20', count: 0, color: '#f43f5e' },
    { range: '21-40', count: 0, color: '#f43f5e' },
    { range: '41-60', count: 0, color: '#f59e0b' },
    { range: '61-80', count: 0, color: '#10b981' },
    { range: '81-100', count: 0, color: '#4f46e5' },
  ];

  scores.forEach(s => {
    const score = parseFloat(s.score);
    if (score <= 20) distribution[0].count++;
    else if (score <= 40) distribution[1].count++;
    else if (score <= 60) distribution[2].count++;
    else if (score <= 80) distribution[3].count++;
    else distribution[4].count++;
  });

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Distribusi Nilai</h4>
        </div>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="range" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900}}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rendah</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sedang</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tinggi</span>
         </div>
      </div>
    </div>
  );
};

export default ScoreDistribution;
