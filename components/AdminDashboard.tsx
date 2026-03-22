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
import { RefreshCw, LayoutDashboard, BookOpen, Clock, Users, Activity, FileText, Plus, LogOut, Menu, X } from 'lucide-react';
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

  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
  // State untuk Sidebar Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States untuk Komponen
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | number | null>(null);
  const subjects = ['Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Bahasa Inggris', 'Informatika', 'TKA Umum'];
  const initialQuestionForm: Partial<Question> = {
    subject: subjects[0], group_ids: activeGroupId ? [activeGroupId] : [], text: '', type: 'single', 
    scoring_mode: 'all_or_nothing', points: 0, sort_order: 1, 
    options: [{ id: 'a', text: '', points: 0 }, { id: 'b', text: '', points: 0 }, { id: 'c', text: '', points: 0 }, { id: 'd', text: '', points: 0 }],
    correctOptionId: 'a', correctOptionIds: [], tableOptions: ['BENAR', 'SALAH'],
    statements: [{ id: '1', text: '', points: 0, correctAnswer: 'BENAR' }]
  };
  const [questionForm, setQuestionForm] = useState<Partial<Question>>(initialQuestionForm);
  
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [sessionForm, setSessionForm] = useState<any>({
    group_name: '', group_code: '', duration_minutes: 60, extra_time_minutes: 0, is_shuffled: 1, target_classes: [], teacher_ids: []
  });

  const [userForm, setUserForm] = useState<Partial<User> | null>(null);

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

  // Memastikan scroll HANYA terjadi di kontainer kanan saat ganti tab
  useEffect(() => {
    const forceScroll = () => {
      const container = document.getElementById('main-scroll-container');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'instant' });
      }
      // Memastikan window document tidak ikut tergulung (pencegahan ekstra)
      window.scrollTo(0, 0); 
    };
    forceScroll();
    const timer = setTimeout(forceScroll, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleAddAction = () => {
    if (activeTab === 'SOAL') {
      setQuestionForm(initialQuestionForm); setEditingQuestionId(null); setShowQuestionForm(true);
    } else if (activeTab === 'SESI') {
      setSessionForm({ group_name: '', group_code: '', duration_minutes: 60, extra_time_minutes: 0, is_shuffled: 1, target_classes: [], teacher_ids: [] }); setEditingSessionId(null); setShowSessionForm(true);
    } else if (activeTab === 'PENGGUNA') {
      const now = new Date(); const year = now.getFullYear(); const month = now.getMonth() + 1;
      const academicYear = month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
      setUserForm({ name: '', role: UserRole.STUDENT, username: '', password: '', kelas: '', tahun_ajaran: academicYear });
    }
  };

  const navItems = [
    { id: 'MENU', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'SOAL', label: 'Kelola Bank Soal', icon: BookOpen },
    { id: 'SESI', label: 'Kelola Sesi Ujian', icon: Clock },
    { id: 'PENGGUNA', label: 'Data Pengguna', icon: Users },
    { id: 'MONITORING', label: 'Live Monitoring', icon: Activity },
    { id: 'LOG', label: 'Log Sistem', icon: FileText },
  ] as const;

  return (
    // SOLUSI KUNCI: "fixed inset-0" memaku layout ke ujung layar. "overflow-hidden" mencegah halaman bocor.
    <div className="fixed inset-0 flex bg-slate-50 overflow-hidden font-sans">
      
      {/* OVERLAY UNTUK MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/50 z-[200] lg:hidden backdrop-blur-sm transition-all" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* --- SIDEBAR KIRI --- */}
      {/* absolute di mobile, static di desktop. Dikunci setinggi kontainer dengan flex-col */}
      <aside className={`absolute lg:static top-0 left-0 h-full w-72 bg-white border-r border-slate-200 flex flex-col z-[210] transform transition-transform duration-300 shadow-2xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
         
         <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">A</div>
               <div>
                  <h1 className="font-black text-slate-800 text-lg leading-none tracking-tight">Admin Panel</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Ujian</p>
               </div>
            </div>
            <button className="lg:hidden p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
         </div>

         {['SOAL', 'SESI', 'PENGGUNA'].includes(activeTab) && (
           <div className="p-5 border-b border-slate-100 shrink-0">
             <button onClick={() => { handleAddAction(); setIsSidebarOpen(false); }} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95">
               <Plus className="w-4 h-4" /> Tambah Data
             </button>
           </div>
         )}

         <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Menu Navigasi</p>
            {navItems.map(item => {
               const Icon = item.icon;
               const isActive = activeTab === item.id;
               return (
                 <button
                   key={item.id}
                   onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                   className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'}`}
                 >
                   <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                   {item.label}
                 </button>
               );
            })}
         </nav>

         <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 shrink-0">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Sinkronisasi</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5">{lastSync ? lastSync.toLocaleTimeString() : '-'}</span>
              </div>
              <button onClick={onRefresh} disabled={isLoadingLogs} className={`p-2 bg-indigo-50 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-all ${isLoadingLogs ? 'animate-spin' : ''}`}>
                 <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
               <LogOut className="w-4 h-4" /> Keluar Sistem
            </button>
         </div>
      </aside>

      {/* --- KONTEN KANAN UTAMA --- */}
      <main className="flex-1 h-full flex flex-col bg-slate-50 min-w-0 relative">
         
         <header className="lg:hidden h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">A</div>
               <span className="font-black text-slate-800 text-lg">Admin Panel</span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
               <Menu className="w-6 h-6" />
            </button>
         </header>

         {/* AREA SCROLL INDEPENDEN KANAN */}
         <div className="flex-1 overflow-y-auto w-full scroll-smooth" id="main-scroll-container">
            {/* SPACING ATAS: pt-8 sm:pt-10 memastikan jarak aman yang sangat rapi dan tidak terlalu menempel ke atas */}
            <div className="max-w-7xl mx-auto w-full p-4 sm:p-8 pt-8 sm:pt-10 pb-32 min-h-full flex flex-col">
               
               <div className="mb-6 lg:mb-8 pl-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                    {navItems.find(n => n.id === activeTab)?.label}
                  </h2>
                  <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Kelola data dan konfigurasi sistem ujian Anda.</p>
               </div>

               {/* Render Konten Berdasarkan Tab */}
               {activeTab === 'MENU' && <AdminMenu setActiveTab={setActiveTab} />}
               
               {activeTab === 'SOAL' && (
                  <div className="flex-1 bg-white rounded-[2rem] sm:rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-5 sm:p-10">
                    <QuestionManager questions={questions} groups={groups} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} activeGroupId={activeGroupId} currentUser={currentUser} showForm={showQuestionForm} setShowForm={setShowQuestionForm} editingId={editingQuestionId} setEditingId={setEditingQuestionId} form={questionForm} setForm={setQuestionForm} initialForm={initialQuestionForm} />
                  </div>
               )}

               {activeTab === 'SESI' && <SessionManager groups={groups} questions={questions} users={users} examCode={examCode} activeGroupId={activeGroupId} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} showForm={showSessionForm} setShowForm={setShowSessionForm} editingId={editingSessionId} setEditingId={setEditingSessionId} form={sessionForm} setForm={setSessionForm} />}
               {activeTab === 'PENGGUNA' && <UserManager users={users} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} accessLogs={accessLogs} sessionLogs={sessionLogs} scores={[]} userForm={userForm} setUserForm={setUserForm} />}
               {activeTab === 'MONITORING' && <AdminMonitoring users={users} groups={groups} questions={questions} currentUser={currentUser} lastSync={lastSync} onRefresh={onRefresh} />}
               {activeTab === 'LOG' && <AdminLog accessLogs={accessLogs} sessionLogs={sessionLogs} users={users} fetchLogs={fetchLogs} isLoadingLogs={isLoadingLogs} />}
            </div>
         </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
