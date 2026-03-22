import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Question, User, UserRole } from '../types';
import QuestionManager from './admin/QuestionManager';
import SessionManager from './admin/SessionManager';
import UserManager from './admin/UserManager';
import { robustParse, API_BASE_URL, ensureArray } from '../utils';
import { LogController } from '../controllers/LogController';
import AdminHeader from './admin/dashboard/AdminHeader';
import AdminTabs from './admin/dashboard/AdminTabs';
import AdminMenu from './admin/dashboard/AdminMenu';
import AdminMonitoring from './admin/dashboard/AdminMonitoring';
import AdminLog from './admin/dashboard/AdminLog';
import { RefreshCw } from 'lucide-react';
import { dummyQuestions, dummyGroups, dummyUsers } from '../src/dummyData';

// DEFINISI INTERFACE (Memperbaiki error TS2304: Cannot find name 'AdminDashboardProps')
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

  // DEFINISI STATE LOG (Memperbaiki error TS2304: Cannot find name 'accessLogs' / 'sessionLogs')
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // States untuk Formulir
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | number | null>(null);
  const [sessionForm, setSessionForm] = useState<any>({
    group_name: '', group_code: '', duration_minutes: 60, extra_time_minutes: 0, is_shuffled: 1, target_classes: [], teacher_ids: []
  });
  const [userForm, setUserForm] = useState<Partial<User> | null>(null);

  // --- LOGIKA ANTI-TABRAKAN NAVBAR ---
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(280); 

  useLayoutEffect(() => {
    if (!headerWrapperRef.current) return;
    
    const updateHeight = () => {
      if (headerWrapperRef.current) {
        setNavHeight(headerWrapperRef.current.offsetHeight);
      }
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerWrapperRef.current);
    updateHeight(); 
    return () => observer.disconnect();
  }, [activeTab]); 

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const [accRes, sessRes] = await Promise.all([
        fetch(`${API_BASE_URL}?action=get_access_logs`),
        LogController.getSessionEvents('all')
      ]);
      if (accRes.ok) {
        const accData = robustParse(await accRes.text()) || [];
        setAccessLogs(accData);
      }
      setSessionLogs(ensureArray(sessRes));
    } catch (err) {
        console.error("Gagal mengambil log:", err);
    } finally { 
        setIsLoadingLogs(false); 
    }
  };

  useEffect(() => { 
    fetchLogs(); 
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const handleAddAction = () => {
    if (activeTab === 'SOAL') { setEditingQuestionId(null); setShowQuestionForm(true); }
    else if (activeTab === 'SESI') { /* Logika tambah sesi */ }
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col items-center">
      
      {/* 1. NAVBAR FIXED - Mempertahankan detail SMPN 06, SINKRONISASI, TABS, dll */}
      <div ref={headerWrapperRef} className="fixed top-0 left-0 right-0 z-[1000] bg-white shadow-xl border-b border-slate-200">
        <div className="w-full">
          <AdminHeader 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            handleAddAction={handleAddAction} 
            lastSync={lastSync} 
            onRefresh={onRefresh} 
            onLogout={onLogout}
            isLoadingLogs={isLoadingLogs} 
          />
          {activeTab !== 'MENU' && (
            <div className="bg-white pb-4"> 
              <AdminTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                containerWidth={window.innerWidth} 
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. GHOST SPACER (PENGGANJAL OTOMATIS) */}
      <div style={{ height: `${navHeight}px` }} className="w-full shrink-0" />

      {/* 3. AREA KONTEN UTAMA */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-10 py-10 relative z-0">
        <div className="w-full">
          {activeTab === 'MENU' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AdminMenu setActiveTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'SOAL' && (
            <div className="w-full bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-8 sm:p-12 min-h-[80vh]">
              <div className="mb-10 border-b border-slate-50 pb-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Manajemen Bank Soal</h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Total {questions.length} butir soal tersedia</p>
              </div>

              <QuestionManager 
                questions={questions} 
                groups={groups} 
                refreshData={onRefresh} 
                API_BASE_URL={API_BASE_URL} 
                activeGroupId={activeGroupId} 
                currentUser={currentUser}
                showForm={showQuestionForm}
                setShowForm={setShowQuestionForm}
                editingId={editingQuestionId}
                setEditingId={setEditingQuestionId}
                form={{}} 
                setForm={()=>{}}
                initialForm={{}}
              />
            </div>
          )}

          {activeTab === 'SESI' && (
            <div className="w-full bg-white rounded-[3.5rem] shadow-2xl p-8 sm:p-12 min-h-[70vh]">
              <SessionManager groups={groups} questions={questions} users={users} examCode={examCode} activeGroupId={activeGroupId} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} showForm={false} setShowForm={()=>{}} editingId={null} setEditingId={()=>{}} form={{}} setForm={()=>{}} />
            </div>
          )}

          {activeTab === 'PENGGUNA' && (
            <div className="w-full bg-white rounded-[3.5rem] shadow-2xl p-8 sm:p-12 min-h-[70vh]">
              <UserManager users={users} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} accessLogs={accessLogs} sessionLogs={sessionLogs} scores={[]} userForm={userForm} setUserForm={setUserForm} />
            </div>
          )}

          {activeTab === 'MONITORING' && <AdminMonitoring users={users} groups={groups} questions={questions} currentUser={currentUser} lastSync={lastSync} onRefresh={onRefresh} />}
          
          {activeTab === 'LOG' && (
            <AdminLog 
              accessLogs={accessLogs} 
              sessionLogs={sessionLogs} 
              users={users} 
              fetchLogs={fetchLogs} 
              isLoadingLogs={isLoadingLogs} 
            />
          )}
        </div>
      </main>

      {/* Floating Refresh Button */}
      {activeTab !== 'MENU' && (
        <button
          onClick={onRefresh}
          className="fixed bottom-10 right-10 z-[1100] p-5 bg-indigo-600 text-white rounded-[2rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
        >
          <RefreshCw className={`w-7 h-7 ${isLoadingLogs ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;
