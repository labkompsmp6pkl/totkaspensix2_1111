
import React from 'react';
import { MathJax } from 'better-react-mathjax';
import MediaRenderer from '../../exam/MediaRenderer';
import { ensureArray } from '../../../utils';

const QuestionPreview = ({ question, onClose }: any) => {
  if (!question) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[4500] flex items-center justify-center p-4 pointer-events-auto">
       <div className="bg-white w-full max-w-2xl rounded-[3rem] p-8 sm:p-10 shadow-2xl space-y-8 animate-in zoom-in-95 border-8 border-slate-50 flex flex-col max-h-[90vh] relative">
          <div className="flex justify-between items-center border-b pb-4">
             <div>
                <h3 className="text-xl font-black text-blue-900 uppercase italic leading-none">Pratinjau Butir Soal</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">ID Soal: #{question.id}</p>
             </div>
             <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-300 hover:text-red-500 font-black text-xl">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
             <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <MathJax dynamic><div className="text-sm sm:text-lg font-semibold text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.text || '' }} /></MathJax>
                <MediaRenderer url={question.mediaUrl} />
             </div>
             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Opsi Jawaban:</p>
                {question.type === 'table' ? (
                   <div className="overflow-x-auto border rounded-2xl">
                      <table className="w-full text-left">
                         <thead className="bg-slate-50 text-[10px] font-black text-slate-400 border-b">
                            <tr>
                               <th className="p-4">Pernyataan</th>
                               <th className="p-4 text-center">Kunci</th>
                               {question.scoring_mode === 'partial' && <th className="p-4 text-center">Poin</th>}
                            </tr>
                         </thead>
                         <tbody className="divide-y text-xs">
                            {question.statements?.map((s:any, idx:number) => (
                               <tr key={idx}>
                                  <td className="p-4 font-semibold text-slate-600">{s.text}</td>
                                  <td className="p-4 text-center"><span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-black uppercase text-[8px]">{s.correctAnswer}</span></td>
                                  {question.scoring_mode === 'partial' && <td className="p-4 text-center font-black text-blue-900">{s.points}</td>}
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 gap-3">
                      {question.options?.map((opt:any) => {
                         const isCorrect = question.type === 'single' ? question.correctOptionId === opt.id : ensureArray(question.correctOptionIds).includes(opt.id);
                         return (
                           <div key={opt.id} className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{opt.id.toUpperCase()}</div>
                                 <MathJax dynamic><div className={`text-sm font-semibold ${isCorrect ? 'text-emerald-700' : 'text-slate-600'}`} dangerouslySetInnerHTML={{ __html: opt.text }} /></MathJax>
                              </div>
                              <div className="flex items-center gap-3">
                                 {question.scoring_mode === 'partial' && <span className="text-[9px] font-black text-slate-300 italic uppercase">{opt.points} Poin</span>}
                                 {isCorrect && <span className="text-emerald-400">✓</span>}
                              </div>
                           </div>
                         );
                      })}
                   </div>
                )}
             </div>
          </div>
          <button onClick={onClose} className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl border-b-8 border-blue-950 active:scale-95 transition-all">TUTUP PRATINJAU</button>
       </div>
    </div>
  );
};

export default QuestionPreview;
