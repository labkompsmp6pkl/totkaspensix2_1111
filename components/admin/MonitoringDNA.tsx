
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { QuestionGroup, Question, User } from '../../types';
import { LogController } from '../../controllers/LogController';
import { ScoreController } from '../../controllers/ScoreController';
import Modal from '../Modal';
import { formatFullDateTime, ensureArray } from '../../utils';

interface UnifiedData {
  user_id: string | number;
  name: string;
  kelas: string;
  nis: string;
  status: 'ONGOING' | 'FINISHED';
  answered_count: number | null;
  reset_count: number | null;
  score: number | null;
  start_time: string | null;
  end_time: string | null;
  last_activity: string | null;
  answers_json: any | null;
}

interface MonitoringDNAProps {
  currentUser: User;
  scores: any[]; 
  groups: QuestionGroup[];
  questions: Question[];
  search: string;
  refreshData?: () => void;
}

const MonitoringDNA: React.FC<MonitoringDNAProps> = ({ currentUser, groups, questions, search, refreshData }) => {
  const [isResetting, setIsResetting] = useState<number | string | null>(null);
  const [unifiedList, setUnifiedList] = useState<UnifiedData[]>([]);
  const [activeTabGid, setActiveTabGid] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'NAME' | 'TIME'>('TIME');
  
  // State Filter Baru
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [progressFilter, setProgressFilter] = useState<'ALL' | '100' | 'INCOMPLETE'>('ALL');
  
  const [pendingReset, setPendingReset] = useState<{uid: string|number, gid: number, name: string} | null>(null);
  const [showMassResetModal, setShowMassResetModal] = useState(false);

  const fetchUnifiedData = useCallback(async () => {
    if (!activeTabGid) return;
    try {
      const response = await LogController.getActiveMonitoring({ group_id: activeTabGid });
      const data = response.data || response;
      
      if (data && (data.ongoing || data.finished)) {
        setUnifiedList([
          ...(data.ongoing || []),
          ...(data.finished || [])
        ]);
      }
    } catch (err) {
      console.error("Monitoring Fetch Error:", err);
    }
  }, [activeTabGid]);

  useEffect(() => {
    if (groups.length > 0 && activeTabGid === null) {
      setActiveTabGid(groups[0].id);
    }
  }, [groups, activeTabGid]);

  useEffect(() => {
    if (activeTabGid) {
      fetchUnifiedData();
      const interval = setInterval(fetchUnifiedData, 5000); 
      return () => clearInterval(interval);
    }
  }, [activeTabGid, fetchUnifiedData]);

  const confirmReset = async () => {
    if (!pendingReset) return;
    setIsResetting(pendingReset.uid);
    try {
      const response = await ScoreController.reset({ 
        user_id: pendingReset.uid, 
        group_id: pendingReset.gid, 
        performer_id: currentUser.id 
      });
      if (response.success) {
        fetchUnifiedData();
        if (refreshData) refreshData();
      }
    } finally {
      setIsResetting(null);
      setPendingReset(null);
    }
  };

  const confirmMassReset = async () => {
    if (!activeTabGid) return;
    setIsResetting('all');
    try {
      const response = await ScoreController.reset({ 
        user_id: 'all', 
        group_id: activeTabGid, 
        performer_id: currentUser.id 
      });
      if (response.success) {
        fetchUnifiedData();
        if (refreshData) refreshData();
      }
    } finally {
      setIsResetting(null);
      setShowMassResetModal(false);
    }
  };

  // Mendapatkan daftar kelas unik yang ada di list pengerjaan saat ini
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    unifiedList.forEach(item => {
      if (item.kelas) classes.add(item.kelas.toUpperCase());
    });
    return Array.from(classes).sort();
  }, [unifiedList]);

  const filteredAndSortedList = useMemo(() => {
    const totalQ = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(activeTabGid))).length || 1;

    let list = [...unifiedList].filter(item => {
      if (!item || !item.name) return false;
      
      // 1. Filter Search (Nama/NIS)
      const s = search.toLowerCase();
      const matchSearch = item.name.toLowerCase().includes(s) || 
                          (item.kelas && item.kelas.toLowerCase().includes(s)) ||
                          (item.nis && item.nis.toString().includes(s));
      
      // 2. Filter Kelas
      const matchClass = selectedClass === 'ALL' || (item.kelas && item.kelas.toUpperCase() === selectedClass);

      // 3. Filter Progres
      let answeredCount = 0;
      if (item.status === 'FINISHED') {
        try {
          const ans = typeof item.answers_json === 'string' ? JSON.parse(item.answers_json) : (item.answers_json || {});
          answeredCount = Object.keys(ans).length;
        } catch(e) { answeredCount = 0; }
      } else {
        answeredCount = item.answered_count || 0;
      }
      
      const is100Percent = answeredCount >= totalQ;
      const matchProgress = progressFilter === 'ALL' || 
                           (progressFilter === '100' && is100Percent) ||
                           (progressFilter === 'INCOMPLETE' && !is100Percent);

      return matchSearch && matchClass && matchProgress;
    });

    if (sortBy === 'NAME') {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      list.sort((a, b) => {
        const timeA = new Date(a.last_activity || a.start_time || 0).getTime();
        const timeB = new Date(b.last_activity || b.start_time || 0).getTime();
        return timeB - timeA;
      });
    }

    return list;
  }, [unifiedList, search, sortBy, selectedClass, progressFilter, activeTabGid, questions]);

  const activeGroupDetail = groups.find(g => Number(g.id) === Number(activeTabGid));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Session Navigation Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4 italic">Pilih Sesi Pantauan:</p>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
           {groups.map(g => (
             <button 
               key={g.id} 
               onClick={() => { setActiveTabGid(g.id); setUnifiedList([]); setSelectedClass('ALL'); }} 
               className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all shrink-0 border-2 active:scale-95 ${activeTabGid === g.id ? 'bg-blue-900 text-white border-blue-900 shadow-xl shadow-blue-100' : 'bg-slate-50 text-slate-400 border-slate-50 hover:border-blue-100 hover:text-blue-900'}`}
             >
               {g.group_name}
             </button>
           ))}
        </div>
      </div>

      {/* FILTER PANEL BARU */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row items-center gap-6">
           {/* Dropdown Kelas */}
           <div className="flex flex-col gap-1 w-full md:w-auto">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Filter Kelas:</label>
              <select 
                className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-blue-900 outline-none focus:border-blue-900 transition-all cursor-pointer min-w-[150px]"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="ALL">SEMUA KELAS ({availableClasses.length})</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>KELAS {cls}</option>
                ))}
              </select>
           </div>

           {/* Filter Progres */}
           <div className="flex flex-col gap-1 flex-1 w-full">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Filter Progres:</label>
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                 <button onClick={() => setProgressFilter('ALL')} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${progressFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>SEMUA</button>
                 <button onClick={() => setProgressFilter('100')} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${progressFilter === '100' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-emerald-600'}`}>SELESAI (100%)</button>
                 <button onClick={() => setProgressFilter('INCOMPLETE')} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${progressFilter === 'INCOMPLETE' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-amber-600'}`}>BELUM SELESAI</button>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex items-center justify-between">
           <div className="flex flex-col gap-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Urutan Tabel:</label>
              <div className="flex bg-slate-50 p-1 rounded-xl gap-1 border">
                <button onClick={() => setSortBy('TIME')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${sortBy === 'TIME' ? 'bg-blue-900 text-white' : 'text-slate-300'}`}>⏱️ TERKINI</button>
                <button onClick={() => setSortBy('NAME')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${sortBy === 'NAME' ? 'bg-blue-900 text-white' : 'text-slate-300'}`}>🔤 NAMA</button>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Menampilkan</p>
              <p className="text-2xl font-black text-blue-900 italic">{filteredAndSortedList.length}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase leading-none">PESERTA</p>
           </div>
        </div>
      </div>

      {/* Session Metadata & Mass Reset Action */}
      {activeGroupDetail && (
        <div className="flex flex-col md:flex-row gap-4 animate-in slide-in-from-top-4 duration-700">
           <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border shadow-sm text-center space-y-1 hover:border-blue-200 transition-colors">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Sesi</p>
                  <p className="text-[10px] font-black text-blue-900 uppercase">Live Aktif</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm text-center space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Metode Soal</p>
                  <p className="text-[10px] font-black text-indigo-600 uppercase">
                    {Number(activeGroupDetail.is_shuffled) === 1 ? '🔀 ACAK' : '🔢 URUT'}
                  </p>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm text-center space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Mata Ujian</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase truncate">
                    {activeGroupDetail.group_name}
                  </p>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm text-center space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Soal</p>
                  <p className="text-[10px] font-black text-slate-800 uppercase">
                    {questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(activeTabGid))).length} Butir
                  </p>
              </div>
           </div>
           
           <button 
              onClick={() => setShowMassResetModal(true)}
              className="bg-red-50 text-red-600 border-2 border-red-100 p-6 rounded-3xl font-black text-[10px] uppercase shadow-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 shrink-0 active:scale-95"
           >
              <span>🔴</span> RESET SELURUH PESERTA
           </button>
        </div>
      )}

      {/* Main Monitoring Table */}
      <div className="bg-white rounded-[3rem] border-4 border-slate-50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px] border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b-2">
              <tr>
                 <th className="p-8">Profil Peserta</th>
                 <th className="p-8 text-center">Status</th>
                 <th className="p-8">Audit Waktu (Real-Time)</th>
                 <th className="p-8 text-center">Progres Pengerjaan</th>
                 <th className="p-8 text-right">Reset Individu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedList.map((item, idx) => {
                const isFinished = item.status === 'FINISHED';
                const totalQ = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(activeTabGid))).length;
                
                let answeredCount = 0;
                try {
                  if (isFinished) {
                     const ans = typeof item.answers_json === 'string' ? JSON.parse(item.answers_json) : (item.answers_json || {});
                     answeredCount = Object.keys(ans).length;
                  } else {
                     answeredCount = item.answered_count || 0;
                  }
                } catch(e) { answeredCount = 0; }

                const progressPercent = Math.min(100, Math.round((answeredCount / (totalQ || 1)) * 100));
                const isFullProgress = progressPercent === 100;

                return (
                  <tr key={`${item.user_id}-${idx}`} className={`hover:bg-blue-50/20 group transition-all duration-300 ${isFullProgress ? 'bg-emerald-50/10' : ''}`}>
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-sm shadow-inner transition-transform group-hover:scale-110 ${isFullProgress ? 'bg-emerald-600 text-white shadow-emerald-200' : isFinished ? 'bg-slate-100 text-slate-400' : 'bg-blue-900 text-white shadow-lg'}`}>
                            {isFullProgress ? '✓' : item.name ? item.name.charAt(0) : '?'}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <p className="font-black text-sm uppercase text-slate-900 tracking-tight">{item.name || 'Siswa'}</p>
                               {isFullProgress && <span className="bg-emerald-100 text-emerald-700 text-[7px] font-black px-1.5 py-0.5 rounded uppercase border border-emerald-200">100% DONE</span>}
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">KLS {item.kelas || '-'} | NIS {item.nis || '-'}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase border shadow-sm transition-all inline-block ${isFinished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'}`}>
                        {isFinished ? '✓ SELESAI' : '⏳ AKTIF'}
                      </span>
                    </td>
                    <td className="p-8">
                       <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 min-w-[260px] shadow-inner">
                          <div className="flex flex-col">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Waktu Mulai Login:</span>
                             <span className="text-[10px] font-mono font-bold text-blue-900">{formatFullDateTime(item.start_time)}</span>
                          </div>
                          <div className="flex flex-col pt-1.5 border-t border-slate-200/50">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Jawab Terakhir:</span>
                             <span className="text-[10px] font-mono font-bold text-amber-600">{formatFullDateTime(item.last_activity)}</span>
                          </div>
                          {isFinished && (
                            <div className="flex flex-col pt-1.5 border-t border-emerald-200/50">
                               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Selesai (Klik Submit):</span>
                               <span className="text-[10px] font-mono font-bold text-emerald-700">{formatFullDateTime(item.end_time)}</span>
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="p-8 text-center">
                      <div className="flex flex-col items-center gap-3 max-w-[180px] mx-auto">
                         <div className={`flex justify-between w-full text-[10px] font-black uppercase italic tracking-tighter ${isFullProgress ? 'text-emerald-600' : 'text-blue-900'}`}>
                            <span>{answeredCount} / {totalQ} Soal</span>
                            <span>{progressPercent}%</span>
                         </div>
                         <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <div className={`h-full transition-all duration-1000 ${isFullProgress ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : isFinished ? 'bg-blue-900' : 'bg-amber-500'}`} style={{ width: `${progressPercent}%` }}></div>
                         </div>
                         {(item.reset_count || 0) > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-red-600 shadow-sm">
                               <span className="text-[8px] font-black uppercase tracking-widest">RIWAYAT RESET {(item.reset_count || 0)}x</span>
                            </div>
                         )}
                      </div>
                    </td>
                    <td className="p-8 text-right">
                       <button 
                          disabled={isResetting !== null} 
                          onClick={() => setPendingReset({uid: item.user_id, gid: Number(activeTabGid), name: item.name})} 
                          className="px-6 py-3 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-2xl text-[9px] font-black uppercase shadow-sm transition-all flex items-center justify-center gap-2 ml-auto active:scale-95"
                       >
                          {isResetting === item.user_id ? 'Wait...' : '🔄 RESET'}
                       </button>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedList.length === 0 && (
                 <tr><td colSpan={5} className="p-24 text-center text-slate-300 uppercase font-black text-sm italic tracking-[0.2em] leading-relaxed">Sistem Belum Mendeteksi Aktivitas Sesuai Filter<br/><span className="text-[10px] font-medium mt-2 block">Sesuaikan filter atau tunggu aktivitas siswa...</span></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pb-12">
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">DNA MONITORING SYSTEM v4.5 • SMP NEGERI 06 PEKALONGAN</p>
      </div>

      {/* MODAL RESET INDIVIDU */}
      <Modal 
        isOpen={pendingReset !== null} 
        title="Reset Siswa Ini Saja?" 
        message={`HANYA pengerjaan ${pendingReset?.name.toUpperCase()} yang akan dibersihkan. Siswa ini harus login ulang untuk memulai dari nomor 1.`} 
        confirmLabel="YA, RESET SISWA INI" 
        onConfirm={confirmReset} 
        onCancel={() => setPendingReset(null)} 
        type="warning" 
      />

      {/* MODAL RESET MASSAL */}
      <Modal 
        isOpen={showMassResetModal} 
        title="PERINGATAN: RESET SELURUH SESI!" 
        message={`Tindakan ini akan menghapus progres SEMUA SISWA (${filteredAndSortedList.length} orang) yang sedang mengerjakan atau sudah selesai di sesi '${activeGroupDetail?.group_name.toUpperCase()}'. Tindakan ini tidak dapat dibatalkan!`} 
        confirmLabel="YA, RESET SEMUA SEKARANG" 
        onConfirm={confirmMassReset} 
        onCancel={() => setShowMassResetModal(false)} 
        type="danger" 
      />
    </div>
  );
};

export default MonitoringDNA;
