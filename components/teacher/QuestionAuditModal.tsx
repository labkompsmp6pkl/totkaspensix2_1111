
import React, { useState, useMemo } from 'react';
import { Question } from '../../types';
import { MathJax } from 'better-react-mathjax';
import MediaRenderer from '../exam/MediaRenderer';
import { ensureArray, ensureObject } from '../../utils';

interface QuestionAuditModalProps {
  data: any; // Data soal hasil analisa dari dashboard
  onClose: () => void;
}

const QuestionAuditModal: React.FC<QuestionAuditModalProps> = ({ data, onClose }) => {
  const [searchStudent, setSearchStudent] = useState("");

  // Pindahkan deteksi siswa yang kosong ke useMemo di atas agar tidak melanggar Rules of Hooks
  const unansweredStudents = useMemo(() => {
    if (!data || !data.distribution || !data.q) return [];
    const { q, distribution } = data;
    
    return distribution.filter((d: any) => {
      if (q.type === 'table') {
        const choices = ensureObject(d.choice);
        return q.statements?.every((st: any) => !choices[st.id] || String(choices[st.id]).trim() === "");
      }
      if (q.type === 'multiple') {
        return !d.choice || ensureArray(d.choice).length === 0;
      }
      return !d.choice || String(d.choice).trim() === "";
    });
  }, [data]);

  // Helper untuk memproses & menyortir daftar siswa
  const processStudentList = (students: any[]) => {
    const filtered = !searchStudent 
      ? students 
      : students.filter(s => s.name.toLowerCase().includes(searchStudent.toLowerCase()));
    
    // Sortir Nama A-Z agar rapi
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  };

  // CONDITIONAL RETURN DILETAKKAN SETELAH SEMUA HOOKS (useState, useMemo)
  if (!data) return null;

  const { q, distribution, patternInsight, errorCount, subject, id, text } = data;
  const filteredUnanswered = processStudentList(unansweredStudents);

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[4000] flex items-center justify-center p-1 sm:p-2">
      <div className="bg-white w-[98vw] max-w-7xl rounded-2xl sm:rounded-[3.5rem] shadow-2xl flex flex-col h-[98vh] sm:h-[95vh] animate-in zoom-in-95 border-2 sm:border-[10px] border-white overflow-hidden relative">
        
        {/* TOP BAR */}
        <div className="p-5 sm:p-10 border-b flex justify-between items-center bg-white shrink-0 z-20">
          <div className="max-w-[70%]">
            <h3 className="text-lg sm:text-2xl font-black uppercase text-blue-900 tracking-tighter italic leading-tight">Audit & Analisa Butir Soal</h3>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 sm:mt-2">ID: #{id} | Mapel: {subject}</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="bg-rose-500 text-white px-4 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-black italic shadow-xl hidden md:block text-center">
              <p className="text-[7px] sm:text-[8px] uppercase opacity-70 leading-none mb-1">Total Salah</p>
              <p className="text-lg sm:text-2xl leading-none">{errorCount} SISWA</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-xl sm:text-2xl">✕</button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-12 space-y-8 sm:space-y-12 custom-scrollbar bg-slate-50/30">
          
          {/* SECTION: TEKS SOAL */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2">
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs sm:text-sm">📝</span>
              <h4 className="text-[9px] sm:text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Teks & Media Butir Soal</h4>
            </div>
            <div className="bg-white p-4 sm:p-10 rounded-2xl sm:rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-x-auto custom-scrollbar">
              <MathJax dynamic>
                <div className="text-sm sm:text-lg font-bold text-slate-700 leading-relaxed rendered-question-text max-w-none" dangerouslySetInnerHTML={{ __html: text }} />
              </MathJax>
              <div className="mt-4">
                <MediaRenderer url={q.mediaUrl} />
              </div>
            </div>
          </section>

          {/* SECTION: DIAGNOSIS AI */}
          <section className="bg-indigo-900 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32 blur-2xl sm:blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-4xl animate-bounce">🤖</span>
                <div>
                  <h4 className="text-lg sm:text-xl font-black uppercase italic tracking-tight leading-none">Diagnosis Kesalahan AI</h4>
                  <p className="text-[8px] sm:text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-1 sm:mt-2">Analisa Pola Jawaban Salah</p>
                </div>
              </div>
              <p className="text-sm sm:text-lg leading-relaxed italic font-medium opacity-95 bg-black/20 p-5 sm:p-8 rounded-xl sm:rounded-[2rem] border border-white/10 shadow-inner">
                "{patternInsight || "Sedang memproses pola kognitif siswa..."}"
              </p>
            </div>
          </section>

          {/* SECTION: DISTRIBUSI & SEARCH */}
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 px-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">📊</span>
                <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-[0.2em]">Distribusi Jawaban ({distribution.length} Peserta Terdeteksi)</h4>
              </div>
              
              <div className="relative w-full md:w-80">
                <input 
                  className="w-full p-4 pl-12 bg-white border-4 border-blue-900/10 rounded-2xl text-[11px] font-bold uppercase outline-none focus:border-blue-900 shadow-xl transition-all"
                  placeholder="CARI NAMA PESERTA..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-900 text-lg">🔍</span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* OPSI KOSONG (BLANK) */}
              {unansweredStudents.length > 0 && (
                <div className="rounded-2xl sm:rounded-[3rem] border-2 sm:border-4 border-dashed border-slate-200 bg-slate-50/50 overflow-hidden">
                   <div className="p-5 sm:p-8 flex items-center justify-between gap-4 sm:gap-6 border-b border-slate-200/50">
                      <div className="flex items-center gap-3 sm:gap-6">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-lg sm:text-xl text-slate-300">∅</div>
                        <div>
                          <h5 className="text-sm sm:text-base font-black text-slate-500 uppercase italic">Jawaban Kosong</h5>
                          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">Siswa yang melewati soal</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xl sm:text-3xl font-black text-slate-400 italic">{Math.round((unansweredStudents.length / distribution.length) * 100)}%</p>
                      </div>
                   </div>
                   <div className="p-5 sm:p-8 pt-4 sm:pt-6 flex flex-wrap gap-2">
                      {filteredUnanswered.map((s: any, i: number) => (
                        <span key={i} className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tight shadow-sm border bg-white text-slate-400 border-slate-200 animate-in fade-in zoom-in-90">
                          {s.name}
                        </span>
                      ))}
                   </div>
                </div>
              )}

              {/* OPSI PILIHAN GANDA / KOMPLEKS */}
              {(q.type === 'single' || q.type === 'multiple') ? (
                q.options?.map((opt: any) => {
                  const isCorrectPart = q.type === 'single' 
                    ? String(q.correctOptionId).toLowerCase() === String(opt.id).toLowerCase()
                    : ensureArray(q.correctOptionIds).map(String).includes(String(opt.id));
                  
                  const studentsInOption = distribution.filter((d:any) => {
                     if (q.type === 'single') return String(d.choice).toLowerCase() === String(opt.id).toLowerCase();
                     return ensureArray(d.choice).map(String).includes(String(opt.id));
                  });
                  
                  const filteredStudents = processStudentList(studentsInOption);
                  const percentage = Math.round((studentsInOption.length / (distribution.length || 1)) * 100);

                  return (
                    <div key={opt.id} className={`rounded-2xl sm:rounded-[3rem] border-2 transition-all overflow-hidden bg-white ${isCorrectPart ? 'border-emerald-200 ring-4 ring-emerald-50' : studentsInOption.length > 0 ? 'border-rose-100 shadow-lg' : 'border-slate-100 opacity-40 grayscale'}`}>
                      <div className={`p-5 sm:p-8 flex items-center justify-between gap-4 sm:gap-6 ${isCorrectPart ? 'bg-emerald-50/30' : 'bg-white'}`}>
                        <div className="flex items-center gap-3 sm:gap-6">
                          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shadow-lg ${isCorrectPart ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border'}`}>
                            {opt.id.toUpperCase()}
                          </div>
                          <div>
                            <MathJax dynamic><div className={`text-sm sm:text-base font-bold leading-tight ${isCorrectPart ? 'text-emerald-800' : 'text-slate-600'}`} dangerouslySetInnerHTML={{ __html: opt.text }} /></MathJax>
                            <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                               <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${isCorrectPart ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  {isCorrectPart ? '✓ Kunci' : '✗ Pengecoh'}
                               </span>
                               <span className="text-[9px] sm:text-[10px] font-black text-slate-300">|</span>
                               <span className="text-[9px] sm:text-[10px] font-black text-blue-900 uppercase italic">{studentsInOption.length} Siswa</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xl sm:text-3xl font-black ${isCorrectPart ? 'text-emerald-600' : 'text-rose-500'} italic`}>{percentage}%</p>
                        </div>
                      </div>

                      {filteredStudents.length > 0 && (
                        <div className="p-5 sm:p-8 pt-0 flex flex-wrap gap-2">
                          {filteredStudents.map((s: any, i: number) => (
                            <span key={i} className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tight shadow-md border animate-in fade-in zoom-in-90 ${isCorrectPart ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : q.type === 'table' ? (
                <div className="bg-white p-1 rounded-2xl sm:rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                   <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
                      <thead className="bg-slate-50 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">
                         <tr>
                            <th className="p-5 sm:p-8">Pernyataan Matriks</th>
                            <th className="p-5 sm:p-8">Detail Siswa (A-Z)</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {q.statements?.map((st: any) => {
                            const correctAns = String(st.correctAnswer).trim().toUpperCase();
                            const wrongStudents = distribution.filter((d:any) => {
                                const sAns = String(ensureObject(d.choice)[st.id] || '').trim().toUpperCase();
                                return sAns !== correctAns && sAns !== '';
                            });
                            const filteredWrongs = processStudentList(wrongStudents);

                            return (
                               <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                                   <td className="p-5 sm:p-8 w-1/2 sm:w-1/3">
                                     <MathJax dynamic><div className="text-xs sm:text-sm font-bold text-slate-700 leading-snug" dangerouslySetInnerHTML={{ __html: st.text }} /></MathJax>
                                     <div className="mt-3 sm:mt-4 bg-emerald-600 text-white px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[9px] font-black w-fit shadow-md">KUNCI: {correctAns}</div>
                                  </td>
                                  <td className="p-5 sm:p-8">
                                     {wrongStudents.length > 0 ? (
                                        <div className="space-y-2 sm:space-y-3">
                                           <div className="flex items-center gap-2">
                                              <span className="text-rose-500 font-black text-[8px] sm:text-[10px] uppercase tracking-widest">✗ {wrongStudents.length} Salah</span>
                                           </div>
                                           <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                              {filteredWrongs.map((s:any, i:number) => (
                                                 <span key={i} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-rose-50 rounded-lg text-[8px] sm:text-[9px] font-black text-rose-600 border border-rose-100 shadow-sm uppercase">{s.name}</span>
                                              ))}
                                           </div>
                                        </div>
                                     ) : (
                                        <span className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase italic">✓ Semua Benar</span>
                                     )}
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-5 sm:p-8 bg-slate-50 border-t shrink-0 z-20">
          <button onClick={onClose} className="w-full py-4 sm:py-6 bg-blue-900 text-white rounded-2xl sm:rounded-[2rem] font-black uppercase text-[10px] sm:text-xs shadow-2xl active:scale-95 transition-all border-b-4 sm:border-b-8 border-blue-950 tracking-[0.2em] sm:tracking-[0.3em]">
             SELESAI AUDIT & KEMBALI 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionAuditModal;
