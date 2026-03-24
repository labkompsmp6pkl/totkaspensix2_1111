import React from 'react';
import { QuestionGroup, User } from '../../../types';
import { ensureArray } from '../../../utils';

interface SessionEditorProps {
  form: Partial<QuestionGroup>;
  setForm: React.Dispatch<React.SetStateAction<Partial<QuestionGroup>>>;
  classOptions: string[];
  teacherList: User[];
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
  cleanupTeacherAssignments: (currentSelectedClasses: string[]) => any[];
  getTeacherAssignment: (teacherId: string) => { id: string; classes: string[] } | null;
  toggleTeacherSelection: (teacherId: string) => void;
  toggleTeacherClass: (teacherId: string, className: string) => void;
}

const SessionEditor: React.FC<SessionEditorProps> = ({
  form, setForm, classOptions, teacherList, isSaving, onSave, onClose,
  cleanupTeacherAssignments, getTeacherAssignment, toggleTeacherSelection, toggleTeacherClass
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[3500] flex items-center justify-center p-4 pointer-events-auto">
       <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[92vh] space-y-8 animate-in zoom-in-95 border-4 border-white relative">
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-black uppercase text-blue-900 italic tracking-tighter">Konfigurasi Sesi Ujian</h3>
             <button onClick={onClose} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center font-black text-slate-300 hover:text-red-500 transition-colors">✕</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Nama Sesi</label>
                <input className="w-full p-3.5 bg-slate-50 border-2 rounded-xl font-bold text-xs outline-none focus:border-blue-900" value={form.group_name} onChange={e => setForm({...form, group_name: e.target.value})} placeholder="Contoh: Try Out 2 Matematika" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-blue-900 uppercase tracking-widest ml-2">Token Masuk</label>
                <input className="w-full p-4 bg-blue-50/30 border-2 border-blue-100 rounded-xl font-black uppercase text-center text-xl tracking-[0.2em] text-blue-900 outline-none" value={form.group_code} onChange={e => setForm({...form, group_code: e.target.value.toUpperCase()})} />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest ml-2">Pilih Target Kelas</label>
                <div className="grid grid-cols-5 gap-1.5 p-4 bg-slate-50 rounded-2xl border shadow-inner">
                   {classOptions.map(cls => {
                     const isSelected = ensureArray(form.target_classes).some(c => c.toUpperCase() === cls.toUpperCase());
                     return (
                       <button key={cls} onClick={() => { 
                           const cur = ensureArray(form.target_classes).map(c => c.toUpperCase()); 
                           const next = isSelected ? cur.filter(c => c !== cls.toUpperCase()) : Array.from(new Set([...cur, cls.toUpperCase()]));
                           setForm({
                               ...form, 
                               target_classes: next,
                               teacher_ids: cleanupTeacherAssignments(next)
                           }); 
                       }} className={`py-2 rounded-lg text-[9px] font-black border-2 transition-all active:scale-90 ${isSelected ? 'bg-blue-900 text-white border-blue-900 shadow-md' : 'bg-white text-slate-300 border-slate-100'}`}>{cls}</button>
                     );
                   })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Durasi Utama (Mnt)</label>
                  <input type="number" className="w-full p-3.5 bg-slate-50 border-2 rounded-xl font-black text-center text-sm shadow-inner" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-blue-600 uppercase ml-2">Tambahan (Mnt)</label>
                  <input type="number" className="w-full p-3.5 bg-blue-50 border-2 border-blue-100 rounded-xl font-black text-center text-sm shadow-inner text-blue-900" value={form.extra_time_minutes} onChange={e => setForm({...form, extra_time_minutes: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Metode Soal</label><select className="w-full p-3.5 bg-slate-50 border-2 rounded-xl font-black text-[9px] uppercase h-[50px] outline-none shadow-inner" value={form.is_shuffled} onChange={e => setForm({...form, is_shuffled: parseInt(e.target.value)})}><option value={1}>🔀 ACAK SOAL</option><option value={0}>🔢 URUT MANUAL</option></select></div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-2 leading-none">GURU PENGAWAS</label>
                <div className="flex flex-col gap-2 p-4 bg-emerald-50/20 rounded-[1.5rem] border-2 border-emerald-50 max-h-[250px] overflow-y-auto custom-scrollbar shadow-inner">
                   {teacherList.map(teacher => {
                     const tid = String(teacher.id);
                     const assignment = getTeacherAssignment(tid);
                     const isAssigned = assignment !== null;
                     const sessionClasses = ensureArray(form.target_classes);

                     return (
                       <div key={teacher.id} className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-3 ${isAssigned ? 'bg-emerald-600 border-emerald-700 shadow-md' : 'bg-white border-slate-50 hover:border-emerald-200'}`}>
                          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleTeacherSelection(tid)}>
                             <div className="text-left">
                               <p className={`text-[11px] font-black uppercase leading-tight ${isAssigned ? 'text-white' : 'text-slate-800'}`}>{teacher.name}</p>
                             </div>
                             <div className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${isAssigned ? 'bg-white text-emerald-600 border-white' : 'bg-slate-50 border-slate-100'}`}>
                                {isAssigned && <span className="font-black text-xs">✓</span>}
                             </div>
                          </div>
                          {isAssigned && sessionClasses.length > 0 && (
                            <div className="pt-2 border-t border-emerald-500/50">
                               <p className="text-[7px] font-black text-emerald-100 uppercase mb-1.5 tracking-tighter">Kelas Pantauan:</p>
                               <div className="flex flex-wrap gap-1">
                                  {Array.from(new Set(sessionClasses.map(c => c.toUpperCase()))).map(cls => {
                                    const isClassAssigned = assignment.classes.some((c: string) => c.toUpperCase() === cls);
                                    return (
                                      <button key={cls} onClick={() => toggleTeacherClass(tid, cls)} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border transition-all ${isClassAssigned ? 'bg-white text-emerald-600 border-white' : 'bg-emerald-700/30 text-emerald-100 border-emerald-500/30'}`}>{cls}</button>
                                    );
                                  })}
                               </div>
                            </div>
                          )}
                       </div>
                     );
                   })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t-2 border-slate-50">
             <button onClick={onClose} className="flex-1 py-4 bg-slate-100 rounded-xl font-black text-slate-400 uppercase text-[9px] hover:bg-slate-200 transition-all">BATAL</button>
             <button disabled={isSaving} onClick={onSave} className="flex-[2] py-4 bg-blue-900 text-white rounded-xl font-black uppercase text-[10px] shadow-xl border-b-4 border-blue-950 active:scale-95 transition-all">
                {isSaving ? '⏳ MENYIMPAN...' : 'SIMPAN KONFIGURASI 🚀'}
             </button>
          </div>
       </div>
    </div>
  );
};

export default SessionEditor;
