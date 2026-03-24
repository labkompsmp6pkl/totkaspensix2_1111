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
    <div className="z-[90] pb-4 w-full px-4 sm:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex p-1 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-md border border-slate-100 gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl sm:rounded-[2rem] font-bold text-[10px] sm:text-xs uppercase transition-all flex items-center justify-center gap-2 tracking-wider ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === tab ? 'bg-white/20' : 'bg-slate-100'}`}>
                {tab === 'SOAL' && <BookOpen className="w-4 h-4" />}
                {tab === 'SESI' && <Layers className="w-4 h-4" />}
                {tab === 'PENGGUNA' && <Users className="w-4 h-4" />}
                {tab === 'MONITORING' && <Activity className="w-4 h-4" />}
                {tab === 'LOG' && <History className="w-4 h-4" />}
              </div>
              <span className={containerWidth < 640 ? 'hidden' : 'inline'}>{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTabs;
