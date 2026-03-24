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
import AdminHeader from './admin/dashboard/AdminHeader';
import AdminTabs from './admin/dashboard/AdminTabs';
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
  
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  // States untuk Formulir Manager
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
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
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
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-900">
      
      <div className="sticky top-0 z-[100] w-full bg-white shadow-sm">
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
          <AdminTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            containerWidth={containerWidth} 
          />
        )}
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8" id="main-scroll-container">
        <div className="w-full pb-20">
          
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
                form={questionForm} 
                setForm={setQuestionForm} 
                initialForm={initialQuestionForm}
              />
            </div>
          )}

          {activeTab === 'SESI' && (
            <div className="w-full bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-xl border border-slate-200 p-6 sm:p-12 min-h-[70vh]">
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
            <div className="w-full bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-xl border border-slate-200 p-6 sm:p-12 min-h-[70vh]">
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

          {activeTab === 'MONITORING' && (
            <AdminMonitoring users={users} groups={groups} questions={questions} currentUser={currentUser} lastSync={lastSync} onRefresh={onRefresh} />
          )}

          {activeTab === 'LOG' && (
            <AdminLog accessLogs={accessLogs} sessionLogs={sessionLogs} users={users} fetchLogs={fetchLogs} isLoadingLogs={isLoadingLogs} />
          )}

        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;
