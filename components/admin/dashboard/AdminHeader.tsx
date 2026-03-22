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
            className="group relative p-5 bg-indigo-600 text-white rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <LayoutDashboard className="w-8 h-8" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-10 bg-indigo-600 rounded-full"></div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">ADMIN PANEL</h1>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.25em] mt-2 ml-5">
              KELOLA SOAL, SESI UJIAN, DAN DATA PENGGUNA SISTEM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={handleAddAction}
            className="flex items-center gap-3 px-8 py-4.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-blue-700 active:scale-95 transition-all tracking-[0.15em] border-b-4 border-blue-800"
          >
            <PlusCircle className="w-5 h-5" />
            {activeTab === 'SOAL' ? 'SOAL BARU' : activeTab === 'SESI' ? 'SESI BARU' : activeTab === 'PENGGUNA' ? 'USER BARU' : 'TAMBAH'}
          </button>
          
          <div className="h-14 w-[1px] bg-slate-200 hidden md:block"></div>

          <div className="flex items-center gap-4">
            {lastSync && (
              <div className="text-right hidden lg:block">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">SINKRONISASI TERAKHIR</p>
                <p className="text-[14px] font-mono font-black text-indigo-600">{lastSync.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              </div>
            )}
            <button
              onClick={onRefresh}
              className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-white hover:border-indigo-200 transition-all shadow-sm active:scale-95 group"
              title="Refresh Data"
            >
              <RefreshCw className={`w-6 h-6 ${isLoadingLogs ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
