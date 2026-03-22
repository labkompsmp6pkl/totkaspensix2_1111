
import React, { useState } from 'react';
import { Question, QuestionGroup } from '../../types';
import { MathJax } from 'better-react-mathjax';
import { ensureArray, ensureObject } from '../../utils';
import { getDetailedClassAnalysis } from '../../services/ai/teacherService';

interface ClassAnalysisViewProps {
  className: string;
  stats: any;
  onInspectSiswa: (student: any) => void;
  setInspectedQuestion: (data: any) => void; 
}

const ClassAnalysisView: React.FC<ClassAnalysisViewProps> = ({ className, stats, onInspectSiswa, setInspectedQuestion }) => {
  const [classAiNarration, setClassAiNarration] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const insight = await getDetailedClassAnalysis(className, stats);
      setClassAiNarration(insight);
    } catch (e) {
      setClassAiNarration("Gagal memproses analisa. Pastikan koneksi aktif.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = (stats.mostMissedQuestions || []).filter((q: any) => {
    if (!questionSearch) return true;
    const searchLower = questionSearch.toLowerCase();
    // Search by question text/subject
    const matchText = (q.text || "").toLowerCase().includes(searchLower) || (q.subject || "").toLowerCase().includes(searchLower);
    if (matchText) return true;
    
    // Search by student name/NIS who got it wrong
    return q.distribution?.some((d: any) => 
      !d.isCorrect && (
        (d.name || "").toLowerCase().includes(searchLower) || 
        (d.nis || "").toLowerCase().includes(searchLower)
      )
    );
  });

  const filteredStudents = (stats.remedialRanking || []).filter((s: any) => 
    (s.name || "").toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.nis || "").toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.group_name || "").toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="bg-[#064e3b] min-h-screen rounded-2xl sm:rounded-[3rem] p-3 sm:p-10 text-white shadow-2xl animate-in fade-up">
      {/* Header Analisis */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-10 gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl border border-white/10 backdrop-blur-md shadow-xl">📊</div>
          <div>
            <h2 className="text-xl sm:text-3xl font-black uppercase italic tracking-tighter leading-none">Analisis Kelas {className}</h2>
            <p className="text-[8px] sm:text-[10px] font-bold text-emerald-300/60 uppercase tracking-[0.3em] mt-1 sm:mt-2">Intelektual Insight & Pemetaan Remedial</p>
          </div>
        </div>
        <div className="bg-white/10 px-6 sm:px-8 py-3 sm:py-5 rounded-2xl sm:rounded-[2.5rem] border border-white/10 backdrop-blur-xl text-center md:text-right shadow-2xl w-full md:w-auto">
          <p className="text-[8px] sm:text-[9px] font-black text-emerald-200 uppercase tracking-widest mb-1">Rata-rata Skor</p>
          <p className="text-2xl sm:text-4xl font-black italic">{stats.classAverageScore}<span className="text-xs sm:text-sm opacity-40 ml-1">/100</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Kolom Kiri: Statistik & Soal Sulit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/5 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all shadow-xl group text-center sm:text-left">
              <p className="text-[8px] sm:text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1 sm:mb-2 group-hover:text-white transition-colors">Penyelesaian</p>
              <p className="text-2xl sm:text-4xl font-black">{stats.completionRate}%</p>
            </div>
            <div className="bg-white/5 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all shadow-xl group text-center sm:text-left">
              <p className="text-[8px] sm:text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1 sm:mb-2 group-hover:text-white transition-colors">Butuh Remedial</p>
              <p className="text-2xl sm:text-4xl font-black text-amber-300">{stats.studentsNeedRemedial}</p>
            </div>
          </div>

          <div className="bg-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-white/5 flex flex-col h-[450px] sm:h-[550px] shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">⚠️</span>
                <h3 className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-100">Daftar Butir Soal Tersulit</h3>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Cari Nama/NIS/Soal..." 
                  className="bg-white/10 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase outline-none focus:border-emerald-500 transition-all w-full sm:w-48"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-2 sm:pr-3 custom-scrollbar flex-1">
              {filteredQuestions.map((data: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setInspectedQuestion(data)} 
                  className="w-full text-left bg-black/30 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-white/5 hover:border-emerald-500/50 hover:bg-black/40 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-all"></div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
                    <span className="text-[8px] sm:text-[9px] font-black text-emerald-400 uppercase tracking-tighter bg-emerald-950/50 px-2 py-1 rounded">MAPEL: {data.subject}</span>
                    <span className="bg-rose-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black shadow-lg shadow-rose-900/20">{data.errorCount} SISWA SALAH</span>
                  </div>
                  <div className="text-xs sm:text-[13px] font-medium text-emerald-50/80 line-clamp-2 italic leading-relaxed" dangerouslySetInnerHTML={{ __html: data.text }} />
                  <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[7px] sm:text-[8px] font-black text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                     <span>➔ AUDIT DISTRIBUSI PILIHAN SISWA</span>
                  </div>
                </button>
              ))}
              {filteredQuestions.length === 0 && (
                <div className="text-center py-10 opacity-40 italic text-[10px] sm:text-xs">Tidak ada data ditemukan...</div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Ranking & AI Strategy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-white/5 flex flex-col h-[400px] shadow-2xl">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xl sm:text-2xl">👤</span>
                  <h3 className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-100">Pemetaan Prioritas Remedial</h3>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Cari Nama/NIS..." 
                    className="bg-white/10 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase outline-none focus:border-emerald-500 transition-all w-full sm:w-60"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
             </div>
             <div className="space-y-3 overflow-y-auto pr-2 sm:pr-3 custom-scrollbar flex-1">
                {filteredStudents.map((s: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/5 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group gap-4">
                     <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black italic shadow-lg shrink-0 ${i < 3 ? 'bg-rose-500 text-white' : 'bg-white/10 text-white/40'}`}>{i + 1}</span>
                        <div className="flex-1">
                           <p className="font-black text-sm sm:text-base uppercase italic tracking-tight group-hover:text-emerald-400 transition-colors">{s.name}</p>
                           <p className="text-[7px] sm:text-[8px] font-black text-emerald-300/40 uppercase tracking-widest leading-none mt-1">NIS: {s.nis} | SESI: {s.group_name}</p>
                           <button onClick={() => onInspectSiswa(s.data)} className="text-[8px] sm:text-[9px] font-black text-emerald-500/60 hover:text-emerald-400 uppercase mt-2 flex items-center gap-2 transition-all">
                              TINJAU JAWABAN PESERTA 👁️
                           </button>
                        </div>
                     </div>
                     <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                        <div className="bg-rose-500/10 px-3 sm:px-4 py-2 sm:py-4 rounded-xl sm:rounded-[1.8rem] text-center border border-rose-500/20 shadow-2xl min-w-[60px] sm:min-w-[80px]">
                           <p className="text-[6px] sm:text-[7px] font-bold text-rose-300 uppercase mb-0.5 sm:mb-1 leading-none">Salah</p>
                           <p className="text-lg sm:text-xl font-black text-rose-400 italic">{s.missedCount}</p>
                        </div>
                        <div className="bg-white/10 px-4 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-[1.8rem] text-center border border-white/5 shadow-2xl min-w-[60px] sm:min-w-[80px]">
                           <p className="text-[6px] sm:text-[7px] font-bold text-white/30 uppercase mb-0.5 sm:mb-1 leading-none">Skor</p>
                           <p className="text-lg sm:text-xl font-black text-emerald-400 italic">{s.score}</p>
                        </div>
                     </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-10 opacity-40 italic text-[10px] sm:text-xs">Tidak ada siswa ditemukan...</div>
                )}
             </div>
          </div>

          {/* AI Strategy Insight */}
          <div className="bg-black/40 p-6 sm:p-12 rounded-2xl sm:rounded-[3.5rem] border border-emerald-500/20 shadow-2xl relative overflow-hidden group min-h-[300px] sm:min-h-[400px]">
             <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-500/5 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32 blur-[60px] sm:blur-[100px] group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
             <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4 sm:gap-6">
                   <div className="flex items-center gap-3 sm:gap-5">
                      <span className="text-2xl sm:text-4xl animate-bounce">🤖</span>
                      <div>
                         <h4 className="text-lg sm:text-xl font-black uppercase tracking-[0.2em] italic leading-none text-emerald-400">Pedagogical Insight</h4>
                         <p className="text-[8px] sm:text-[9px] text-white/40 font-bold mt-1 sm:mt-2 uppercase tracking-[0.3em]">Analisa Otomatis Struktur Kognitif</p>
                      </div>
                   </div>
                   <button 
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-5 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase shadow-2xl hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50 border-b-4 sm:border-b-8 border-emerald-800 tracking-widest shrink-0"
                   >
                      {isGenerating ? 'ANALYZING...' : 'GENERATE AI ✨'}
                   </button>
                </div>
                
                <div className="text-sm sm:text-[15px] font-medium leading-relaxed sm:leading-[2] text-emerald-50/90 italic">
                   {isGenerating ? (
                      <div className="flex flex-col gap-4 sm:gap-6 py-6 sm:py-10 animate-pulse">
                         <div className="h-3 sm:h-4 bg-emerald-900/50 rounded-full w-3/4"></div>
                         <div className="h-3 sm:h-4 bg-emerald-900/50 rounded-full w-full"></div>
                         <div className="h-3 sm:h-4 bg-emerald-900/50 rounded-full w-2/3"></div>
                         <p className="text-[9px] sm:text-[11px] font-black text-emerald-400 uppercase tracking-widest mt-2 sm:mt-4">AI sedang menyusun strategi perbaikan...</p>
                      </div>
                   ) : (
                      <div className="whitespace-pre-wrap">
                         {classAiNarration || "Klik tombol di atas untuk mendapatkan rekomendasi langkah perbaikan dan evaluasi mendalam bagi kelas ini."}
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassAnalysisView;
