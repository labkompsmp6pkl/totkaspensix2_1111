
import React from 'react';
import { MathJax } from 'better-react-mathjax';
import MediaRenderer from '../exam/MediaRenderer';
import { ensureArray, ensureObject } from '../../utils';
import { Question } from '../../types';

interface StudentAuditModalProps {
  selectedResult: any;
  questions: Question[];
  aiNarration: string;
  isGeneratingAI: boolean;
  calculateDynamicScore: (qList: Question[], answersJson: any) => any;
  onClose: () => void;
}

const StudentAuditModal: React.FC<StudentAuditModalProps> = ({ 
  selectedResult, 
  questions, 
  aiNarration, 
  isGeneratingAI, 
  calculateDynamicScore,
  onClose 
}) => {
  if (!selectedResult) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-1 sm:p-2">
       <div className="bg-white w-[98vw] max-w-7xl rounded-2xl sm:rounded-[3rem] p-3 sm:p-10 shadow-2xl flex flex-col h-[98vh] sm:h-[95vh] animate-in zoom-in-95 border-2 border-white overflow-hidden">
          <div className="flex justify-between items-start border-b pb-4 sm:pb-6 shrink-0">
             <div>
                <h3 className="text-lg sm:text-2xl font-black uppercase text-blue-900 italic tracking-tighter leading-none">{selectedResult.name}</h3>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 sm:mt-3">NIS: {selectedResult.nis} | KELAS: {selectedResult.kelas}</p>
             </div>
             <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-300 hover:text-red-500 transition-colors">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-1 sm:p-2 space-y-6 sm:space-y-8 custom-scrollbar mt-4 sm:mt-6 pr-2 sm:pr-4">
             <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-5 sm:p-8 rounded-2xl sm:rounded-[3rem] text-white shadow-2xl border-4 border-white/10 animate-in fade-up">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl">🤖</div><h4 className="font-black text-base sm:text-lg uppercase tracking-tight italic leading-none">Personal Insight</h4></div>
                <div className="bg-black/20 p-5 sm:p-8 rounded-xl sm:rounded-[2rem] border border-white/5 shadow-inner">
                   <p className="text-[8px] sm:text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3 sm:mb-4">🎯 ANALISA REKOMENDASI AI:</p>
                   <div className="text-xs sm:text-[14px] font-medium opacity-95 leading-relaxed min-h-[80px] sm:min-h-[100px]">
                      {isGeneratingAI ? (
                         <div className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 animate-pulse">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-300 rounded-full animate-bounce"></div>
                            <p className="text-[9px] sm:text-[11px] font-black text-blue-300 uppercase tracking-widest">AI sedang memproses...</p>
                         </div>
                      ) : ( <p className="whitespace-pre-wrap">{aiNarration || "Statistik performa sedang dianalisa sistem..."}</p> )}
                   </div>
                </div>
             </div>
             <div className="space-y-4 sm:space-y-6">
                <p className="text-[9px] sm:text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1 italic">Audit Butir Jawaban Peserta:</p>
                <MathJax dynamic>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(selectedResult.current_group_id || selectedResult.group_id))).map((q, idx) => {
                       const ans = ensureObject(selectedResult.answers_json)[q.id];
                       const scoreData = calculateDynamicScore([q], { [q.id]: ans });
                       const isCorrect = scoreData.earned === scoreData.max && scoreData.max > 0;
                       const isAnswered = ans !== undefined && ans !== null && ans !== "" && (typeof ans !== 'object' || Object.keys(ans).length > 0);

                       return (
                          <div key={`${q.id}-${idx}`} className={`p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] border-2 bg-white transition-all ${isAnswered ? (isCorrect ? 'border-emerald-100 bg-emerald-50/10' : 'border-rose-100 bg-rose-50/10') : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                             <div className="flex items-start gap-3 sm:gap-6">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-md ${isAnswered ? (isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white') : 'bg-slate-200 text-slate-400'}`}>{idx + 1}</div>
                                <div className="flex-1 space-y-3 sm:space-y-4 overflow-hidden">
                                   <div className="overflow-x-auto custom-scrollbar">
                                      <div className="text-xs sm:text-[14px] font-bold text-slate-800 leading-relaxed rendered-question-text" dangerouslySetInnerHTML={{ __html: q.text }} />
                                   </div>
                                   <MediaRenderer url={q.mediaUrl} />
                                   
                                   <div className="pt-3 sm:pt-4 border-t border-slate-100 space-y-3 sm:space-y-4">
                                      {q.type === 'single' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                           <div className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border-2 shadow-sm border-slate-100">
                                              <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Jawaban Siswa:</p>
                                              <div className={`flex items-center gap-2 sm:gap-3 ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                 <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-[9px] sm:text-[10px] uppercase border">{ans || '?'}</span>
                                                 <span className="text-[10px] sm:text-[12px] font-bold" dangerouslySetInnerHTML={{ __html: q.options?.find(o => String(o.id).toLowerCase() === String(ans).toLowerCase())?.text || '<span class="italic opacity-50">Kosong</span>' }} />
                                              </div>
                                           </div>
                                           <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl sm:rounded-2xl border-2 border-emerald-100 shadow-sm">
                                              <p className="text-[7px] sm:text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 sm:mb-2">Kunci Jawaban:</p>
                                              <div className="flex items-center gap-2 sm:gap-3 text-emerald-800">
                                                 <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[9px] sm:text-[10px] uppercase">{q.correctOptionId}</span>
                                                 <span className="text-[10px] sm:text-[12px] font-bold" dangerouslySetInnerHTML={{ __html: q.options?.find(o => String(o.id).toLowerCase() === String(q.correctOptionId).toLowerCase())?.text || '-' }} />
                                              </div>
                                           </div>
                                        </div>
                                      ) : q.type === 'multiple' ? (
                                        <div className="space-y-2 sm:space-y-3">
                                           <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Detail Ganda Kompleks:</p>
                                           <div className="grid grid-cols-1 gap-2">
                                              {q.options?.map(opt => {
                                                const sSelected = ensureArray(ans).includes(opt.id);
                                                const isKunci = ensureArray(q.correctOptionIds).includes(opt.id);
                                                return (
                                                  <div key={opt.id} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 flex items-center justify-between ${sSelected && isKunci ? 'bg-emerald-50 border-emerald-200' : sSelected && !isKunci ? 'bg-rose-50 border-rose-200' : !sSelected && isKunci ? 'bg-amber-50 border-amber-100 border-dashed' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                                     <div className="flex items-center gap-2 sm:gap-3">
                                                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white flex items-center justify-center font-black text-[9px] sm:text-[10px] border">{opt.id.toUpperCase()}</span>
                                                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-700" dangerouslySetInnerHTML={{ __html: opt.text }} />
                                                     </div>
                                                     <div className="flex gap-1.5 sm:gap-2">
                                                        {sSelected && <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[7px] sm:text-[8px] font-black ${isKunci ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>PILIHAN</span>}
                                                        {isKunci && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-blue-900 text-white text-[7px] sm:text-[8px] font-black">KUNCI</span>}
                                                     </div>
                                                  </div>
                                                );
                                              })}
                                           </div>
                                        </div>
                                      ) : q.type === 'table' ? (
                                        <div className="overflow-x-auto rounded-xl sm:rounded-3xl border-2 border-slate-100 shadow-sm">
                                           <table className="w-full text-left bg-white min-w-[400px] sm:min-w-0">
                                              <thead className="bg-slate-50 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">
                                                 <tr>
                                                    <th className="p-3 sm:p-4">Pernyataan</th>
                                                    <th className="p-3 sm:p-4 text-center">Siswa</th>
                                                    <th className="p-3 sm:p-4 text-center">Kunci</th>
                                                 </tr>
                                              </thead>
                                              <tbody className="divide-y text-[10px] sm:text-[11px]">
                                                 {q.statements?.map(st => {
                                                   const sAns = String(ensureObject(ans)[st.id] || '').trim().toUpperCase();
                                                   const kAns = String(st.correctAnswer || '').trim().toUpperCase();
                                                   const rowCorrect = sAns === kAns && sAns !== '';
                                                   return (
                                                     <tr key={st.id}>
                                                        <td className="p-3 sm:p-4 font-bold text-slate-600">
                                                           <MathJax dynamic><div dangerouslySetInnerHTML={{ __html: st.text }} /></MathJax>
                                                        </td>
                                                        <td className="p-3 sm:p-4 text-center">
                                                           <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg font-black ${rowCorrect ? 'bg-emerald-100 text-emerald-700' : sAns ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'}`}>
                                                              {sAns || '-'}
                                                           </span>
                                                        </td>
                                                        <td className="p-3 sm:p-4 text-center font-black text-blue-900">{kAns}</td>
                                                     </tr>
                                                   );
                                                 })}
                                              </tbody>
                                           </table>
                                        </div>
                                      ) : null}
                                   </div>

                                   <div className="flex gap-3 sm:gap-4 items-center">
                                      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase italic">Skor: {scoreData.earned} / {scoreData.max}</span>
                                      {isAnswered && (isCorrect ? <span className="bg-emerald-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[9px] font-black">BENAR ✓</span> : <span className="bg-rose-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[9px] font-black">SALAH ✗</span>)}
                                      {!isAnswered && <span className="bg-slate-200 text-slate-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[9px] font-black">KOSONG</span>}
                                   </div>
                                </div>
                             </div>
                          </div>
                       );
                    })}
                  </div>
                </MathJax>
             </div>
          </div>
          <div className="pt-4 sm:pt-8 border-t shrink-0">
             <button onClick={onClose} className="w-full py-4 sm:py-6 bg-blue-900 text-white rounded-xl sm:rounded-[2.5rem] font-black uppercase text-[10px] sm:text-[12px] shadow-2xl border-b-4 sm:border-b-8 border-blue-950 tracking-[0.2em] sm:tracking-[0.3em] active:scale-95 transition-all">TUTUP AUDIT 🚀</button>
          </div>
       </div>
    </div>
  );
};

export default StudentAuditModal;
