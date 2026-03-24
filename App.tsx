
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, Question, QuestionGroup, ExamSession } from './types';
import Login from './components/Login';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import ExamRoom from './components/ExamRoom';
import { ConfigController } from './controllers/ConfigController';
import { QuestionController } from './controllers/QuestionController';
import { GroupController } from './controllers/GroupController';
import { ScoreController } from './controllers/ScoreController';
import { UserController } from './controllers/UserController';
import { ProgressController } from './controllers/ProgressController';
import { API_BASE_URL, ensureArray } from './utils';
import { logEventToRemote } from './utils/logger';

import { MathJaxContext } from 'better-react-mathjax';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'MENU' | 'SOAL' | 'SESI' | 'PENGGUNA' | 'MONITORING' | 'LOG'>('SOAL');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [examCode, setExamCode] = useState('TKA2026');
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isStartingExam, setIsStartingExam] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      const [configData, qData, gData, sData, uData] = await Promise.all([
        ConfigController.get(),
        QuestionController.getAll(),
        GroupController.getAll(),
        ScoreController.getAll(),
        UserController.getAll()
      ]);

      if (configData) {
        setExamCode(configData.exam_code || 'TKA2026');
        setActiveGroupId(configData.active_group_id ? Number(configData.active_group_id) : null);
      }

      const qRaw = Array.isArray(qData) ? qData : (qData?.data || []);
      const gRaw = Array.isArray(gData) ? gData : (gData?.data || []);

      // Ensure uniqueness by ID to prevent duplication issues
      const uniqueQuestions = qRaw.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.id === v.id) === i);
      const uniqueGroups = gRaw.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.id === v.id) === i);

      setQuestions(uniqueQuestions);
      setGroups(uniqueGroups);
      setScores(Array.isArray(sData) ? sData : (sData?.data || []));
      setUsers(Array.isArray(uData) ? uData : (uData?.data || []));
      
      setLastSync(new Date());
      // Heartbeat log for active users
      if (currentUser) {
        logEventToRemote('HEARTBEAT', { user_id: currentUser.id, name: currentUser.name, role: currentUser.role });
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('tka_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  useEffect(() => {
    // Jalankan migrasi database sekali saat aplikasi dimuat
    const runMigration = async () => {
      console.log("[MIGRATION] Memulai migrasi database di URL:", API_BASE_URL);
      try {
        const res = await fetch(`${API_BASE_URL}?action=migrate`);
        console.log("[MIGRATION] Status Response:", res.status);
        const text = await res.text();
        
        // Cek apakah response adalah JSON yang valid
        if (text.trim().startsWith('{')) {
          try {
            const data = JSON.parse(text);
            if (data.success) {
              console.log("[MIGRATION] Berhasil:", data.message);
            } else {
              console.warn("[MIGRATION] Gagal dari server:", data.message);
            }
          } catch (e) {
            console.warn("[MIGRATION] Response bukan JSON valid:", text.substring(0, 100));
          }
        } else {
          console.log("[MIGRATION] Response bukan JSON, mungkin lingkungan lokal atau error HTML.");
          if (text.includes('403 Forbidden')) {
            console.error("[MIGRATION] TERDETEKSI 403 FORBIDDEN. Periksa ModSecurity atau izin file api.php.");
          }
        }
      } catch (e) {
        console.error("[MIGRATION-ERROR] Gagal fetch:", e);
      }
    };
    runMigration();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('tka_user', JSON.stringify(user));
    logEventToRemote('USER_LOGIN', { user_id: user.id, name: user.name, role: user.role });
    refreshData();
  };

  const handleLogout = () => {
    if (currentUser) {
      logEventToRemote('USER_LOGOUT', { user_id: currentUser.id, name: currentUser.name });
    }
    setCurrentUser(null);
    setActiveSession(null);
    localStorage.removeItem('tka_user');
  };

  const startExam = async (groupId: number) => {
    if (!currentUser || isStartingExam) return;
    
    setIsStartingExam(true);
    try {
      const targetGroup = groups.find(g => Number(g.id) === Number(groupId));
      if (!targetGroup) throw new Error("Sesi tidak ditemukan");

      const progressRes = await ProgressController.getStudentProgress(currentUser.id, groupId);
      const existingAnswers = progressRes?.answers || {};
      const existingUncertain = progressRes?.uncertain || [];

      let sessionQuestions = questions.filter(q => 
        ensureArray(q.group_ids).map(Number).includes(Number(groupId))
      );

      if (Number(targetGroup.is_shuffled) === 1) {
         sessionQuestions = [...sessionQuestions].sort(() => Math.random() - 0.5);
      } else {
         sessionQuestions = [...sessionQuestions].sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
      }

      const newSession: ExamSession = {
        id: Date.now().toString(),
        studentId: currentUser.id,
        groupId: groupId,
        group_name: targetGroup.group_name,
        startTime: Date.now(),
        answers: existingAnswers,
        uncertainAnswers: existingUncertain,
        shuffledQuestions: sessionQuestions
      };
      
      setActiveSession(newSession);
    } catch (e) {
      alert("Gagal memuat sesi. Periksa koneksi.");
    } finally {
      setIsStartingExam(false);
    }
  };

  const availableSessionsForStudent = useMemo(() => {
    if (!currentUser || currentUser.role !== UserRole.STUDENT) return [];
    const studentClass = (currentUser.kelas || '').toString().trim().toLowerCase();
    
    return groups.filter(g => {
      const isLive = g.last_started_at !== null;
      
      // Robust target class extraction (same as StudentDashboard)
      let targets: string[] = [];
      const rawTargets = g.target_classes as any;
      if (Array.isArray(rawTargets)) {
        targets = rawTargets.map((t: any) => t?.toString().trim().toLowerCase());
      } else if (typeof rawTargets === 'string') {
        const trimmed = rawTargets.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) targets = parsed.map(t => t.toString().trim().toLowerCase());
          } catch (e) {
            targets = trimmed.split(',').map((t: string) => t.trim().toLowerCase());
          }
        } else {
          targets = trimmed.split(',').map((t: string) => t.trim().toLowerCase());
        }
      } else if (rawTargets !== undefined && rawTargets !== null) {
        targets = [rawTargets.toString().trim().toLowerCase()];
      }
      targets = targets.filter((t: string) => t !== "" && t !== "null");

      const matchesClass = targets.length === 0 || targets.includes(studentClass);
      return isLive && matchesClass;
    });
  }, [groups, currentUser]);

  if (!currentUser) return <Login examCode={examCode} onLoginSuccess={handleLogin} API_BASE_URL={API_BASE_URL} />;

  if (isStartingExam) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-blue-900 text-white p-10 text-center">
       <div className="w-16 h-16 sm:w-20 sm:h-20 border-8 border-white/20 border-t-white rounded-full animate-spin mb-8"></div>
       <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">Memuat Materi...</h2>
       <p className="text-blue-200 mt-2 font-bold uppercase text-[9px] sm:text-[10px]">Menghubungkan ke Academic Node</p>
    </div>
  );

  if (activeSession) return (
    <ExamRoom 
      activeSession={activeSession} 
      setActiveSession={setActiveSession} 
      onFinish={() => { setActiveSession(null); refreshData(); }} 
      currentUser={currentUser}
      activeGroupInfo={groups.find(g => Number(g.id) === Number(activeSession.groupId))}
      availableSessions={availableSessionsForStudent}
      onSwitchSession={startExam}
      scores={scores}
    />
  );

  return (
    <MathJaxContext>
      <div className="min-h-screen bg-slate-50 font-sans w-full flex flex-col relative">
        {currentUser.role !== UserRole.ADMIN && (
          <Navbar user={currentUser} onLogout={handleLogout} lastSync={lastSync} />
        )}
        <main className="flex-1 w-full pb-12">
            {currentUser.role === UserRole.ADMIN && (
              <AdminDashboard 
                currentUser={currentUser} 
                questions={questions} 
                setQuestions={setQuestions} 
                users={users} 
                setUsers={setUsers} 
                groups={groups} 
                activeGroupId={activeGroupId} 
                examCode={examCode} 
                setExamCode={setExamCode} 
                onRefresh={refreshData} 
                onLogout={handleLogout}
                lastSync={lastSync}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
            {currentUser.role === UserRole.TEACHER && (
              <TeacherDashboard scores={scores} groups={groups} questions={questions} users={users} activeGroupId={activeGroupId} API_BASE_URL={API_BASE_URL} />
            )}
            {currentUser.role === UserRole.STUDENT && (
              // Fixed: removed non-existent props from StudentDashboard call to match its definition.
              <StudentDashboard 
                currentUser={currentUser} 
                questions={questions} 
                startExam={startExam} 
                scores={scores} 
                onRefresh={refreshData} 
              />
            )}
        </main>
      </div>
    </MathJaxContext>
  );
};

export default App;
