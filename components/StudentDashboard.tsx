
import { useState, useEffect, useMemo } from 'react';
import { User, QuestionGroup, Question } from '../types';
import { ensureArray, ensureObject, API_BASE_URL } from '../utils';
import { LogController } from '../controllers/LogController';
import { ProgressController } from '../controllers/ProgressController';
import { GroupController } from '../controllers/GroupController';
import { getCareerRoadmap, getDetailedStudentAnalysis } from '../services/ai/studentService';
import { calculateDynamicScore } from '../utils/examUtils';
import StudentAuditModal from './teacher/StudentAuditModal';

interface StudentDashboardProps {
  currentUser: User;
  questions: Question[];
  scores: any[];
  onRefresh?: () => void;
  startExam: (groupId: number) => void;
  onLogout?: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser, questions, scores, onRefresh, startExam, onLogout
}) => {
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [myProgress, setMyProgress] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<QuestionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'started' | 'not_started'>('all');
  
  // State untuk Fitur AI Roadmap Peminatan
  const [dreamJob, setDreamJob] = useState('');
  const [aiRoadmap, setAiRoadmap] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTimer, setAiTimer] = useState(0);
  const [aiStage, setAiStage] = useState(0); // 0: Idle, 1: Draft, 2: Koreksi, 3: Finalisasi

  // State untuk Analisis Hasil AI
  const [selectedFinishedSession, setSelectedFinishedSession] = useState<any | null>(null);
  const [studentAiNarration, setStudentAiNarration] = useState('');
  const [isGeneratingStudentAI, setIsGeneratingStudentAI] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [logsData, progressData, groupsData] = await Promise.all([
        LogController.getSessionEvents('all'),
        ProgressController.getMyProgress(currentUser.id),
        GroupController.getAll()
      ]);
      setSessionLogs(ensureArray(logsData));
      setMyProgress(ensureArray(progressData));
      setAllGroups(Array.isArray(groupsData) ? groupsData : (groupsData?.data || []));
    } catch (e) {
      console.error("Sinkronisasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000); 
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const handleGenerateRoadmap = async () => {
    if (!dreamJob.trim()) return;
    setIsGeneratingAI(true);
    setAiRoadmap('');
    setAiStage(1);
    
    // Estimasi waktu total sekitar 25-30 detik untuk 3 tahap
    setAiTimer(30);
    
    const timerInterval = setInterval(() => {
      setAiTimer(prev => {
        if (prev <= 1) return 1;
        
        // Update stage berdasarkan sisa waktu (simulasi)
        if (prev <= 10) setAiStage(3);
        else if (prev <= 20) setAiStage(2);
        
        return prev - 1;
      });
    }, 1000);

    try {
      // Mengirimkan input ke service yang sudah dioptimasi untuk validasi & peta jalan pendidikan
      const roadmap = await getCareerRoadmap(dreamJob, currentUser.name);
      setAiRoadmap(roadmap);
      setAiStage(3);
    } catch (error) {
      setAiRoadmap("Maaf, sirkuit pemetaan karir kami sedang sibuk. Silakan coba beberapa saat lagi.");
    } finally {
      setIsGeneratingAI(false);
      setAiStage(0);
      clearInterval(timerInterval);
      setAiTimer(0);
    }
  };

  const handleViewAnalysis = async (session: any) => {
    setSelectedFinishedSession(session);
    setStudentAiNarration('');
    setIsGeneratingStudentAI(true);
    
    try {
      // Get detailed answers for this session
      const res = await fetch(`${API_BASE_URL}?action=get_student_progress_detail&user_id=${currentUser.id}&group_id=${session.id}`);
      const data = await res.json();
      const mergedAnswers = ensureObject(data.answers);
      
      const sessionQs = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(session.id)));
      const sessionSubject = sessionQs.length > 0 ? sessionQs[0].subject : 'Mata Pelajaran Umum';
      const stats = calculateDynamicScore(sessionQs, mergedAnswers);
      const acc = Math.round((stats.earned / (stats.max || 1)) * 100);
      
      // Hitung kecepatan rata-rata (estimasi dari durasi pengerjaan)
      const durationMs = session.durationMs || 0;
      const avgT = Math.round((durationMs / 1000) / (stats.answered || 1));
      
      const questionsData = sessionQs.map(q => {
        const studentAnswer = mergedAnswers[q.id];
        const optionsMap: Record<string, string> = {};
        ensureArray(q.options).forEach(opt => {
          optionsMap[opt.id] = opt.text;
        });

        return {
          id: q.id,
          teks: q.text,
          opsi: optionsMap,
          jawabanSiswa: studentAnswer || "Tidak dijawab",
          jawabanBenar: q.correctOptionId || "N/A",
          kategori: q.subject
        };
      });

      const insight = await getDetailedStudentAnalysis(currentUser.name, {
        accuracy: acc,
        avgTime: avgT,
        weakestSubject: sessionSubject
      }, questionsData);
      
      setStudentAiNarration(insight);
    } catch (error) {
      setStudentAiNarration("Maaf, sistem analisis kami sedang mengalami gangguan teknis. Silakan coba lagi nanti.");
    } finally {
      setIsGeneratingStudentAI(false);
    }
  };

  const { activeSessions, finishedSessions } = useMemo(() => {
    const studentClass = (currentUser.kelas || '').toString().trim().toLowerCase();
    
    console.log(`[DEBUG] Filtering for Student: ${currentUser.name}, Class: "${studentClass}"`);

    const relevant = allGroups.filter(g => {
      // Robust target class extraction
      let targets: string[] = [];
      const rawTargets = g.target_classes as any;
      
      if (Array.isArray(rawTargets)) {
        targets = rawTargets.map((t: any) => t?.toString().trim().toLowerCase());
      } else if (typeof rawTargets === 'string') {
        // Handle JSON string, comma separated string or single string
        const trimmed = rawTargets.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              targets = parsed.map(t => t.toString().trim().toLowerCase());
            }
          } catch (e) {
            // Fallback if JSON parse fails
            targets = trimmed.split(',').map((t: string) => t.trim().toLowerCase());
          }
        } else {
          targets = trimmed.split(',').map((t: string) => t.trim().toLowerCase());
        }
      } else if (rawTargets !== undefined && rawTargets !== null) {
        targets = [rawTargets.toString().trim().toLowerCase()];
      }

      // Filter out empty strings from targets
      targets = targets.filter((t: string) => t !== "" && t !== "null");

      // Logika pencocokan: Jika kosong berarti untuk semua kelas, jika tidak harus ada di daftar
      const isRelevant = targets.length === 0 || targets.includes(studentClass);
      
      // Detailed logging for debugging
      if (studentClass.includes('9q') || (targets.some((t: string) => t.includes('9q')))) {
        console.log(`[DEBUG-FILTER] Group: "${g.group_name}"`);
        console.log(`[DEBUG-FILTER] Student Class: "${studentClass}"`);
        console.log(`[DEBUG-FILTER] Target Classes:`, targets);
        console.log(`[DEBUG-FILTER] Is Relevant: ${isRelevant}`);
      }

      return isRelevant;
    });

    const active: QuestionGroup[] = [];
    const finished: any[] = [];

    relevant.forEach(g => {
      // Cari entri skor untuk grup ini
      const scoreEntry = ensureArray(scores).find(s => 
        Number(s.group_id) === Number(g.id) && 
        Number(s.user_id) === Number(currentUser.id) &&
        s.status === 'active'
      );

      // Jika ada entri skor dan statusnya 'active', berarti sudah selesai
      if (scoreEntry) {
        const ansMap = ensureObject(scoreEntry.answers_json);
        finished.push({ 
          ...g, 
          answeredCount: Object.keys(ansMap).length, 
          uncertainCount: ensureArray(scoreEntry.uncertain_json || []).length,
          submitted_at: scoreEntry.end_time 
        });
      } else {
        // Jika tidak ada entri skor, atau statusnya bukan 'active' (misal 'reset'), masukkan ke daftar aktif
        active.push(g);
      }
    });

    // Terapkan filterMode pada activeSessions
    const filteredActive = active.filter(g => {
      if (filterMode === 'started') return g.last_started_at !== null;
      if (filterMode === 'not_started') return g.last_started_at === null;
      return true; // 'all'
    });

    return { activeSessions: filteredActive, finishedSessions: finished };
  }, [allGroups, currentUser, scores, filterMode]);

  return (
    <div className="space-y-8 sm:space-y-12 pb-24 px-4 sm:px-8">
      {/* Header Profile */}
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-6 text-center md:text-left">
           <div className="w-16 h-16 bg-blue-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl shrink-0 italic">
             {currentUser.name.charAt(0)}
           </div>
           <div>
             <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter leading-none uppercase italic">PEJUANG: <span className="text-blue-600">{currentUser.name}</span></h2>
             <p className="text-slate-400 font-bold mt-2 uppercase text-[9px] tracking-widest">KELAS {currentUser.kelas || '-'} | NIS {currentUser.nis || '-'}</p>
           </div>
         </div>
         <div className="flex items-center gap-3">
           <button onClick={() => { if(onRefresh) onRefresh(); fetchDashboardData(); }} className="px-6 py-3 bg-slate-50 text-blue-900 rounded-xl hover:bg-blue-900 hover:text-white transition-all shadow-sm flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border">
              <span>✨</span> SINKRON DATA
           </button>
           {onLogout && (
             <button onClick={onLogout} className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-2 font-black text-[9px] uppercase tracking-widest border">
                <span>🚪</span> KELUAR
             </button>
           )}
         </div>
      </div>

      {/* AI CAREER ROADMAP SECTION - V3 PEMINATAN KARIR */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🗺️</div>
             <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-[0.3em] italic">Peta Jalan Peminatan Karir</h3>
          </div>
          
          <div className="max-w-2xl">
            <h4 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Apa impian masa depanmu setelah lulus SMPN 06, {currentUser.name.split(' ')[0]}?</h4>
            <p className="text-blue-200/70 text-sm mt-3 font-medium leading-relaxed">
              Tuliskan profesi impianmu. AI kami akan merancang jalur pendidikan (SMA/SMK/Kuliah) serta menganalisa materi TKA yang akan menjadi "alat kerja" utamamu nanti!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input 
              type="text" 
              placeholder="Contoh: Ingin jadi Dokter, Programmer, atau Pengusaha?" 
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl p-5 text-white font-bold placeholder:text-white/30 outline-none focus:bg-white/20 transition-all border-b-4 border-white/10"
              value={dreamJob}
              onChange={(e) => setDreamJob(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateRoadmap()}
            />
            <button 
              onClick={handleGenerateRoadmap}
              disabled={isGeneratingAI || !dreamJob}
              className="px-10 py-5 bg-white text-blue-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 border-b-4 border-blue-200"
            >
              {isGeneratingAI ? `MENGANALISA (${aiTimer}s)...` : 'BUAT PETA JALAN ✨'}
            </button>
          </div>

          {isGeneratingAI && (
            <div className="pt-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-200/50">
                <span>{aiStage === 1 ? '📝 Menulis Draft...' : aiStage === 2 ? '🔍 Koreksi Logika...' : '✨ Finalisasi Teks...'}</span>
                <span>{Math.round(((30 - aiTimer) / 30) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-500 ease-linear"
                  style={{ width: `${((30 - aiTimer) / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {aiRoadmap && (
            <div className="mt-8 p-8 bg-white/10 border border-white/10 rounded-[2.5rem] animate-in fade-up backdrop-blur-md">
              <div className="flex items-start gap-5">
                <span className="text-4xl animate-bounce shrink-0">🎓</span>
                <div className="text-blue-50 text-sm sm:text-base leading-[1.8] italic font-medium whitespace-pre-wrap">
                  {aiRoadmap}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sesi Aktif */}
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ml-4 mr-4">
            <div className="flex items-center gap-4">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
               <h3 className="text-xs font-black uppercase text-blue-900 tracking-[0.3em] italic">Misi Tersedia (Aktif)</h3>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
               {[
                 { id: 'all', label: 'Semua' },
                 { id: 'started', label: 'Dimulai' },
                 { id: 'not_started', label: 'Belum' }
               ].map((btn) => (
                 <button
                   key={btn.id}
                   onClick={() => setFilterMode(btn.id as any)}
                   className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                     filterMode === btn.id 
                       ? 'bg-white text-blue-900 shadow-sm' 
                       : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   {btn.label}
                 </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeSessions.length > 0 ? activeSessions.map(g => {
              const progress = myProgress.find(p => Number(p.group_id) === Number(g.id));
              const totalQ = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(g.id))).length;
              
              const answeredCount = progress?.answered_count || 0;
              const uncertainCount = progress?.uncertain_count || 0;
              const progressPercent = Math.round((answeredCount / (totalQ || 1)) * 100);
              const isStarted = g.last_started_at !== null;

              return (
                 <div key={g.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-md hover:border-blue-900 transition-all flex flex-col justify-between group">
                    <div>
                       <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-900 text-[8px] font-black rounded-lg border border-blue-100 uppercase tracking-widest">{g.group_code}</span>
                            {isStarted ? (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[7px] font-black rounded-md border border-emerald-100 uppercase tracking-tighter animate-pulse">● LIVE</span>
                            ) : (
                              <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[7px] font-black rounded-md border border-slate-100 uppercase tracking-tighter">OFFLINE</span>
                            )}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isStarted ? 'text-emerald-500' : 'text-slate-300'}`}>
                            {isStarted ? 'READY ➔' : 'WAITING'}
                          </span>
                       </div>
                       <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800 leading-none">{g.group_name}</h4>
                       
                       {/* Status Indicator */}
                       <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${isStarted ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                          {isStarted ? '🚀 Sudah Dimulai Pengawas' : '🕒 Belum Dimulai'}
                       </div>
                       
                       {/* STATS PROGRESS DETIL */}
                       <div className="mt-8 space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-center">
                                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">💾 Tersimpan</p>
                                <p className="text-xl font-black text-blue-900">{answeredCount} <span className="text-xs opacity-30">/ {totalQ}</span></p>
                             </div>
                             <div className={`p-4 rounded-2xl border text-center transition-all ${uncertainCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">🚩 Ragu-ragu</p>
                                <p className="text-xl font-black text-amber-700">{uncertainCount}</p>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progres Global</span>
                                <span className="text-sm font-black text-blue-900 italic">{progressPercent}%</span>
                             </div>
                             <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border p-0.5">
                                <div 
                                   className="h-full bg-blue-900 rounded-full transition-all duration-1000 shadow-md" 
                                   style={{ width: `${progressPercent}%` }}
                                ></div>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => startExam(g.id)} 
                      disabled={!isStarted}
                      className={`w-full mt-10 py-6 rounded-2xl font-black uppercase text-[11px] shadow-xl transition-all border-b-8 tracking-widest ${
                        isStarted 
                          ? 'bg-blue-900 text-white hover:scale-[1.02] active:scale-95 border-blue-950' 
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      }`}
                    >
                       {!isStarted ? 'MENUNGGU PENGAWAS' : answeredCount > 0 ? 'LANJUTKAN MISI 🚀' : 'MULAI KERJAKAN 🚀'}
                    </button>
                 </div>
              );
            }) : (
              <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                 <p className="text-2xl font-black uppercase italic opacity-20 tracking-widest">
                   {filterMode === 'started' ? 'Tidak Ada Sesi Berjalan' : 
                    filterMode === 'not_started' ? 'Semua Sesi Sudah Dimulai' : 
                    'Antrian Misi Kosong'}
                 </p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-3 tracking-widest">
                   {filterMode === 'all' ? 'Sistem akan otomatis memuat saat sesi diaktifkan pengawas' : 'Coba ubah filter untuk melihat sesi lainnya'}
                 </p>
              </div>
            )}
         </div>
      </div>

      {/* Sesi Selesai */}
      {finishedSessions.length > 0 && (
        <div className="space-y-6">
           <div className="flex items-center gap-4 ml-4">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <h3 className="text-xs font-black uppercase text-emerald-900 tracking-[0.3em] italic">Misi Selesai (Arsip)</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {finishedSessions.map(g => (
                 <div key={g.id} className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-white shadow-sm opacity-80 grayscale-[0.5] hover:grayscale-0 transition-all">
                    <div className="flex justify-between items-center mb-6">
                       <span className="px-3 py-1 bg-white text-slate-400 text-[8px] font-black rounded-lg border border-slate-100 uppercase tracking-widest">{g.group_code}</span>
                       <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">SELESAI ✅</span>
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-600 leading-none">{g.group_name}</h4>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4">
                       <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Terjawab</p>
                          <p className="text-lg font-black text-slate-600">{g.answeredCount}</p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ragu-Ragu</p>
                          <p className="text-lg font-black text-slate-600">{g.uncertainCount}</p>
                       </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center gap-4">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Dikirim Pada:</span>
                          <span className="text-[9px] font-black text-slate-600 uppercase">{new Date(g.submitted_at).toLocaleString('id-ID')}</span>
                       </div>
                       <button 
                         onClick={() => handleViewAnalysis(g)}
                         className="px-4 py-2 bg-blue-900 text-white rounded-xl font-black text-[8px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                       >
                         LIHAT ANALISIS 🤖
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Modal Analisis Hasil Siswa */}
      <StudentAuditModal 
        selectedResult={selectedFinishedSession ? {
          ...selectedFinishedSession,
          user_id: currentUser.id,
          name: currentUser.name,
          nis: currentUser.nis,
          kelas: currentUser.kelas,
          current_group_id: selectedFinishedSession.id
        } : null}
        questions={questions}
        aiNarration={studentAiNarration}
        isGeneratingAI={isGeneratingStudentAI}
        calculateDynamicScore={calculateDynamicScore}
        onClose={() => setSelectedFinishedSession(null)}
      />

      <div className="text-center pt-16 opacity-30"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">SMART ASSESSMENT v9.9 • SMP N 06 PEKALONGAN</p></div>
    </div>
  );
};

export default StudentDashboard;
