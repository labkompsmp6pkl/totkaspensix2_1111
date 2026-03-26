import React from 'react';
import { Shield, Clock, User, LogOut } from 'lucide-react';

interface ExamHeaderProps {
  groupName: string;
  userName: string;
  userKelas: string;
  isAutoSaving: boolean;
  timeLeft: number;
  onLogout: () => void;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({ groupName, userName, userKelas, isAutoSaving, timeLeft, onLogout }) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
              <Shield className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{groupName}</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Ujian Digital SMPN 06 • {userKelas}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{userName}</span>
              {isAutoSaving && <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Auto-Saving...</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all ${
            timeLeft < 300 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-700'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
          </div>
          
          <button 
            onClick={onLogout}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
