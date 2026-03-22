
import React from 'react';

interface SessionFiltersProps {
  examCode: string;
  localExamCode: string;
  setLocalExamCode: (val: string) => void;
  isUpdatingConfig: boolean;
  onUpdateConfig: () => void;
}

const SessionFilters: React.FC<SessionFiltersProps> = ({
  examCode,
  localExamCode,
  setLocalExamCode,
  isUpdatingConfig,
  onUpdateConfig
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-[1.5rem] border shadow-sm">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Master Token Akses</p>
         <div className="flex flex-col sm:flex-row items-center gap-3">
            <input 
              className="flex-1 w-full p-3 bg-slate-50 border rounded-xl font-black text-lg text-blue-900 uppercase tracking-[0.3em] outline-none text-center sm:text-left" 
              value={localExamCode} 
              onChange={e => setLocalExamCode(e.target.value.toUpperCase())} 
            />
            <button 
              disabled={isUpdatingConfig} 
              onClick={onUpdateConfig} 
              className="px-6 py-3 bg-blue-900 text-white rounded-xl font-black uppercase text-[9px] shadow-lg active:scale-95 transition-all"
            >
              Update
            </button>
         </div>
      </div>
      <div className="flex justify-between items-center px-2">
         <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Siklus Sesi Aktif</h3>
      </div>
    </div>
  );
};

export default SessionFilters;
