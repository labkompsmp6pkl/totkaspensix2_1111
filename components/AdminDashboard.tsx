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

  // States untuk Formulir
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
  
  // --- SISTEM PENGUKUR TINGGI NAVBAR OTOMATIS (ANTI-TABRAKAN) ---
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(280); // Default aman awal

  useLayoutEffect(() => {
    if (!headerRef.current) return;
    
    const updateHeight = () => {
      if (headerRef.current) {
        // Mengambil tinggi asli navbar termasuk padding & tab yang membengkak
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    // Amati jika ukuran navbar berubah (misal teks turun ke bawah / wrapping)
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    
    updateHeight(); // Ukuran awal saat tab berubah

    return () => observer.disconnect();
  }, [activeTab]); // Reset hitungan setiap ganti tab

  // Memaksa scroll ke paling atas setiap ganti tab
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

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
    } else if (activeTab === 'SESI') {
      setSessionForm({ group_name: '', group_code: '', duration_minutes: 60, extra_time_minutes: 0, is_shuffled: 1, target_classes: [], teacher_ids: [] });
      setEditingSessionId(null);
      setShowSessionForm(true);
    } else if (activeTab === 'PENGGUNA') {
      const now = new Date(); const year = now.getFullYear(); const month = now.getMonth() + 1;
      const academicYear = month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
      setUserForm({ name: '', role: UserRole.STUDENT, username: '', password: '', kelas: '', tahun_ajaran: academicYear });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center">
      
      {/* PERSISTENT FIXED NAVBAR */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-[150] bg-white shadow-md border-b border-slate-200">
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
            <div className="bg-white">
              <AdminTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                containerWidth={window.innerWidth} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main 
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-12"
        style={{ paddingTop: `${headerHeight + 20}px` }}
      >
        <div className="w-full">
          
          {activeTab === 'MENU' && (
            <AdminMenu setActiveTab={setActiveTab} />
          )}

          {activeTab === 'SOAL' && (
            <div className="w-full max-w-7xl mx-auto bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 min-h-[70vh]">
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

          {activeTab === 'SESI' && (
            <div className="w-full max-w-7xl mx-auto bg-white rounded-[3rem] shadow-xl border border-slate-100 p-6 sm:p-10">
               <SessionManager 
                 groups={groups} 
                 questions={questions} 
                 users={users} 
                 examCode={examCode} 
                 activeGroupId={activeGroupId} 
                 refreshData={onRefresh} 
                 API_BASE_URL={API_BASE_URL} 
                 showForm={showSessionForm} 
                 setShowForm={setShowSessionForm} 
                 editingId={editingSessionId} 
                 setEditingId={setEditingSessionId} 
                 form={sessionForm} 
                 setForm={setSessionForm} 
               />
            </div>
          )}

          {activeTab === 'PENGGUNA' && (
            <div className="w-full max-w-7xl mx-auto bg-white rounded-[3rem] shadow-xl border border-slate-100 p-6 sm:p-10">
               <UserManager 
                 users={users} 
                 refreshData={onRefresh} 
                 API_BASE_URL={API_BASE_URL} 
                 accessLogs={accessLogs} 
                 sessionLogs={sessionLogs} 
                 scores={[]} 
                 userForm={userForm} 
                 setUserForm={setUserForm} 
               />
            </div>
          )}

          {activeTab === 'MONITORING' && <AdminMonitoring users={users} groups={groups} questions={questions} currentUser={currentUser} lastSync={lastSync} onRefresh={onRefresh} />}
          {activeTab === 'LOG' && <AdminLog accessLogs={accessLogs} sessionLogs={sessionLogs} users={users} fetchLogs={fetchLogs} isLoadingLogs={isLoadingLogs} />}

        </div>
      </main>

      {/* Floating Refresh Button */}
      {activeTab !== 'MENU' && (
        <button
          onClick={onRefresh}
          className="fixed bottom-6 right-6 z-[140] p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center"
          title="Sinkronisasi Data"
        >
          <RefreshCw className={`w-6 h-6 ${isLoadingLogs ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;