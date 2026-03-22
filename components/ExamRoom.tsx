
import React, { useState, useEffect, useRef } from 'react';
import { ExamSession, Question, User, QuestionGroup } from '../types';
import QuestionView from './exam/QuestionView';
import QuestionPalette from './exam/QuestionPalette';
import { ProgressController } from '../controllers/ProgressController';
import { ScoreController } from '../controllers/ScoreController';
import { parseSafeDate, ensureArray, ensureObject, API_BASE_URL } from '../utils';
import { logEventToRemote } from '../utils/logger';

interface ExamRoomProps {
  activeSession: ExamSession;
  setActiveSession: React.Dispatch<React.SetStateAction<ExamSession | null>>;
  onFinish: () => void;
  activeGroupInfo?: any;
  currentUser: User;
  availableSessions?: QuestionGroup[];
  onSwitchSession?: (groupId: number) => Promise<void>;
  scores?: any[];
}

const ExamRoom: React.FC<ExamRoomProps> = ({ 
  activeSession, 
  setActiveSession, 
  onFinish, 
  activeGroupInfo, 
  currentUser,
  availableSessions = [],
  onSwitchSession,
  scores = []
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Ref untuk mencatat kapan siswa mulai melihat soal yang sedang aktif
  const questionStartTimeRef = useRef<number>(Date.now());

  const questions = activeSession.shuffledQuestions || [];
  const currentQ = questions[currentIndex];

  useEffect(() => {
    // Log exam start
    if (questions.length === 0) {
      logEventToRemote('EXAM_ABNORMAL_STATE', { 
        user_id: currentUser.id, 
        group_id: activeSession.groupId, 
        reason: 'Empty questions list'
      });
    }

    logEventToRemote('EXAM_START', { 
      user_id: currentUser.id, 
      group_id: activeSession.groupId, 
      group_name: activeSession.group_name,
      question_count: questions.length
    });

    const timer = setInterval(() => {
      const now = Date.now();
      const end = activeSession.startTime + ((activeGroupInfo?.duration_minutes || 90) * 60 * 1000);
      const rem = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(rem);
      if (rem <= 0) {
        // Jika waktu habis, langsung submit tanpa konfirmasi
        submitExam();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession.startTime, activeGroupInfo]);

  const calculatePoints = (q: Question, answer: any) => {
    const mode = (q.scoring_mode && q.scoring_mode.trim() !== "") ? q.scoring_mode : 'all_or_nothing';
    
    if (mode === 'all_or_nothing') {
      let correct = false;
      if (q.type === 'single') {
        correct = String(answer) === String(q.correctOptionId);
      } else if (q.type === 'multiple') {
        const sel = ensureArray(answer).map(String).sort().join(',');
        const ans = ensureArray(q.correctOptionIds).map(String).sort().join(',');
        correct = sel === ans && sel !== "";
      } else if (q.type === 'table') {
        const ansObj = ensureObject(answer);
        correct = q.statements?.every(s => String(ansObj[s.id] || '').toUpperCase() === String(s.correctAnswer).toUpperCase()) || false;
      }
      return correct ? Number(q.points) : 0;
    } else {
      let earned = 0;
      if (q.type === 'single') {
        earned = q.options?.find(o => String(o.id) === String(answer))?.points || 0;
      } else if (q.type === 'multiple') {
        ensureArray(answer).forEach(id => {
          earned += (q.options?.find(o => String(o.id) === String(id))?.points || 0);
        });
      } else if (q.type === 'table') {
        const ansObj = ensureObject(answer);
        q.statements?.forEach(s => {
          if (String(ansObj[s.id] || '').toUpperCase() === String(s.correctAnswer).toUpperCase()) {
            earned += Number(s.points);
          }
        });
      }
      return earned;
    }
  };

  const toggleUncertain = (qId: string) => {
    const cur = ensureArray(activeSession.uncertainAnswers);
    const next = cur.includes(qId.toString()) 
      ? cur.filter(id => id !== qId.toString()) 
      : [...cur, qId.toString()];
    setActiveSession(p => ({...p!, uncertainAnswers: next}));
  };

  /**
   * Mengirim log durasi pengerjaan per nomor soal ke database
   */
  const sendTimeLog = async (qIndex: number) => {
    const q = questions[qIndex];
    if (!q) return;

    const now = Date.now();
    const durationSeconds = Math.floor((now - questionStartTimeRef.current) / 1000);
    const answer = activeSession.answers[q.id];
    const earned = calculatePoints(q, answer);

    // Kirim data ke API menggunakan ProgressController
    try {
      await ProgressController.saveTimeLog({
        user_id: currentUser.id,
        group_id: activeSession.groupId,
        question_id: q.id,
        duration_seconds: durationSeconds,
        is_correct: earned >= Number(q.points) ? 1 : 0,
        answer_data: answer,
        uncertain_json: activeSession.uncertainAnswers // Tambahkan data ragu-ragu ke log progres
      });
    } catch (err) {
      console.warn("Gagal menyimpan log waktu pengerjaan soal.");
    }

    // Reset timer untuk soal berikutnya
    questionStartTimeRef.current = now;
  };

  const handleNavigate = (idx: number) => {
    if (idx === currentIndex) return;
    
    // Log navigation event
    logEventToRemote('EXAM_NAVIGATE', { 
      user_id: currentUser.id, 
      from_index: currentIndex, 
      to_index: idx,
      question_id: questions[idx]?.id
    });

    // Sebelum pindah, kirim log durasi soal lama (tanpa await agar navigasi instan)
    sendTimeLog(currentIndex);
    setCurrentIndex(idx);
  };

  const handleFinish = async () => {
    // Tampilkan modal konfirmasi
    setShowConfirmModal(true);
  };

  const submitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Kirim log durasi pengerjaan nomor terakhir
    await sendTimeLog(currentIndex);
    
    let total = 0; let max = 0;
    questions.forEach(q => {
      total += calculatePoints(q, activeSession.answers[q.id]);
      max += Number(q.points);
    });

    const score = Math.round((total / (max || 1)) * 100);
    
    try {
      const result = await ScoreController.submit({ 
          studentId: currentUser.id, 
          groupId: activeSession.groupId, 
          score, 
          totalPointsEarned: total, 
          maxPossiblePoints: max, 
          answers: activeSession.answers, 
          uncertainAnswers: activeSession.uncertainAnswers, // BUG #2 FIX: Kirim data ragu-ragu
          startTime: activeSession.startTime 
      });

      if (!result.success) {
        throw new Error(result.message || "Gagal mengirim hasil akhir.");
      }
    } catch (e: any) {
      alert(e.message || "Gagal mengirim hasil akhir. Pastikan koneksi internet aktif.");
      setIsSubmitting(false);
      return;
    }
    
    onFinish();
    logEventToRemote('EXAM_FINISH', { 
      user_id: currentUser.id, 
      group_id: activeSession.groupId, 
      score: score 
    });
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const answeredCount = Object.keys(activeSession.answers).filter(id => {
    const ans = activeSession.answers[id];
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'object') return Object.keys(ans).length > 0;
    return ans !== null && ans !== undefined && ans.toString().trim() !== "";
  }).length;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <header className="bg-white px-6 py-3 border-b flex justify-between items-center shadow-sm z-10">
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm">6</div>
            <h1 className="font-black text-blue-900 uppercase text-[10px] tracking-widest">{activeSession.group_name}</h1>
         </div>
         <div className={`px-5 py-1.5 rounded-full border-2 font-mono font-bold text-sm ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-blue-900'}`}>
            {formatTime(timeLeft)}
         </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
         <div className="flex-1 flex flex-col bg-white m-4 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
               <QuestionView 
                  question={currentQ} 
                  activeSession={activeSession}
                  onSingleSelect={(qId, optId) => setActiveSession(p => ({...p!, answers: {...p!.answers, [qId]: optId}}))}
                  onMultipleSelect={(qId, optId) => {
                    const cur = ensureArray(activeSession.answers[qId]);
                    const next = cur.includes(optId) ? cur.filter(i => i !== optId) : [...cur, optId];
                    setActiveSession(p => ({...p!, answers: {...p!.answers, [qId]: next}}));
                  }}
                  onTableSelect={(qId, stId, ch) => {
                    const next = {...ensureObject(activeSession.answers[qId]), [stId]: ch};
                    setActiveSession(p => ({...p!, answers: {...p!.answers, [qId]: next}}));
                  }}
                  onToggleUncertain={toggleUncertain}
                  isUncertain={ensureArray(activeSession.uncertainAnswers).includes(currentQ.id.toString())}
               />
            </div>
            <div className="p-6 border-t flex flex-wrap justify-between items-center bg-slate-50/50 gap-4">
               <div className="flex gap-2">
                  <button disabled={currentIndex === 0} onClick={() => handleNavigate(currentIndex - 1)} className="px-6 sm:px-8 py-4 bg-white border-2 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:border-blue-900 hover:text-blue-900 transition-all disabled:opacity-30">Kembali</button>
                  
                  {/* TOMBOL RAGU-RAGU (Pindah ke Navigasi Utama) */}
                  <button 
                    type="button"
                    onClick={() => toggleUncertain(currentQ.id)}
                    className={`flex items-center gap-2 px-6 sm:px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border-2 ${
                      ensureArray(activeSession.uncertainAnswers).includes(currentQ.id.toString())
                        ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-lg shadow-amber-100' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-amber-200 hover:text-amber-500'
                    }`}
                  >
                    <span className="text-lg">{ensureArray(activeSession.uncertainAnswers).includes(currentQ.id.toString()) ? '🚩' : '🏳️'}</span>
                    <span className="hidden sm:inline">{ensureArray(activeSession.uncertainAnswers).includes(currentQ.id.toString()) ? 'Hapus Ragu' : 'Ragu-Ragu'}</span>
                  </button>
               </div>

               <div className="hidden md:flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Soal Ke</span>
                  <span className="text-sm font-black text-blue-900 italic">{currentIndex + 1} / {questions.length}</span>
               </div>

               {currentIndex === questions.length - 1 ? (
                 <button onClick={handleFinish} disabled={isSubmitting} className="px-10 sm:px-12 py-4 bg-blue-900 text-white rounded-2xl font-black text-[11px] uppercase shadow-xl border-b-8 border-blue-950 active:scale-95 transition-all">
                    {isSubmitting ? 'MENYIMPAN...' : 'SELESAI & SUBMIT 🏁'}
                 </button>
               ) : (
                 <button onClick={() => handleNavigate(currentIndex + 1)} className="px-8 sm:px-10 py-4 bg-blue-900 text-white rounded-2xl font-black text-[11px] uppercase shadow-xl border-b-8 border-blue-950 active:scale-95 transition-all flex items-center gap-2">
                    SOAL BERIKUTNYA ➔
                 </button>
               )}
            </div>
         </div>
         <div className="w-80 p-4 hidden xl:block overflow-y-auto custom-scrollbar">
            <QuestionPalette questions={questions} activeSession={activeSession} currentIndex={currentIndex} onNavigate={handleNavigate} />
         </div>
      </div>

      {/* MODAL KONFIRMASI SUBMIT (BUG #3 FIX) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-white">
            <div className="bg-blue-900 p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px] rotate-12"></div>
               </div>
               <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Konfirmasi Selesai</h3>
                  <p className="text-blue-100 text-xs font-medium mt-1">Apakah Anda yakin ingin mengakhiri ujian ini?</p>
               </div>
            </div>

            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Terjawab</div>
                     <div className="text-2xl font-black text-blue-900">{answeredCount} <span className="text-xs text-slate-400">/ {questions.length}</span></div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                     <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Ragu-Ragu</div>
                     <div className="text-2xl font-black text-amber-600">{ensureArray(activeSession.uncertainAnswers).length}</div>
                  </div>
               </div>

               {answeredCount < questions.length && (
                 <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="text-[10px] font-bold text-red-600 leading-tight">
                      Masih ada <span className="underline">{questions.length - answeredCount} soal</span> yang belum Anda jawab.
                    </p>
                 </div>
               )}

               <div className="flex flex-col gap-3">
                  <button 
                    onClick={submitExam}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 border-2 border-blue-800 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'MENYIMPAN HASIL...' : 'YA, SAYA YAKIN SELESAI'}
                  </button>
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-slate-100 transition-all active:scale-95"
                  >
                    KEMBALI KE SOAL
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRoom;
