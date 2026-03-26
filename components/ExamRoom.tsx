import React, { useState, useEffect, useRef } from 'react';
import { ExamSession, Question, User, QuestionGroup } from '../types';
import QuestionView from './exam/QuestionView';
import QuestionPalette from './exam/QuestionPalette';
import ExamHeader from './exam/ExamHeader';
import ExamFooter from './exam/ExamFooter';
import ConfirmSubmitModal from './exam/ConfirmSubmitModal';
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
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
        const statements = ensureArray(q.statements);
        correct = statements.every(s => String(ansObj[s.id] || '').toUpperCase() === String(s.correctAnswer).toUpperCase());
      }
      return correct ? Number(q.points) : 0;
    } else {
      let earned = 0;
      if (q.type === 'single') {
        earned = ensureArray(q.options).find(o => String(o.id) === String(answer))?.points || 0;
      } else if (q.type === 'multiple') {
        ensureArray(answer).forEach(id => {
          earned += (ensureArray(q.options).find(o => String(o.id) === String(id))?.points || 0);
        });
      } else if (q.type === 'table') {
        const ansObj = ensureObject(answer);
        ensureArray(q.statements).forEach(s => {
          if (String(ansObj[s.id] || '').toUpperCase() === String(s.correctAnswer).toUpperCase()) {
            earned += Number(s.points) || 0;
          }
        });
      }
      return earned;
    }
  };

  const toggleUncertain = (qId: string) => {
    if (!qId) return;
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
    const isUncertain = ensureArray(activeSession.uncertainAnswers).includes(q.id.toString());

    // Kirim data ke API menggunakan ProgressController
    try {
      // 1. Simpan progres jawaban (Auto-save utama)
      await ProgressController.save({
        user_id: currentUser.id,
        group_id: activeSession.groupId,
        question_id: q.id,
        answer_data: answer,
        is_uncertain: isUncertain ? 1 : 0
      });

      // 2. Simpan log waktu (Tracking analitik)
      await ProgressController.saveTimeLog({
        user_id: currentUser.id,
        group_id: activeSession.groupId,
        question_id: q.id,
        duration_seconds: durationSeconds,
        is_correct: earned >= Number(q.points) ? 1 : 0,
        answer_data: answer,
        uncertain_json: activeSession.uncertainAnswers
      });
    } catch (err) {
      console.warn("Gagal menyimpan progres pengerjaan soal.");
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

  // Auto-save progress whenever answers or uncertain status change
  useEffect(() => {
    const saveProgress = async () => {
      if (!currentQ) return;
      setIsAutoSaving(true);
      
      const answer = activeSession.answers[currentQ.id];
      const isUncertain = ensureArray(activeSession.uncertainAnswers).includes(currentQ.id.toString());
      const now = Date.now();
      const durationSeconds = Math.floor((now - questionStartTimeRef.current) / 1000);
      const earned = calculatePoints(currentQ, answer);

      try {
        // 1. Simpan progres jawaban (Auto-save utama)
        await ProgressController.save({
          user_id: currentUser.id,
          group_id: activeSession.groupId,
          question_id: currentQ.id,
          answer_data: answer,
          is_uncertain: isUncertain ? 1 : 0
        });

        // 2. Simpan log waktu (Tracking analitik)
        await ProgressController.saveTimeLog({
          user_id: currentUser.id,
          group_id: activeSession.groupId,
          question_id: currentQ.id,
          duration_seconds: durationSeconds,
          is_correct: earned >= Number(currentQ.points) ? 1 : 0,
          answer_data: answer,
          uncertain_json: activeSession.uncertainAnswers
        });
      } catch (err) {
        console.warn("Auto-save failed.");
      } finally {
        setTimeout(() => setIsAutoSaving(false), 1000);
      }
    };

    // Debounce save to avoid too many requests
    const timeout = setTimeout(saveProgress, 2000);
    return () => clearTimeout(timeout);
  }, [activeSession.answers, activeSession.uncertainAnswers, currentQ?.id]);

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const answeredCount = Object.keys(activeSession?.answers || {}).filter(id => {
    const ans = activeSession.answers[id];
    if (ans === null || ans === undefined) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'object') return Object.keys(ans).length > 0;
    return ans.toString().trim() !== "";
  }).length;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <ExamHeader 
        groupName={activeSession.group_name || 'Ujian'}
        userName={currentUser.name || 'Siswa'}
        userKelas={currentUser.kelas || '-'}
        isAutoSaving={isAutoSaving}
        timeLeft={timeLeft}
        onLogout={() => {
          if (window.confirm('Keluar dari ujian? Progress akan tersimpan.')) {
            setActiveSession(null);
          }
        }}
      />
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
                  isUncertain={currentQ ? ensureArray(activeSession.uncertainAnswers).includes(currentQ.id.toString()) : false}
               />
            </div>
            <ExamFooter 
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              onNavigate={handleNavigate}
              onToggleUncertain={toggleUncertain}
              onFinish={handleFinish}
              isUncertain={currentQ ? ensureArray(activeSession.uncertainAnswers).includes(currentQ.id.toString()) : false}
              isSubmitting={isSubmitting}
              currentQuestionId={currentQ?.id?.toString() || ''}
            />
         </div>
         <div className="w-80 p-4 hidden xl:block overflow-y-auto custom-scrollbar">
            <QuestionPalette questions={questions} activeSession={activeSession} currentIndex={currentIndex} onNavigate={handleNavigate} />
         </div>
      </div>

      {showConfirmModal && (
        <ConfirmSubmitModal 
          answeredCount={answeredCount}
          totalQuestions={questions.length}
          uncertainCount={ensureArray(activeSession.uncertainAnswers).length}
          isSubmitting={isSubmitting}
          onSubmit={submitExam}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
};

export default ExamRoom;
