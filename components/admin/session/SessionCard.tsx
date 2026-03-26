import React from 'react';
import { QuestionGroup, Question } from '../../../types';
import { ensureArray } from '../../../utils';

interface SessionCardProps {
  g: QuestionGroup;
  questions: Question[];
  onToggleStatus: (id: number) => void;
  onEdit: (g: QuestionGroup) => void;
  onDelete: (id: number) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  g, questions, onToggleStatus, onEdit, onDelete
}) => {
  const isLive = !!g.last_started_at;
  const qCount = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(g.id))).length;
  const targets = ensureArray(g.target_classes);
  const mainDur = Number(g.duration_minutes) || 0;

  return (
    <div className={`p-6 rounded-[2.5rem] border-2 transition-all bg-white flex flex-col justify-between group overflow-hidden ${isLive ? 'border-emerald-500 shadow-xl scale-[1.01]' : 'border-slate-100 shadow-sm opacity-90'}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border ${isLive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
            {isLive ? 'AKTIF' : 'OFF'}
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

           <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 p-2.5 rounded-xl text-center border">
                <p className="text-[7px] font-black text-slate-400 uppercase">Durasi</p>
                <p className="text-[9px] font-black text-slate-800">
                   {mainDur} Mnt
                </p>
              </div>
              <div className="flex-1 bg-slate-50 p-2.5 rounded-xl text-center border">
                <p className="text-[7px] font-black text-slate-400 uppercase">Butir</p>
                <p className="text-[9px] font-black text-slate-800">{qCount} Q</p>
              </div>
           </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-slate-50 space-y-2">
         <button 
           onClick={() => onToggleStatus(Number(g.id))} 
           className={`w-full py-3 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 border-b-4 transition-all ${isLive ? 'bg-red-500 text-white border-red-800 hover:bg-red-600' : 'bg-blue-900 text-white border-blue-950 hover:bg-blue-800'}`}
         >
           {isLive ? 'STOP SESI 🛑' : 'AKTIFKAN 🚀'}
         </button>
         <div className="flex gap-2">
            <button onClick={() => onEdit(g)} className="flex-1 py-2 bg-slate-100 text-slate-400 rounded-lg font-black text-[8px] uppercase hover:bg-slate-200">Edit</button>
            <button onClick={() => onDelete(Number(g.id))} className="flex-1 py-2 bg-slate-50 text-slate-300 rounded-lg font-black text-[8px] uppercase hover:text-red-500 transition-colors">Hapus</button>
         </div>
      </div>
    </div>
  );
};

export default SessionCard;
