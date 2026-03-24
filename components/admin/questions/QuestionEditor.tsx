import React from 'react';
import { MathJax } from 'better-react-mathjax';
import { Question, QuestionType, ScoringMode, QuestionGroup } from '../../../types';
import { ensureArray } from '../../../utils';

interface QuestionEditorProps {
  form: Partial<Question>;
  setForm: React.Dispatch<React.SetStateAction<Partial<Question>>>;
  groups: QuestionGroup[];
  subjects: string[];
  autoCalculatedPoints: number;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
  handleModeChange: (mode: ScoringMode) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  form, setForm, groups, subjects, autoCalculatedPoints, isSaving, onSave, onClose, handleModeChange
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[99999] flex items-center justify-center p-2 sm:p-6 overflow-hidden pointer-events-auto">
       <div className="bg-white w-full max-w-6xl rounded-[3rem] sm:rounded-[4rem] p-6 sm:p-12 shadow-2xl overflow-y-auto max-h-[95vh] space-y-8 animate-in zoom-in-95 border-8 border-white relative z-[100000]">
          
          <button 
            onClick={() => { console.log("Batal Silang"); onClose(); }} 
            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 font-black text-2xl transition-all cursor-pointer z-[200]"
          >
            ✕
          </button>

          <div className="flex flex-col gap-6 border-b pb-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h3 className="text-2xl font-black uppercase text-blue-900 italic tracking-tighter leading-none">Editor Butir Soal</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Konfigurasi materi dan logika penilaian digital</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-1.5 w-full md:w-auto shadow-inner border border-slate-200 relative z-50">
                   <button 
                     onClick={() => handleModeChange('all_or_nothing')} 
                     className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${form.scoring_mode === 'all_or_nothing' ? 'bg-blue-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-200'}`}
                   >
                     Full atau Nol
                   </button>
                   <button 
                     onClick={() => handleModeChange('partial')} 
                     className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${form.scoring_mode === 'partial' ? 'bg-blue-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-200'}`}
                   >
                     Poin Per Opsi
                   </button>
                </div>
             </div>

             {/* PERBAIKAN FATAL: Menambahkan relative z-50 agar kotak atas ini TIDAK tertimpa oleh MathJax Preview yang ada di baris bawahnya */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-50">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Mata Pelajaran</label>
                   <select 
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] text-blue-900 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500" 
                     value={form.subject || ''} 
                     onChange={e => setForm({...form, subject: e.target.value})}
                   >
                     {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipe Soal</label>
                   <select 
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] text-blue-900 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500" 
                     value={form.type || 'single'} 
                     onChange={e => setForm({...form, type: e.target.value as QuestionType})}
                   >
                     <option value="single">Pilihan Ganda</option>
                     <option value="multiple">Ganda Kompleks</option>
                     <option value="table">Tabel/Matriks</option>
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-blue-900 uppercase tracking-widest ml-2 italic">Akumulasi Skor</label>
                   <div className="relative">
                      {form.scoring_mode === 'all_or_nothing' ? (
                        <input 
                          type="number" 
                          className="w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl font-black text-blue-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text" 
                          value={form.points || 0} 
                          onChange={e => setForm({...form, points: parseInt(e.target.value) || 0})} 
                        />
                      ) : (
                        <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-slate-500 text-center cursor-not-allowed">{autoCalculatedPoints}</div>
                      )}
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-900/30 pointer-events-none">PT</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Nomor Urut</label>
                   <input 
                     type="number" 
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-center focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text" 
                     value={form.sort_order || 0} 
                     onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})} 
                   />
                </div>
             </div>

             <div className="space-y-2 relative z-50">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Distribusi Ke Grup Sesi</label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                  {groups.map(g => {
                    const isSelected = ensureArray(form.group_ids).map(Number).includes(Number(g.id));
                    return (
                      <button 
                        key={g.id} 
                        type="button"
                        onClick={() => {
                          const cur = ensureArray(form.group_ids).map(Number);
                          const next = isSelected ? cur.filter(id => id !== Number(g.id)) : [...cur, Number(g.id)];
                          setForm({...form, group_ids: next});
                        }}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 ${isSelected ? 'bg-blue-900 text-white border-blue-950 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-500'}`}
                      >
                        {g.group_name}
                      </button>
                    );
                  })}
                  {groups.length === 0 && <p className="text-[10px] font-bold text-slate-400 italic">Belum ada grup sesi yang tersedia.</p>}
                </div>
             </div>
          </div>

          {/* PERBAIKAN: z-10 diberikan agar kotak ini tidak menutupi komponen atasnya */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
             <textarea 
                className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] min-h-[160px] outline-none text-[12px] font-semibold focus:bg-white focus:border-blue-500 transition-all shadow-inner cursor-text relative z-20" 
                value={form.text || ''} 
                onChange={e => setForm({...form, text: e.target.value})} 
                placeholder="Narasi/Teks Soal..." 
             />
             <div className="space-y-4">
                {/* PERBAIKAN: Mengisolasi render MathJax dengan overflow-hidden dan z-0 agar tidak membengkak keluar */}
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border-4 border-dashed border-slate-200 min-h-[120px] overflow-hidden relative z-0 pointer-events-none">
                   <MathJax dynamic><div className="text-sm font-medium text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: (form.text || '').trim() || '<span class="text-slate-300">Preview teks soal...</span>' }} /></MathJax>
                </div>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs cursor-text focus:outline-none focus:border-blue-500 relative z-20" 
                  value={form.mediaUrl || ''} 
                  onChange={e => setForm({...form, mediaUrl: e.target.value})} 
                  placeholder="URL Gambar Pendukung (Opsional)" 
                />
             </div>
          </div>

          <div className="bg-slate-50/50 p-6 sm:p-10 rounded-[4rem] border-2 border-slate-100 space-y-8 shadow-inner relative z-10">
             <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 pb-4 gap-4">
               <h4 className="text-[11px] font-black uppercase text-blue-900 tracking-[0.3em] italic">Opsi Jawaban & Poin</h4>
               {form.type === 'table' && (
                 <div className="flex gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                   <span className="text-[8px] font-black text-slate-400 uppercase self-center px-2">Edit Header Kolom:</span>
                   <input className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black text-center uppercase focus:outline-none focus:border-blue-500 cursor-text" placeholder="KOLOM 1" value={form.tableOptions?.[0] || 'BENAR'} onChange={e => {
                     const next = [...(form.tableOptions || ['BENAR', 'SALAH'])];
                     next[0] = e.target.value.toUpperCase();
                     setForm({...form, tableOptions: next});
                   }} />
                   <input className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black text-center uppercase focus:outline-none focus:border-blue-500 cursor-text" placeholder="KOLOM 2" value={form.tableOptions?.[1] || 'SALAH'} onChange={e => {
                     const next = [...(form.tableOptions || ['BENAR', 'SALAH'])];
                     next[1] = e.target.value.toUpperCase();
                     setForm({...form, tableOptions: next});
                   }} />
                 </div>
               )}
             </div>

             {(form.type === 'single' || form.type === 'multiple') && (
               <div className="grid grid-cols-1 gap-6">
                 {ensureArray(form.options).map((opt, idx) => {
                   const isCorrect = form.type === 'single' ? form.correctOptionId === opt.id : ensureArray(form.correctOptionIds).includes(opt.id);
                   return (
                     <div key={opt.id} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all shadow-sm flex flex-col gap-6 relative z-20 ${isCorrect ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                           <div className="flex items-center gap-4 shrink-0">
                              <input 
                                type={form.type === 'single' ? 'radio' : 'checkbox'} 
                                name={`question-options-${form.id || 'new'}`}
                                className="w-6 h-6 accent-blue-900 cursor-pointer" 
                                checked={isCorrect} 
                                onChange={() => {
                                  if (form.type === 'single') setForm({...form, correctOptionId: opt.id});
                                  else {
                                    const cur = ensureArray(form.correctOptionIds);
                                    const next = cur.includes(opt.id) ? cur.filter(id => id !== opt.id) : [...cur, opt.id];
                                    setForm({...form, correctOptionIds: next});
                                  }
                              }} />
                              <span 
                                className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 ${isCorrect ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
                                onClick={() => {
                                  if (form.type === 'single') setForm({...form, correctOptionId: opt.id});
                                  else {
                                    const cur = ensureArray(form.correctOptionIds);
                                    const next = cur.includes(opt.id) ? cur.filter(id => id !== opt.id) : [...cur, opt.id];
                                    setForm({...form, correctOptionIds: next});
                                  }
                                }}
                              >
                                {opt.id.toUpperCase()}
                              </span>
                           </div>
                           <div className="flex-1 w-full space-y-3">
                              <textarea 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all min-h-[60px] cursor-text" 
                                value={opt.text} 
                                onChange={e => {
                                  const next = ensureArray(form.options).map((o, i) => i === idx ? { ...o, text: e.target.value } : o);
                                  setForm({...form, options: next});
                                }} 
                                placeholder={`Isi teks pilihan ${opt.id.toUpperCase()}...`} 
                              />
                              <div className="p-3 bg-white/50 border border-slate-100 rounded-xl overflow-hidden pointer-events-none">
                                 <MathJax dynamic><div className="text-[10px] font-bold text-slate-500" dangerouslySetInnerHTML={{ __html: (opt.text || '').trim() || '<span class="italic text-slate-300">Pratinjau jawaban...</span>' }} /></MathJax>
                              </div>
                           </div>
                           {form.scoring_mode === 'partial' && (
                              <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
                                <label className="text-[8px] font-black text-slate-400 uppercase mb-1">Poin</label>
                                <input 
                                  type="number" 
                                  className="w-20 p-4 bg-blue-900 text-white rounded-xl text-center font-black text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-text" 
                                  value={opt.points} 
                                  onChange={e => {
                                    const next = ensureArray(form.options).map((o, i) => i === idx ? { ...o, points: parseInt(e.target.value) || 0 } : o);
                                    setForm({...form, options: next});
                                  }} 
                                />
                              </div>
                           )}
                           <button 
                             onClick={() => { const next = ensureArray(form.options).filter((_, i) => i !== idx); setForm({...form, options: next}); }} 
                             className="p-3 bg-red-50 text-red-400 border border-red-100 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer"
                           >
                             ✕
                           </button>
                        </div>
                     </div>
                   );
                 })}
                 <button 
                   onClick={() => {
                     const current = ensureArray(form.options);
                     const usedIds = current.map(o => o.id);
                     let nextCharCode = 97; // 'a'
                     while (usedIds.includes(String.fromCharCode(nextCharCode))) { nextCharCode++; }
                     const nextId = String.fromCharCode(nextCharCode);
                     setForm({...form, options: [...current, { id: nextId, text: '', points: 0 }]});
                   }} 
                   className="w-full py-5 border-4 border-dashed border-slate-200 text-slate-400 font-black text-[11px] uppercase rounded-[2.5rem] hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer active:scale-[0.99]"
                 >
                   + TAMBAH OPSI JAWABAN
                 </button>
               </div>
             )}

             {form.type === 'table' && (
               <div className="space-y-6">
                  {ensureArray(form.statements).map((st, idx) => (
                    <div key={st.id || idx} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-4 relative z-20">
                       <div className="flex flex-col md:flex-row gap-6 items-start">
                          <div className="flex-1 w-full space-y-3">
                             <textarea 
                               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-semibold outline-none focus:border-blue-500 min-h-[60px] cursor-text" 
                               value={st.text} 
                               onChange={e => {
                                 const next = ensureArray(form.statements).map((s, i) => i === idx ? { ...s, text: e.target.value } : s);
                                 setForm({...form, statements: next});
                               }} 
                               placeholder="Teks pernyataan baris..." 
                             />
                             <div className="p-3 bg-white/50 border border-slate-100 rounded-xl overflow-hidden pointer-events-none">
                                <MathJax dynamic><div className="text-[10px] font-bold text-slate-500" dangerouslySetInnerHTML={{ __html: (st.text || '').trim() || '<span class="italic text-slate-300">Pratinjau pernyataan...</span>' }} /></MathJax>
                             </div>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0 w-full md:w-auto">
                             <label className="text-[8px] font-black text-slate-400 uppercase mb-1 text-center">Kunci Baris</label>
                             <div className="flex gap-1">
                               {ensureArray(form.tableOptions).map(to => (
                                 <button 
                                   key={to} 
                                   onClick={() => {
                                     const next = ensureArray(form.statements).map((s, i) => i === idx ? { ...s, correctAnswer: to } : s);
                                     setForm({...form, statements: next});
                                   }} 
                                   className={`flex-1 px-4 py-3 rounded-xl text-[9px] font-black uppercase border transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 ${st.correctAnswer === to ? 'bg-blue-900 text-white shadow-md border-blue-950' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-blue-600'}`}
                                 >
                                   {to}
                                 </button>
                               ))}
                             </div>
                          </div>
                          {form.scoring_mode === 'partial' && (
                            <div className="flex flex-col items-center">
                               <label className="text-[8px] font-black text-slate-400 uppercase mb-1">Poin</label>
                               <input 
                                 type="number" 
                                 className="w-20 p-4 bg-blue-900 text-white rounded-xl text-center font-black text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-text" 
                                 value={st.points} 
                                 onChange={e => {
                                   const next = ensureArray(form.statements).map((s, i) => i === idx ? { ...s, points: parseInt(e.target.value) || 0 } : s);
                                   setForm({...form, statements: next});
                                 }} 
                               />
                            </div>
                          )}
                          <button onClick={() => { const next = ensureArray(form.statements).filter((_, i) => i !== idx); setForm({...form, statements: next}); }} className="p-3 bg-red-50 text-red-400 border border-red-100 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer">✕</button>
                       </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setForm({...form, statements: [...ensureArray(form.statements), { id: Date.now().toString(), text: '', points: 5, correctAnswer: ensureArray(form.tableOptions)?.[0] || 'BENAR' }]})} 
                    className="w-full py-5 border-4 border-dashed border-slate-200 text-slate-400 font-black text-[11px] uppercase rounded-[2.5rem] hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    + TAMBAH BARIS PERNYATAAN
                  </button>
               </div>
             )}
          </div>

          <div className="flex gap-4 pt-10 border-t border-slate-100 relative z-50">
             <button onClick={() => { console.log("Batal"); onClose(); }} className="flex-1 py-6 bg-slate-100 border border-slate-200 rounded-[2rem] font-black uppercase text-[11px] text-slate-500 hover:bg-slate-200 transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95">BATAL</button>
             <button onClick={() => { console.log("Simpan"); onSave(); }} disabled={isSaving} className="flex-[2] py-6 bg-blue-900 text-white rounded-[2rem] font-black uppercase text-[12px] shadow-2xl border-b-8 border-blue-950 active:scale-95 transition-all tracking-[0.2em] cursor-pointer hover:bg-blue-800 disabled:opacity-50 hover:-translate-y-0.5">
               {isSaving ? '⏳ MENYIMPAN...' : 'SIMPAN KE BANK SOAL 🚀'}
             </button>
          </div>
       </div>
    </div>
  );
};

export default QuestionEditor;
