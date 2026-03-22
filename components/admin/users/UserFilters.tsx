import React from 'react';

interface UserFiltersProps {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  sortedYears: string[];
  yearStats: Record<string, number>;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  sortedClasses: string[];
  classStats: Record<string, number>;
  filterPresence: 'ALL' | 'HADIR' | 'BELUM_HADIR';
  setFilterPresence: (p: 'ALL' | 'HADIR' | 'BELUM_HADIR') => void;
  presenceStats: { ALL: number; HADIR: number; BELUM_HADIR: number };
}

const UserFilters: React.FC<UserFiltersProps> = ({
  selectedYear, setSelectedYear, sortedYears, yearStats,
  selectedClass, setSelectedClass, sortedClasses, classStats,
  filterPresence, setFilterPresence, presenceStats
}) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col gap-4">
       <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-4 shrink-0">Tahun Ajaran:</span>
          {sortedYears.map(year => (
             <button key={year} onClick={() => setSelectedYear(year)} className={`flex-shrink-0 px-5 py-2.5 rounded-full font-black text-[10px] uppercase transition-all border-2 ${selectedYear === year ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-50 hover:border-emerald-200'}`}>
                {year === "ALL" ? "SEMUA TAHUN" : year} <span className="ml-1 opacity-50">{yearStats[year]}</span>
             </button>
          ))}
       </div>
       <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-50">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-4 shrink-0">Filter Kelas:</span>
          {sortedClasses.map(cls => (
             <button key={cls} onClick={() => setSelectedClass(cls)} className={`flex-shrink-0 px-5 py-2.5 rounded-full font-black text-[10px] uppercase transition-all border-2 ${selectedClass === cls ? 'bg-blue-900 text-white border-blue-950 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-50 hover:border-blue-200'}`}>
                {cls === "ALL" ? "SEMUA" : cls} <span className="ml-1 opacity-50">{classStats[cls]}</span>
             </button>
          ))}
       </div>
       <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
          <button onClick={() => setFilterPresence('ALL')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${filterPresence === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white text-slate-300'}`}>Semua ({presenceStats.ALL})</button>
          <button onClick={() => setFilterPresence('HADIR')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${filterPresence === 'HADIR' ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-white text-slate-300'}`}>✓ Sudah Hadir ({presenceStats.HADIR})</button>
          <button onClick={() => setFilterPresence('BELUM_HADIR')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${filterPresence === 'BELUM_HADIR' ? 'bg-red-500 text-white border-red-600 shadow-md' : 'bg-white text-slate-300'}`}>✗ Belum Ada Jejak ({presenceStats.BELUM_HADIR})</button>
       </div>
    </div>
  );
};

export default UserFilters;
