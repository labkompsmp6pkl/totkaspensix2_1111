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

interface AdminDashboardProps {
  currentUser: User;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  groups: any[];
  activeGroupId: number | null;
  examCode: string;
  setExamCode: React.Dispatch<React.SetStateAction<string>>;
  lastSync?: Date;
  onRefresh: () => void;
  onLogout: () => void;
  activeTab: 'MENU' | 'SOAL' | 'SESI' | 'PENGGUNA' | 'MONITORING' | 'LOG';
  setActiveTab: (tab: 'MENU' | 'SOAL' | 'SESI' | 'PENGGUNA' | 'MONITORING' | 'LOG') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentUser, questions: realQuestions, setQuestions, users: realUsers, setUsers, 
  groups: realGroups, activeGroupId, examCode, setExamCode, lastSync, onRefresh, onLogout,
  activeTab, setActiveTab
}) => {
  const questions = realQuestions.length > 0 ? realQuestions : dummyQuestions;
  const groups = realGroups.length > 0 ? realGroups : dummyGroups;
  const users = realUsers.length > 0 ? realUsers : [...realUsers, ...dummyUsers];

  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States untuk Formulir
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | number | null>(null);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const [accRes, sessRes] = await Promise.all([
        fetch(`${API_BASE_URL}?action=get_access_logs`),
        LogController.getSessionEvents('all')
      ]);
      if (accRes.ok) setAccessLogs(robustParse(await accRes.text()) || []);
      setSessionLogs(ensureArray(sessRes));
    } catch (err) {} finally { setIsLoadingLogs(false); }
  };

  useEffect(() => { 
    fetchLogs(); 
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddAction = () => {
    if (activeTab === 'SOAL') { setEditingQuestionId(null); setShowQuestionForm(true); }
    // Tambahkan logika add untuk tab lain di sini jika perlu
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
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans text-slate-900">
      
      {/* --- SIDEBAR (KIRI) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[500] w-72 bg-indigo-950 text-white transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Bagian Atas: Detail Sekolah */}
          <div className="p-6 border-b border-indigo-900/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tighter leading-none">SMPN 06 PEKALONGAN</h1>
                <p className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-widest opacity-80">SISTEM AKADEMIK</p>
              </div>
            </div>

            {/* Status Admin & Keluar */}
            <div className="flex items-center justify-between bg-indigo-900/40 p-3 rounded-2xl border border-indigo-800/30">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">ADMIN</span>
              </div>
              <button 
                onClick={onLogout} 
                className="p-2 text-indigo-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                title="Keluar Sistem"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Menu Navigasi (Pengganti Tabs) */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
            <p className="px-4 text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">MENU UTAMA</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-[1.02]' 
                      : 'text-indigo-300/60 hover:bg-indigo-900/30 hover:text-white'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-6 border-t border-indigo-900/50 bg-indigo-950/50">
             <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-sm">
                <LogOut className="w-4 h-4" /> KELUAR SISTEM
             </button>
          </div>
        </div>
      </aside>

      {/* --- AREA KONTEN (KANAN) --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-100">
        
        {/* Header Kanan: Panel Info, Sync, & Tombol Tambah */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-[100]">
          <div className="flex items-center gap-5">
            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-slate-50 text-slate-600 rounded-xl border">
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-indigo-600 rounded-full hidden sm:block"></div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">ADMIN PANEL</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 hidden md:block">
                  KELOLA SOAL, SESI UJIAN, DAN DATA PENGGUNA SISTEM.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Tombol Tambah Dinamis (Soal Baru, Sesi Baru, dll) */}
            {activeTab !== 'MENU' && activeTab !== 'LOG' && activeTab !== 'MONITORING' && (
              <button 
                onClick={handleAddAction}
                className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-blue-700 active:scale-95 transition-all tracking-widest border-b-4 border-blue-800"
              >
                <PlusCircle className="w-4 h-4" />
                {activeTab === 'SOAL' ? 'SOAL BARU' : activeTab === 'SESI' ? 'SESI BARU' : activeTab === 'PENGGUNA' ? 'USER BARU' : 'TAMBAH'}
              </button>
            )}

            <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
            
            {/* Sinkronisasi Terakhir */}
            <div className="flex items-center gap-4">
              {lastSync && (
                <div className="text-right hidden lg:block">
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">SINKRONISASI TERAKHIR</p>
                  <p className="text-xs font-mono font-black text-indigo-600">{lastSync.toLocaleTimeString('id-ID')}</p>
                </div>
              )}
              <button 
                onClick={onRefresh} 
                className={`p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-white border hover:border-indigo-100 transition-all shadow-sm ${isLoadingLogs ? 'animate-spin' : ''}`}
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* AREA SCROLL KONTEN - Menggunakan id agar scrollToTop berfungsi */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar bg-slate-100" id="main-scroll-container">
          <div className="max-w-[1600px] mx-auto">
            
            {activeTab === 'MENU' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AdminMenu setActiveTab={setActiveTab} />
              </div>
            )}
            
            {activeTab === 'SOAL' && (
              <div className="w-full bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-200 p-8 sm:p-12 min-h-[70vh]">
                <div className="mb-10 border-b border-slate-50 pb-8 flex justify-between items-end">
                   <div>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Manajemen Bank Soal</h2>
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Total: {questions.length} butir soal tersedia</p>
                   </div>
                </div>

                <QuestionManager 
                  questions={questions} groups={groups} refreshData={onRefresh} 
                  API_BASE_URL={API_BASE_URL} activeGroupId={activeGroupId} 
                  currentUser={currentUser} showForm={showQuestionForm} 
                  setShowForm={setShowQuestionForm} editingId={editingQuestionId} 
                  setEditingId={setEditingQuestionId} form={{}} setForm={()=>{}} initialForm={{}}
                />
              </div>
            )}

            {activeTab === 'SESI' && (
              <div className="w-full bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 p-8 sm:p-12 min-h-[70vh]">
                <SessionManager groups={groups} questions={questions} users={users} examCode={examCode} activeGroupId={activeGroupId} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} showForm={false} setShowForm={()=>{}} editingId={null} setEditingId={()=>{}} form={{}} setForm={()=>{}} />
              </div>
            )}

            {activeTab === 'PENGGUNA' && (
              <div className="w-full bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 p-8 sm:p-12 min-h-[70vh]">
                <UserManager users={users} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} accessLogs={accessLogs} sessionLogs={sessionLogs} scores={[]} userForm={null} setUserForm={()=>{}} />
              </div>
            )}

            {activeTab === 'MONITORING' && (
              <AdminMonitoring users={users} groups={groups} questions={questions} currentUser={currentUser} lastSync={lastSync} onRefresh={onRefresh} />
            )}

            {activeTab === 'LOG' && (
              <AdminLog accessLogs={accessLogs} sessionLogs={sessionLogs} users={users} fetchLogs={fetchLogs} isLoadingLogs={isLoadingLogs} />
            )}

          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-[450] lg:hidden transition-all duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </main>

    </div>
  );
};

export default AdminDashboard;
