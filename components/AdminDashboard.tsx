import React, { useState, useEffect, useRef } from 'react';
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

  // Question Manager State
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
  
  // Session Manager State
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [sessionForm, setSessionForm] = useState<any>({
    group_name: '', group_code: '', duration_minutes: 60, extra_time_minutes: 0, is_shuffled: 1, target_classes: [], teacher_ids: []
  });

  // User Manager State
  const [userForm, setUserForm] = useState<Partial<User> | null>(null);

  // Layout & Resizing State
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // SOLUSI: Mengukur Tinggi Navbar Secara Otomatis
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(240);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setHeaderHeight(entry.contentRect.height);
      }
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
    const forceScroll = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (document.body) document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    forceScroll();

    const timer = setTimeout(forceScroll, 50);
    const timer2 = setTimeout(forceScroll, 300);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [activeTab]);

  const handleAddAction = () => {
    if (activeTab === 'SOAL') {
      setQuestionForm(initialQuestionForm);
      setEditingQuestionId(null);
      setShowQuestionForm(true);
    } else if (activeTab === 'SESI') {
      setSessionForm({
        group_name: '', group_code: '', duration_minutes: 60, extra_time_minutes: 0, is_shuffled: 1, target_classes: [], teacher_ids: []
      });
      setEditingSessionId(null);
      setShowSessionForm(true);
    } else if (activeTab === 'PENGGUNA') {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const academicYear = month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
      
      setUserForm({ 
        name: '', 
        role: UserRole.STUDENT, 
        username: '', 
        password: '', 
        kelas: '', 
        tahun_ajaran: academicYear 
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-slate-50 flex flex-col items-center">
      {/* PERSISTENT FIXED HEADER & TABS */}
      {/* Diberikan referensi (ref) ke div header ini untuk diukur tingginya */}
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
            <div className="bg-white pb-2">
              <AdminTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                containerWidth={containerWidth} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Container dengan Padding Dinamis. Tidak lagi menggunakan class pt-[240px] yang statis! */}
      <main 
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-8 transition-all duration-300"
        style={{ paddingTop: `${headerHeight + 24}px` }} 
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
          )}

          {activeTab === 'PENGGUNA' && (
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
          )}

          {activeTab === 'MONITORING' && (
            <AdminMonitoring 
              users={users} 
              groups={groups} 
              questions={questions} 
              currentUser={currentUser} 
              lastSync={lastSync} 
              onRefresh={onRefresh} 
            />
          )}

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

      {activeTab !== 'MENU' && showScrollTop && (
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="fixed bottom-6 right-6 z-[999] p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center"
          title="Scroll ke Atas"
        >
          <RefreshCw className="w-6 h-6 rotate-[-90deg]" />
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;
