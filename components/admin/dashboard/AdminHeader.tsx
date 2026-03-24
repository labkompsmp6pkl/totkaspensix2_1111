import React from 'react';
import { LayoutDashboard, BookOpen, RefreshCw, LogOut, ShieldCheck, School, PlusCircle } from 'lucide-react';

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  handleAddAction: () => void;
  lastSync?: Date;
  onRefresh: () => void;
  onLogout: () => void;
  isLoadingLogs: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  activeTab, setActiveTab, handleAddAction, lastSync, onRefresh, onLogout, isLoadingLogs 
}) => {
  return (
    <header className="w-full flex flex-col bg-white border-b border-slate-200">
      {/* TOP BAR - SCHOOL INFO */}
      <div className="bg-indigo-900 text-white py-2 px-4 sm:px-8 flex justify-between items-center border-b border-indigo-800/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-300" />
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">SMPN 06 PEKALONGAN</span>
          </div>
          <div className="h-3 w-[1px] bg-indigo-700 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span className="text-[10px] sm:text-xs font-bold tracking-tight opacity-80 uppercase">SISTEM AKADEMIK</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-tighter">ADMIN</span>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">KELUAR</span>
          </button>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4 sm:px-8 py-6 sm:py-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('MENU')}
            className="p-5 bg-indigo-600 text-white rounded-3xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            <LayoutDashboard className="w-8 h-8" />
          </button>
          <div className="relative">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-slate-900 uppercase leading-none">ADMIN PANEL</h1>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-blue-500 rounded-full"></div>
            <p className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mt-4">
              KELOLA SOAL, SESI UJIAN, DAN DATA PENGGUNA SISTEM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={handleAddAction}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold uppercase text-xs shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            {activeTab === 'SOAL' ? 'SOAL BARU' : activeTab === 'SESI' ? 'SESI BARU' : activeTab === 'PENGGUNA' ? 'USER BARU' : 'TAMBAH'}
          </button>
          
          <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>

          <div className="flex items-center gap-4">
            {lastSync && (
              <div className="text-right hidden lg:block">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">SINKRONISASI TERAKHIR</p>
                <p className="text-[13px] font-mono font-bold text-indigo-600">{lastSync.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              </div>
            )}
            <button
              onClick={onRefresh}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
