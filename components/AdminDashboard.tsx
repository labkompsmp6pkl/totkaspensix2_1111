import React, { useState, useEffect } from 'react';
import { Question, User, UserRole } from '../types';
import QuestionManager from './admin/QuestionManager';
import SessionManager from './admin/SessionManager';
import UserManager from './admin/UserManager';
import { robustParse, API_BASE_URL, ensureArray } from '../utils';
import { LogController } from '../controllers/LogController';
import AdminMonitoring from './admin/dashboard/AdminMonitoring';
import AdminLog from './admin/dashboard/AdminLog';
import AdminMenu from './admin/dashboard/AdminMenu';
import { 
  RefreshCw, LayoutDashboard, BookOpen, Layers, 
  Users, Activity, History, LogOut, School, 
  ShieldCheck, PlusCircle, Menu, X 
} from 'lucide-react';
import { dummyQuestions, dummyGroups, dummyUsers } from '../src/dummyData';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentUser, questions: realQuestions, setQuestions, users: realUsers, setUsers, 
  groups: realGroups, activeGroupId, examCode, setExamCode, lastSync, onRefresh, onLogout,
  activeTab, setActiveTab
}) => {
  const questions = realQuestions.length > 0 ? realQuestions : dummyQuestions;
  const groups = realGroups.length > 0 ? realGroups : dummyGroups;
  const users = realUsers.length > 0 ? realUsers : [...realUsers, ...dummyUsers];

  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States untuk Formulir
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | number | null>(null);

  const handleAddAction = () => {
    if (activeTab === 'SOAL') { setShowQuestionForm(true); }
    // Tambahkan logika add untuk tab lain jika perlu
  };

  const navItems = [
    { id: 'MENU', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'SOAL', label: 'SOAL', icon: BookOpen },
    { id: 'SESI', label: 'SESI', icon: Layers },
    { id: 'PENGGUNA', label: 'PENGGUNA', icon: Users },
    { id: 'MONITORING', label: 'MONITORING', icon: Activity },
    { id: 'LOG', label: 'LOG', icon: History },
  ] as const;

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[500] w-72 bg-indigo-950 text-white transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Detail Sekolah & Branding */}
          <div className="p-6 border-b border-indigo-900/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tighter leading-none">SMPN 06 PEKALONGAN</h1>
                <p className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-widest">SISTEM AKADEMIK</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-indigo-900/40 p-3 rounded-2xl border border-indigo-800/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">ADMIN</span>
              </div>
              <button onClick={onLogout} className="text-indigo-400 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigasi Utama (Tabs) */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <p className="px-4 text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">MENU UTAMA</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                  ${activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 scale-[1.02]' 
                    : 'text-indigo-300/60 hover:bg-indigo-900/30 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-6 border-t border-indigo-900/50">
             <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
                <LogOut className="w-4 h-4" /> KELUAR SISTEM
             </button>
          </div>
        </div>
      </aside>

      {/* --- AREA KONTEN UTAMA --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOP BAR ACTION (Sync, Add Button, Title) */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">ADMIN PANEL</h2>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 ml-4 hidden sm:block">
                KELOLA SOAL, SESI UJIAN, DAN DATA PENGGUNA SISTEM.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Tombol Tambah Dinamis */}
            <button 
              onClick={handleAddAction}
              className="flex items-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-blue-700 active:scale-95 transition-all tracking-widest border-b-4 border-blue-800"
            >
              <PlusCircle className="w-4 h-4" />
              {activeTab === 'SOAL' ? 'SOAL BARU' : activeTab === 'SESI' ? 'SESI BARU' : activeTab === 'PENGGUNA' ? 'USER BARU' : 'TAMBAH'}
            </button>

            {/* Info Sinkronisasi */}
            <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
            
            <div className="flex items-center gap-4">
              {lastSync && (
                <div className="text-right hidden lg:block">
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">SINKRONISASI TERAKHIR</p>
                  <p className="text-xs font-mono font-black text-indigo-600">{lastSync.toLocaleTimeString('id-ID')}</p>
                </div>
              )}
              <button onClick={onRefresh} className={`p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all ${isLoadingLogs ? 'animate-spin' : ''}`}>
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* AREA SCROLL KONTEN */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50" id="main-scroll-container">
          <div className="max-w-[1600px] mx-auto">
            {activeTab === 'MENU' && <AdminMenu setActiveTab={setActiveTab} />}
            
            {activeTab === 'SOAL' && (
              <div className="w-full bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 min-h-[70vh]">
                <QuestionManager 
                  questions={questions} groups={groups} refreshData={onRefresh} 
                  API_BASE_URL={API_BASE_URL} activeGroupId={activeGroupId} 
                  currentUser={currentUser} showForm={showQuestionForm} 
                  setShowForm={setShowQuestionForm} editingId={editingQuestionId} 
                  setEditingId={setEditingQuestionId} form={{}} setForm={()=>{}} initialForm={{}}
                />
              </div>
            )}

            {/* Render Tab lainnya secara analog... */}
            {activeTab === 'SESI' && <SessionManager groups={groups} questions={questions} users={users} examCode={examCode} activeGroupId={activeGroupId} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} showForm={false} setShowForm={()=>{}} editingId={null} setEditingId={()=>{}} form={{}} setForm={()=>{}} />}
            {activeTab === 'PENGGUNA' && <UserManager users={users} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} accessLogs={accessLogs} sessionLogs={sessionLogs} scores={[]} userForm={null} setUserForm={()=>{}} />}
            {activeTab === 'MONITORING' && <AdminMonitoring users={users} groups={groups} questions={questions} currentUser={currentUser} lastSync={lastSync} onRefresh={onRefresh} />}
            {activeTab === 'LOG' && <AdminLog accessLogs={accessLogs} sessionLogs={sessionLogs} users={users} fetchLogs={()=>{}} isLoadingLogs={isLoadingLogs} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
