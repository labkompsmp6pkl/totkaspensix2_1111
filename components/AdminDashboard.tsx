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

  // States Formulir
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

  // --- LOGIKA ANTI-TABRAKAN NAVBAR ---
  const headerRef = useRef<HTMLDivElement>(null);
  // Mulai dengan estimasi tinggi yang cukup besar agar konten tidak kaget (jumpy)
  const [headerHeight, setHeaderHeight] = useState(350); 
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  useLayoutEffect(() => {
    if (!headerRef.current) return;
    
    const updateHeight = () => {
      if (headerRef.current) {
        // offsetHeight mengambil tinggi fisik elemen termasuk padding & border
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    updateHeight();

    const handleResize = () => {
      setContainerWidth(window.innerWidth);
      updateHeight();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
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
    } catch (err) {} finally { setIsLoadingLogs(false); }
  };

  useEffect(() => { 
    fetchLogs(); 
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, 50); // Delay sedikit lebih lama agar DOM stabil
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleAddAction = () => {
    if (activeTab === 'SOAL') {
      setQuestionForm(initialQuestionForm); setEditingQuestionId(null); setShowQuestionForm(true);
    } else if (activeTab === 'SESI') {
      setSessionForm({ group_name: '', group_code: '', duration_minutes: 60, extra_time_minutes: 0, is_shuffled: 1, target_classes: [], teacher_ids: [] }); setEditingSessionId(null); setShowSessionForm(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col items-center">
      
      {/* NAVBAR FIXED DENGAN Z-INDEX TERTINGGI */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-[500] bg-white shadow-xl border-b border-slate-200">
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
            <div className="bg-white pb-5"> 
              <AdminTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                containerWidth={containerWidth} 
              />
            </div>
          )}
        </div>
      </div>

      {/* AREA KONTEN UTAMA */}
      <main 
        className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-10 pb-20"
        // paddingTop menggunakan headerHeight + 40px (Buffer ekstra agar tidak menabrak)
        style={{ paddingTop: `${headerHeight + 40}px` }} 
      >
        <div className="w-full">
          {activeTab === 'MENU' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AdminMenu setActiveTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'SOAL' && (
            <div className="w-full bg-white rounded-[3.5rem] shadow-2xl shadow-slate-300/50 border border-slate-100 p-8 sm:p-12 min-h-[80vh] transition-all duration-500 animate-in zoom-in-95">
              {/* Header internal box agar lebih luas informasinya */}
              <div className="mb-10 border-b border-slate-50 pb-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Manajemen Bank Soal</h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Total database: {questions.length} butir soal tersedia</p>
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
                form={questionForm}
                setForm={setQuestionForm}
                initialForm={initialQuestionForm}
              />
            </div>
          )}

          {/* Tab lainnya juga dibuat lebih luas dengan p-8/sm:p-12 */}
          {activeTab === 'SESI' && (
            <div className="w-full bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-8 sm:p-12">
              <SessionManager 
                groups={groups} questions={questions} users={users} examCode={examCode} 
                activeGroupId={activeGroupId} refreshData={onRefresh} API_BASE_URL={API_BASE_URL}
                showForm={showSessionForm} setShowForm={setShowSessionForm}
                editingId={editingSessionId} setEditingId={setEditingSessionId}
                form={sessionForm} setForm={setSessionForm}
              />
            </div>
          )}

          {activeTab === 'PENGGUNA' && (
            <div className="w-full bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-8 sm:p-12">
              <UserManager 
                users={users} refreshData={onRefresh} API_BASE_URL={API_BASE_URL} 
                accessLogs={accessLogs} sessionLogs={sessionLogs} scores={[]}
                userForm={userForm} setUserForm={setUserForm}
              />
            </div>
          )}

          {activeTab === 'MONITORING' && (
            <AdminMonitoring 
              users={users} groups={groups} questions={questions} 
              currentUser={currentUser} lastSync={lastSync} onRefresh={onRefresh} 
            />
          )}

          {activeTab === 'LOG' && (
            <AdminLog 
              accessLogs={accessLogs} sessionLogs={sessionLogs} 
              users={users} fetchLogs={fetchLogs} isLoadingLogs={isLoadingLogs} 
            />
          )}
        </div>
      </main>

      {/* Floating Action Button yang lebih modern */}
      {activeTab !== 'MENU' && (
        <button
          onClick={onRefresh}
          className="fixed bottom-10 right-10 z-[600] p-5 bg-indigo-600 text-white rounded-[2rem] shadow-2xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
          title="Sinkronisasi Data"
        >
          <RefreshCw className={`w-7 h-7 ${isLoadingLogs ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;
