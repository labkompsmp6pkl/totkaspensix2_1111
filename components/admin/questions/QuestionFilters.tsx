
import React from 'react';

interface QuestionFiltersProps {
  filterSubject: string;
  setFilterSubject: (val: string) => void;
  sortType: 'ID' | 'ORDER';
  setSortType: (val: 'ID' | 'ORDER') => void;
  subjects: string[];
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filterSubject,
  setFilterSubject,
  sortType,
  setSortType,
  subjects
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border shadow-sm flex flex-col md:flex-row items-center gap-4">
       <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
          <select 
            className="p-3 sm:p-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-[9px] uppercase text-blue-900 outline-none" 
            value={filterSubject} 
            onChange={e => setFilterSubject(e.target.value)}
          >
             <option value="ALL">SEMUA MAPEL</option>
             {subjects.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <select 
            className="p-3 sm:p-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-[9px] uppercase text-blue-900 outline-none" 
            value={sortType} 
            onChange={e => setSortType(e.target.value as any)}
          >
             <option value="ID">ID TERBARU</option>
             <option value="ORDER">URUT NOMOR</option>
          </select>
       </div>
    </div>
  );
};

export default QuestionFilters;
