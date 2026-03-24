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
  
  // State untuk kontrol Sidebar Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States untuk Formulir Manager
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | number | null>(null);
  const [questionForm, setQuestionForm] = useState<Partial<Question>>({});

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [sessionForm, setSessionForm] = useState<any>({});

  const [userForm, setUserForm] = useState<Partial<User> | null>(null);

  const initialQuestionForm: Partial<Question> = {
    text: '',
    type: 'single',
    scoring_mode: 'all_or_nothing',
    options: [
      { id: 'a', text: '', points: 0 },
      { id: 'b', text: '', points: 0 },
      { id: 'c', text: '', points: 0 },
      { id: 'd', text: '', points: 0 }
    ],
    correctOptionId: 'a',
    points: 10,
    subject: 'UMUM',
    group_ids: []
  };

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
    if (activeTab === 'SOAL') { 
      setQuestionForm(initialQuestionForm);
      setEditingQuestionId(null);
      setShowQuestionForm(true); 
    }
    if (activeTab === 'SESI') {
      setSessionForm({
        group_name: '', group_code: '', duration_minutes: 60, extra_time_minutes: 0, is_shuffled: 1, target_classes: [], teacher_ids: []
      });
      setEditingSessionId(null);
      setShowSessionForm(true);
    }
    if (activeTab === 'PENGGUNA') {
      setUserForm({ role: UserRole.STUDENT });
    }
  };

  const navItems = [
    { id: 'MENU', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'SOAL', label: 'BANK SOAL', icon: BookOpen },
    { id: 'SESI', label: 'SESI UJIAN', icon: Layers },
    { id: 'PENGGUNA', label: 'PENGGUNA', icon: Users },
    { id: 'MONITORING', label: 'MONITORING', icon: Activity },
    { id: 'LOG', label: 'SISTEM LOG', icon: History },
  ] as const;

  return (
    // Memastikan kontainer full-height dan tersembunyi scrollbar utamanya
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* ------------------------------------------- */}
      {/* SIDEBAR (KIRI) - NAVIGASI DAN INFO SEKOLAH  */}
      {/* ------------------------------------------- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[500] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Sidebar: Detail Sekolah */}
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-200">
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[13px] font-black tracking-tight leading-none text-slate-800">SMPN 06 PEKALONGAN</h1>
                <p className="text-[9px] font-black text-indigo-500 mt-1.5 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SISTEM AKADEMIK
                </p>
              </div>
            </div>
            {/* Tombol tutup sidebar di Mobile */}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Admin & Keluar */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-inner">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">ADMIN</span>
            </div>
            <button 
              onClick={onLogout} 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Keluar Sistem"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Sidebar: Menu Navigasi Utama */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">MENU UTAMA</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 border border-transparent'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar: Sinkronisasi Terakhir (Diletakkan di bawah agar rapi) */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
           <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">SINKRONISASI TERAKHIR</p>
                <p className="text-xs font-mono font-black text-indigo-600 mt-0.5">
                  {lastSync ? lastSync.toLocaleTimeString('id-ID') : 'Belum Sinkron'}
                </p>
              </div>
              <button 
                onClick={onRefresh} 
                className={`p-3 bg-white rounded-xl text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-all shadow-sm ${isLoadingLogs ? 'animate-spin' : ''}`}
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
           </div>
        </div>
      </aside>


      {/* ------------------------------------------- */}
      {/* AREA KONTEN UTAMA (KANAN)                   */}
      {/* ------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50">
        
        {/* HEADER KANAN (Aksi Dinamis & Mobile Toggle) */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-10 shrink-0 z-[100] shadow-sm">
          
          {/* Sisi Kiri: Toggle Mobile & Judul Panel */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 active:scale-95 transition-transform">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full hidden sm:block"></div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">ADMIN PANEL</h2>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1.5 hidden md:block">
                  KELOLA SOAL, SESI UJIAN, DAN DATA PENGGUNA SISTEM.
                </p>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Tombol Aksi (Tambah Data) */}
          <div className="flex items-center gap-4">
            {activeTab !== 'MENU' && activeTab !== 'LOG' && activeTab !== 'MONITORING' && (
              <button 
                onClick={handleAddAction}
                className="flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] sm:text-xs shadow-lg hover:bg-blue-700 active:scale-95 transition-all tracking-widest border-b-4 border-blue-800"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:block">
                  {activeTab === 'SOAL' ? 'SOAL BARU' : activeTab === 'SESI' ? 'SESI BARU' : activeTab === 'PENGGUNA' ? 'USER BARU' : 'TAMBAH'}
                </span>
                <span className="sm:hidden">TAMBAH</span>
              </button>
            )}
          </div>
        </header>

        {/* CONTAINER SCROLL INDEPENDEN */}
        {/* Di sinilah komponen konten dirender. Karena memiliki 'overflow-y-auto', area ini 
            memiliki scrollbar miliknya sendiri, tidak akan pernah menabrak header/sidebar. */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar" id="main-scroll-container">
          <div className="max-w-[1600px] mx-auto pb-20">
            
            {activeTab === 'MENU' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AdminMenu setActiveTab={setActiveTab} />
              </div>
            )}
            
            {activeTab === 'SOAL' && (
              <div className="w-full bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-12 min-h-[70vh]">
                <div className="mb-8 border-b border-slate-100 pb-6">
                   <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Manajemen Bank Soal</h2>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Total: {questions.length} butir soal tersedia</p>
                </div>

                <QuestionManager 
                  questions={questions} groups={groups} refreshData={onRefresh} 
                  API_BASE_URL={API_BASE_URL} activeGroupId={activeGroupId} 
                  currentUser={currentUser} showForm={showQuestionForm} 
                  setShowForm={setShowQuestionForm} editingId={editingQuestionId} 
                  setEditingId={setEditingQuestionId} 
                  form={questionForm} setForm={setQuestionForm} initialForm={initialQuestionForm}
                />
              </div>
            )}

            {activeTab === 'SESI' && (
              <div className="w-full bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-xl border border-slate-200 p-6 sm:p-12 min-h-[70vh]">
                <SessionManager 
                  groups={groups} questions={questions} users={users} 
                  examCode={examCode} activeGroupId={activeGroupId} 
                  refreshData={onRefresh} API_BASE_URL={API_BASE_URL} 
                  showForm={showSessionForm} setShowForm={setShowSessionForm} 
                  editingId={editingSessionId} setEditingId={setEditingSessionId} 
                  form={sessionForm} setForm={setSessionForm} 
                />
              </div>
            )}

            {activeTab === 'PENGGUNA' && (
              <div className="w-full bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-xl border border-slate-200 p-6 sm:p-12 min-h-[70vh]">
                <UserManager 
                  users={users} refreshData={onRefresh} 
                  API_BASE_URL={API_BASE_URL} accessLogs={accessLogs} 
                  sessionLogs={sessionLogs} scores={[]} 
                  userForm={userForm} setUserForm={setUserForm} 
                />
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

        {/* OVERLAY SIDEBAR MOBILE */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[450] lg:hidden transition-all duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </main>

    </div>
  );
};

export default AdminDashboard;