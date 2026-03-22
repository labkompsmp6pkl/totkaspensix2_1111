
import React, { useState, useEffect, useMemo } from 'react';
import { QuestionGroup, Question, User } from '../types';
import TeacherFilter from './teacher/TeacherFilter';
import { LogController } from '../controllers/LogController';
import { formatFullDateTime, parseSafeDate, ensureArray, ensureObject } from '../utils';
import MediaRenderer from './exam/MediaRenderer';
import { MathJax } from 'better-react-mathjax';
import { getDetailedStudentAnalysis } from '../services/ai/studentService';
import ClassAnalysisView from './teacher/ClassAnalysisView';
import QuestionAuditModal from './teacher/QuestionAuditModal';
import StudentAuditModal from './teacher/StudentAuditModal';
import { calculateDynamicScore, getDurationData } from '../utils/examUtils';

interface TeacherDashboardProps {
  scores: any[];
  groups: QuestionGroup[];
  questions: Question[];
  users: User[];
  activeGroupId: number | null;
  API_BASE_URL: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ scores, groups, questions, users, activeGroupId, API_BASE_URL }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'FINISHED'>('ACTIVE');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(activeGroupId?.toString() || 'all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [search, setSearch] = useState("");
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [inspectedQuestion, setInspectedQuestion] = useState<any | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [ongoingList, setOngoingList] = useState<any[]>([]);
  const [aiNarration, setAiNarration] = useState<string>("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOngoing = async () => {
    try {
      const gid = selectedGroupId === 'all' ? (activeGroupId || null) : Number(selectedGroupId);
      if (!gid) return;
      const response = await LogController.getActiveMonitoring({ group_id: gid });
      setOngoingList(response?.ongoing || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchOngoing();
    const interval = setInterval(fetchOngoing, 10000);
    return () => clearInterval(interval);
  }, [selectedGroupId, activeGroupId]);

  const finishedFiltered = useMemo(() => {
    return (scores || []).filter(s => {
      const matchGroup = selectedGroupId === 'all' || Number(s.group_id) === Number(selectedGroupId);
      const matchClass = selectedClass === 'all' || s.kelas === selectedClass;
      return matchGroup && matchClass && (s.name || "").toLowerCase().includes(search.toLowerCase());
    }).map(s => {
      const sessionQuestions = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(s.group_id)));
      const dyn = calculateDynamicScore(sessionQuestions, s.answers_json);
      let missedCount = 0;
      sessionQuestions.forEach(q => {
        const qScore = calculateDynamicScore([q], { [q.id]: ensureObject(s.answers_json)[q.id] });
        if (qScore.earned < qScore.max) missedCount++;
      });
      const startIn = (s.start_time && parseSafeDate(s.start_time)?.getFullYear()! >= 2024) ? s.start_time : (s.created_at || null);
      const duration = getDurationData(startIn, s.end_time, now);
      return { ...s, dynEarned: dyn.earned, dynMax: dyn.max, dynAnswered: dyn.answered, dynTotal: dyn.total, missedCount, workDuration: duration.str, durationMs: duration.ms };
    });
  }, [scores, selectedGroupId, selectedClass, search, questions, now]);

  const classAIStats = useMemo(() => {
    if (activeTab !== 'FINISHED' || selectedClass === 'all' || finishedFiltered.length === 0) return null;
    let totalScoreSum = 0;
    finishedFiltered.forEach(s => totalScoreSum += s.dynMax > 0 ? (s.dynEarned / s.dynMax) * 100 : 0);
    const avgScore = Math.round(totalScoreSum / finishedFiltered.length);
    const questionStats: Record<string, any> = {};
    const subjectErrors: Record<string, number> = {};
    finishedFiltered.forEach(student => {
      const sessionQs = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(student.group_id)));
      sessionQs.forEach(q => {
        if (!questionStats[q.id]) questionStats[q.id] = { errorCount: 0, text: q.text, subject: q.subject, distribution: [], q };
        const score = calculateDynamicScore([q], { [q.id]: ensureObject(student.answers_json)[q.id] });
        const isCorrect = score.earned >= score.max && score.max > 0;
        if (!isCorrect) {
           questionStats[q.id].errorCount++;
           subjectErrors[q.subject] = (subjectErrors[q.subject] || 0) + 1;
        }
        questionStats[q.id].distribution.push({ 
           name: student.name, 
           nis: student.nis,
           choice: ensureObject(student.answers_json)[q.id], 
           isCorrect: isCorrect 
        });
      });
    });
    let mostMissedSubject = "Umum"; let maxErr = 0;
    Object.entries(subjectErrors).forEach(([subj, err]) => { if (err > maxErr) { maxErr = err; mostMissedSubject = subj; } });
    const mostMissed = Object.entries(questionStats)
      .sort((a:any, b:any) => b[1].errorCount - a[1].errorCount)
      .map(([id, data]) => {
         let patternInsight = "Kesalahan cenderung merata.";
         if (data.q.type === 'single') {
            const wrongChoices: Record<string, number> = {};
            data.distribution.forEach((d:any) => { if(!d.isCorrect && d.choice) wrongChoices[d.choice] = (wrongChoices[d.choice] || 0) + 1; });
            const sorted = Object.entries(wrongChoices).sort((a,b) => b[1] - a[1]);
            if (sorted.length > 0 && sorted[0][1] > data.distribution.length * 0.3) {
               patternInsight = `Miskonsepsi: Banyak terjebak di opsi (${sorted[0][0].toUpperCase()}).`;
            }
         }
         return { id, ...data, patternInsight };
      });
    const ranking = finishedFiltered.map(s => {
      const group = groups.find(g => Number(g.id) === Number(s.group_id));
      const score = Math.round((s.dynEarned / (s.dynMax || 1)) * 100);
      return { 
        name: s.name, 
        nis: s.nis,
        score, 
        missedCount: s.missedCount,
        group_name: group?.group_name || 'Sesi Tidak Diketahui',
        data: s 
      };
    }).sort((a,b) => a.score - b.score);

    const scoresList = ranking.map(r => r.score);
    const minScore = scoresList.length > 0 ? Math.min(...scoresList) : 0;
    const maxScore = scoresList.length > 0 ? Math.max(...scoresList) : 0;
    const passPercentage = Math.round((finishedFiltered.filter(s => (s.dynEarned / (s.dynMax || 1)) * 100 >= 70).length / finishedFiltered.length) * 100);

    // Distribusi nilai per mapel (sederhana)
    const scoreDistribution: Record<string, any> = {};
    finishedFiltered.forEach(s => {
      const sessionQs = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(s.group_id)));
      sessionQs.forEach(q => {
        if (!scoreDistribution[q.subject]) scoreDistribution[q.subject] = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        const score = calculateDynamicScore([q], { [q.id]: ensureObject(s.answers_json)[q.id] });
        const pct = (score.earned / (score.max || 1)) * 100;
        if (pct >= 85) scoreDistribution[q.subject].A++;
        else if (pct >= 70) scoreDistribution[q.subject].B++;
        else if (pct >= 55) scoreDistribution[q.subject].C++;
        else if (pct >= 40) scoreDistribution[q.subject].D++;
        else scoreDistribution[q.subject].E++;
      });
    });

    const difficultTopics = mostMissed.slice(0, 5).map(m => m.text.substring(0, 50) + "...");
    const commonErrorPatterns = mostMissed.slice(0, 3).map(m => m.patternInsight);

    return { 
      classAverageScore: avgScore, 
      mostMissedQuestions: mostMissed, 
      mostMissedSubject, 
      remedialRanking: ranking, 
      completionRate: Math.round((finishedFiltered.filter(s => s.dynAnswered === s.dynTotal).length / finishedFiltered.length) * 100), 
      studentsNeedRemedial: finishedFiltered.filter(s => (s.dynEarned / (s.dynMax || 1)) * 100 < 70).length,
      totalStudents: finishedFiltered.length,
      minScore,
      maxScore,
      passPercentage,
      scoreDistribution,
      difficultTopics,
      commonErrorPatterns
    };
  }, [finishedFiltered, activeTab, selectedClass, questions]);

  const handleInspectSiswa = async (student: any) => {
    setIsFetchingDetail(true);
    setAiNarration("");
    try {
      const gid = student.group_id || selectedGroupId;
      const res = await fetch(`${API_BASE_URL}?action=get_student_progress_detail&user_id=${student.user_id || student.studentId}&group_id=${gid}`);
      const data = await res.json();
      const mergedAnswers = { ...ensureObject(student.answers_json), ...ensureObject(data.answers) };
      setSelectedResult({ ...student, current_group_id: gid, answers_json: mergedAnswers });
      
      setIsGeneratingAI(true);
      const sessionQs = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(gid)));
      const sessionSubject = sessionQs.length > 0 ? sessionQs[0].subject : 'Mata Pelajaran Umum';
      const stats = calculateDynamicScore(sessionQs, mergedAnswers);
      const acc = Math.round((stats.earned / (stats.max || 1)) * 100);
      const dur = getDurationData(student.start_time || student.created_at, student.end_time, now);
      const avgT = Math.round((dur.ms / 1000) / (stats.answered || 1));
      
      // Persiapkan data soal untuk analisis AI yang lebih mendalam
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
      
      const insight = await getDetailedStudentAnalysis(student.name, { 
        accuracy: acc, 
        avgTime: avgT, 
        weakestSubject: sessionSubject, 
        personality: 'Siswa SMPN 06' 
      }, questionsData);
      setAiNarration(insight);
    } catch (e) {} finally { setIsFetchingDetail(false); setIsGeneratingAI(false); }
  };

  return (
    <div className="space-y-6 pb-24 px-4 sm:px-8">
      <div className="sticky top-[3.5rem] sm:top-[4rem] z-[90] bg-white/95 backdrop-blur-md p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-xl border-2 border-slate-100 space-y-4 sm:space-y-8">
         <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-center lg:text-left">
               <h2 className="text-lg sm:text-xl font-black text-blue-900 uppercase tracking-tighter italic leading-none">Monitoring Pengajar</h2>
               <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 sm:mt-2">Analisa Durasi & Ketepatan Jawaban Terkini</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl sm:rounded-2xl gap-1 shadow-inner border w-full lg:w-auto">
               <button onClick={() => setActiveTab('ACTIVE')} className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[10px] uppercase transition-all ${activeTab === 'ACTIVE' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400'}`}>Aktif ({ongoingList.filter(s => selectedClass === 'all' || s.kelas === selectedClass).length})</button>
               <button onClick={() => setActiveTab('FINISHED')} className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[10px] uppercase transition-all ${activeTab === 'FINISHED' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400'}`}>Submit ({finishedFiltered.length})</button>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-50">
            <TeacherFilter teacherSessions={groups} availableClasses={useMemo(() => Array.from(new Set(users.filter(u => u.role === 'SISWA' && u.kelas).map(u => u.kelas as string))).sort(), [users])} selectedGroupId={selectedGroupId} selectedClass={selectedClass} onGroupChange={setSelectedGroupId} onClassChange={setSelectedClass} />
            <div className="relative">
               <input className="w-full p-3 sm:p-4 bg-slate-50 border-2 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs outline-none focus:border-blue-900" placeholder="Cari Nama/NIS..." value={search} onChange={e => setSearch(e.target.value)} />
               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
            </div>
         </div>
      </div>

      {activeTab === 'FINISHED' && selectedClass !== 'all' && classAIStats && (
        <ClassAnalysisView className={selectedClass} stats={classAIStats} onInspectSiswa={handleInspectSiswa} setInspectedQuestion={setInspectedQuestion} />
      )}

      {(activeTab === 'ACTIVE' || (activeTab === 'FINISHED' && selectedClass === 'all')) && (
        <div className="grid grid-cols-1 gap-4">
          {(activeTab === 'ACTIVE' ? ongoingList.filter(s => selectedClass === 'all' || s.kelas === selectedClass) : finishedFiltered).map((s, idx) => (
              <div key={s.id || `${s.user_id}-${s.group_id}-${idx}`} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 animate-in fade-up hover:border-blue-900 transition-all">
                 <div className="flex items-center gap-4 sm:gap-5 w-full lg:w-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-900 text-white rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shrink-0 uppercase">{(s.name || "?").charAt(0)}</div>
                    <div>
                      <p className="font-black text-slate-800 text-sm sm:text-base uppercase leading-none">{s.name}</p>
                      <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase mt-1.5 sm:mt-2 tracking-wider">KLS {s.kelas} | NIS {s.nis}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 sm:gap-8 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 sm:pt-4 lg:pt-0">
                    {activeTab === 'FINISHED' ? (
                       <div className="text-center lg:text-right">
                          <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase leading-none mb-1 sm:mb-1.5 tracking-widest">Skor Akhir</p>
                          <p className="text-xl sm:text-3xl font-black text-blue-900 italic leading-none">{s.dynEarned} <span className="text-xs sm:text-sm text-slate-300">/ {s.dynMax}</span></p>
                       </div>
                    ) : (
                       <div className="flex flex-col gap-1 w-24 sm:w-32">
                          <p className="text-[7px] sm:text-[8px] font-black text-blue-400 uppercase">Progres</p>
                          <div className="h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden border"><div className="h-full bg-blue-500" style={{ width: `${Math.round(((s.answered_count || 0) / (questions.length || 1)) * 100)}%` }}></div></div>
                       </div>
                    )}
                    <button onClick={() => handleInspectSiswa(s)} className="px-5 sm:px-8 py-3 sm:py-5 bg-blue-900 text-white rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-[10px] uppercase shadow-xl hover:scale-105 transition-all tracking-widest active:scale-95">AUDIT 📑</button>
                 </div>
              </div>
          ))}
        </div>
      )}

      {/* MODAL AUDIT BUTIR SOAL KOMPREHENSIF (KOMPONEN TERPISAH) */}
      <QuestionAuditModal data={inspectedQuestion} onClose={() => setInspectedQuestion(null)} />

      {/* Modal Hasil Siswa Personal (Audit Detil Peserta) */}
      <StudentAuditModal 
        selectedResult={selectedResult}
        questions={questions}
        aiNarration={aiNarration}
        isGeneratingAI={isGeneratingAI}
        calculateDynamicScore={calculateDynamicScore}
        onClose={() => setSelectedResult(null)}
      />
    </div>
  );
};

export default TeacherDashboard;
