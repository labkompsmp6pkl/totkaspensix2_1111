import React from 'react';
import { BookOpen, Layers, Users, Activity, History } from 'lucide-react';

interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  containerWidth: number;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab, containerWidth }) => {
  const tabs = ['SOAL', 'SESI', 'PENGGUNA', 'MONITORING', 'LOG'] as const;

  return (
    <div className="z-[90] pt-1 pb-2 w-full px-4 sm:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl sm:rounded-[2rem] shadow-inner border border-slate-200 gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 min-w-[110px] py-3.5 px-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase transition-all flex items-center justify-center gap-3 tracking-[0.15em] border-2 ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-xl border-indigo-700 scale-[1.02] -translate-y-0.5' 
                  : 'bg-white text-slate-400 border-transparent hover:bg-white hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === tab ? 'bg-white/20' : 'bg-slate-50'}`}>
                {tab === 'SOAL' && <BookOpen className="w-4 h-4" />}
                {tab === 'SESI' && <Layers className="w-4 h-4" />}
                {tab === 'PENGGUNA' && <Users className="w-4 h-4" />}
                {tab === 'MONITORING' && <Activity className="w-4 h-4" />}
                {tab === 'LOG' && <History className="w-4 h-4" />}
              </div>
              <span className={containerWidth < 600 ? 'hidden' : 'inline'}>{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTabs;