import React from 'react';
import { QuestionGroup, Question } from '../../../types';
import { ensureArray } from '../../../utils';

interface SessionCardProps {
  g: QuestionGroup;
  questions: Question[];
  isLive: boolean;
  timeData: { text: string; isExpired: boolean; start: string | null; end: string | null };
  teachers: any[];
  isUpdatingConfig: boolean;
  onToggle: (gid: number, currentStatus: boolean) => void;
  onEdit: (g: QuestionGroup) => void;
  onDelete: (id: number) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  g, questions, isLive, timeData, teachers, isUpdatingConfig, onToggle, onEdit, onDelete
}) => {
  const qCount = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(g.id))).length;
  const targets = ensureArray(g.target_classes);
  const mainDur = Number(g.duration_minutes) || 0;
  const extraDur = Number(g.extra_time_minutes) || 0;

  return (
    <div className={`p-6 rounded-[2.5rem] border-2 transition-all bg-white flex flex-col justify-between group overflow-hidden ${isLive ? 'border-emerald-500 shadow-xl scale-[1.01]' : 'border-slate-100 shadow-sm opacity-90'}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border ${isLive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : (timeData.isExpired ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-300 border-slate-100')}`}>
            {isLive ? 'AKTIF' : (timeData.isExpired ? 'HABIS' : 'OFF')}
          </span>
          <p className="text-[10px] font-black text-blue-900 italic tracking-tighter uppercase">{g.group_code}</p>
        </div>

        <div className="space-y-4">
           <div>
              <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight italic leading-tight truncate">{g.group_name}</h4>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase">Target: <span className="text-blue-600 font-black">{targets.join(', ') || 'SEMUA KELAS'}</span></p>
              </div>
           </div>

           {(g.last_started_at) && (
             <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 border rounded-2xl flex flex-col items-center justify-center">
                   <span className="text-[7px] font-black text-slate-400 uppercase">JADWAL SESI</span>
                   <span className="text-[9px] font-black text-slate-800 font-mono tracking-tight">{timeData.start} — {timeData.end}</span>
                </div>
                <div className={`p-3 rounded-2xl flex flex-col items-center justify-center shadow-md ${timeData.isExpired ? 'bg-red-600' : 'bg-blue-900'}`}>
                   <span className={`text-[7px] font-black uppercase ${timeData.isExpired ? 'text-red-100' : 'text-blue-300'}`}>SISA WAKTU</span>
                   <span className="text-xs font-black font-mono tracking-tighter text-white">{timeData.text}</span>
                </div>
             </div>
           )}

           <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 p-2.5 rounded-xl text-center border">
                <p className="text-[7px] font-black text-slate-400 uppercase">Durasi</p>
                <p className="text-[9px] font-black text-slate-800">
                   {mainDur}{extraDur > 0 ? <span className="text-blue-600">+{extraDur}</span> : ''} Mnt
                </p>
              </div>
              <div className={`flex-1 p-2.5 rounded-xl text-center border ${Number(g.is_shuffled) === 1 ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[7px] font-black text-slate-400 uppercase">Soal</p>
                <p className="text-[9px] font-black text-slate-800 uppercase">{Number(g.is_shuffled) === 1 ? '🔀 ACAK' : '🔢 URUT'}</p>
              </div>
              <div className="flex-1 bg-slate-50 p-2.5 rounded-xl text-center border">
                <p className="text-[7px] font-black text-slate-400 uppercase">Butir</p>
                <p className="text-[9px] font-black text-slate-800">{qCount} Q</p>
              </div>
           </div>

           <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-50/50 space-y-2">
              <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">PENGAWAS ({teachers.length})</span>
              <div className="space-y-2">
                {teachers.length > 0 ? teachers.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start border-b border-emerald-100/30 pb-1.5 last:border-0">
                     <span className="text-[9px] font-black text-slate-700 uppercase truncate max-w-[120px]">{t.name}</span>
                     <div className="flex flex-wrap gap-1 justify-end max-w-[100px]">
                        {ensureArray(t.classes).length > 0 ? t.classes.map((c: string) => (
                          <span key={c} className="text-[7px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded leading-none">{c}</span>
                        )) : <span className="text-[7px] font-bold text-slate-300 italic uppercase">Semua</span>}
                     </div>
                  </div>
                )) : <p className="text-[8px] font-bold text-slate-300 uppercase italic">Belum Ada Pengawas</p>}
              </div>
           </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-slate-50 space-y-2">
         {g.last_started_at !== null ? (
           <div className="flex flex-col gap-2">
             <button 
               disabled={isUpdatingConfig} 
               onClick={() => onToggle(g.id, true)} 
               className="w-full py-3 bg-red-500 text-white border-red-800 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 border-b-4 disabled:grayscale disabled:opacity-50"
             >
               STOP SESI 🛑
             </button>
             {timeData.isExpired && (
               <button 
                 disabled={isUpdatingConfig} 
                 onClick={() => onToggle(g.id, false)} 
                 className="w-full py-3 bg-emerald-500 text-white border-emerald-800 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 border-b-4 disabled:grayscale disabled:opacity-50"
               >
                 RESTART SESI 🔄
               </button>
             )}
           </div>
         ) : (
           <button 
             disabled={isUpdatingConfig} 
             onClick={() => onToggle(g.id, false)} 
             className="w-full py-3 bg-blue-900 text-white border-blue-950 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 border-b-4 disabled:grayscale disabled:opacity-50"
           >
             AKTIFKAN 🚀
           </button>
         )}
         <div className="flex gap-2">
            <button onClick={() => onEdit(g)} className="flex-1 py-2 bg-slate-100 text-slate-400 rounded-lg font-black text-[8px] uppercase hover:bg-slate-200">Edit</button>
            <button onClick={() => onDelete(g.id)} className="flex-1 py-2 bg-slate-50 text-slate-300 rounded-lg font-black text-[8px] uppercase hover:text-red-500 transition-colors">Hapus</button>
         </div>
      </div>
    </div>
  );
};

export default SessionCard;
