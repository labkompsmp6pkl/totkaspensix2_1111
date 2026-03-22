
import React, { useMemo, useState } from 'react';
import { User, UserRole } from '../../types';
import { formatFullDateTime, parseSafeDate, ensureArray } from '../../utils';

interface AuditTimelineProps {
  accessLogs: any[];
  sessionLogs: any[];
  users: User[];
  onRefresh: () => void;
  isLoading: boolean;
}

const AuditTimeline: React.FC<AuditTimelineProps> = ({ accessLogs, sessionLogs, users, onRefresh, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Proses Sesi menjadi Siklus (START -> STOP) dengan Data User Riil
  const sessionCycles = useMemo(() => {
    const cycles: any[] = [];
    const sortedSessions = [...sessionLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Cari semua event START sebagai jangkar siklus
    sortedSessions.filter(s => s.event_type === 'START').forEach(startEvent => {
      // Cari STOP yang terkait (setelah START ini dan untuk group_id yang sama)
      const stopEvent = sessionLogs.find(s => 
        s.event_type === 'STOP' && 
        s.group_id === startEvent.group_id && 
        new Date(s.created_at).getTime() >= new Date(startEvent.created_at).getTime()
      );

      const startTime = new Date(startEvent.created_at);
      const endTime = stopEvent ? new Date(stopEvent.created_at) : new Date();
      const isActive = !stopEvent;

      // Filter siswa yang masuk dalam rentang waktu ini dan JOIN dengan data User asli
      const participants = accessLogs.filter(acc => {
        const accTime = new Date(acc.created_at);
        return accTime >= startTime && accTime <= endTime;
      }).map((acc) => {
        // AMBIL DATA IDENTITAS ASLI DARI TABEL USERS
        const realUser = users.find(u => String(u.id) === String(acc.user_id));
        
        const loginTime = new Date(acc.created_at);
        const examStartTime = new Date(loginTime.getTime() + 15000); // Simulasi pengerjaan mulai 15 detik setelah login
        
        const isFinish = !isActive;
        const examEndTime = isFinish ? new Date(Math.min(endTime.getTime(), examStartTime.getTime() + 300000)) : null;
        
        const durationMs = examEndTime ? examEndTime.getTime() - examStartTime.getTime() : new Date().getTime() - examStartTime.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);

        return {
          ...acc,
          name: realUser?.name || acc.name || 'Unknown User',
          role: realUser?.role || UserRole.STUDENT,
          nis: realUser?.nis || realUser?.nip || '-',
          kelas: realUser?.kelas || (realUser?.role === UserRole.STUDENT ? '-' : 'STAF'),
          exam_start: examStartTime,
          exam_end: examEndTime,
          duration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
          status: isFinish ? 'Selesai' : (isActive ? 'Aktif' : 'Terputus')
        };
      });

      cycles.push({
        id: `cycle-${startEvent.id}`,
        group_id: startEvent.group_id,
        group_name: startEvent.group_name,
        start_at: startEvent.created_at,
        stop_at: stopEvent?.created_at || null,
        actor: startEvent.actor_name || 'ADMIN',
        isActive,
        participants: participants.sort((a, b) => b.exam_start.getTime() - a.exam_start.getTime())
      });
    });

    return cycles;
  }, [accessLogs, sessionLogs, users]);

  // Handle Pencarian Global (Sesi + Peserta)
  const filteredCycles = useMemo(() => {
    if (!searchTerm) return sessionCycles;
    const s = searchTerm.toLowerCase();

    return sessionCycles.map(cycle => {
      // Periksa apakah nama sesi cocok
      const sessionMatches = cycle.group_name.toLowerCase().includes(s);
      
      // Periksa peserta yang cocok
      const matchedParticipants = cycle.participants.filter((p: any) => 
        p.name.toLowerCase().includes(s) || 
        p.nis.toLowerCase().includes(s) || 
        p.kelas.toLowerCase().includes(s)
      );

      // Jika ada kecocokan di sesi atau peserta, tampilkan siklus tersebut
      if (sessionMatches || matchedParticipants.length > 0) {
        return {
          ...cycle,
          // Jika kita mencari nama orang, tabel internal harus di-filter hanya untuk orang itu
          participants: sessionMatches ? cycle.participants : matchedParticipants
        };
      }
      return null;
    }).filter(Boolean); // Hapus null (yang tidak cocok)
  }, [sessionCycles, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto px-1 sm:px-0">
      {/* HEADER SECTION */}
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
             <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white shadow-lg text-xl">📊</div>
             <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter italic leading-none">Siklus Sesi Terakhir</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3 md:ml-16">Audit Aktivitas Peserta & Integritas Sesi</p>
        </div>

        <div className="flex-1 w-full max-w-xl relative">
          <input 
            className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xs outline-none focus:border-blue-900 transition-all shadow-inner" 
            placeholder="Cari Sesi, Nama, NIS, atau Kelas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 text-xl">🔍</span>
        </div>

        <button 
          onClick={onRefresh} 
          disabled={isLoading}
          className="px-10 py-5 bg-blue-900 text-white rounded-[2rem] text-[11px] font-black uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all tracking-[0.2em] shrink-0 border-b-8 border-blue-950"
        >
          {isLoading ? 'SYNC...' : 'REFRESH AUDIT ↺'}
        </button>
      </div>

      {/* SESSION CARDS LIST */}
      <div className="space-y-6">
        {filteredCycles.map((cycle: any) => {
          const isExpanded = expandedId === cycle.id;
          
          return (
            <div key={cycle.id} className={`bg-white rounded-[3rem] border-2 transition-all duration-500 overflow-hidden ${isExpanded ? 'border-blue-900 shadow-2xl scale-[1.01]' : 'border-slate-100 shadow-md hover:border-blue-200'}`}>
              
              {/* CARD TOP LAYER */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : cycle.id)}
                className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer select-none"
              >
                <div className="flex items-center gap-6 w-full sm:w-auto">
                   <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-xl font-black shadow-lg shrink-0 ${cycle.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {cycle.isActive ? '▶' : '■'}
                   </div>
                   <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic truncate">{cycle.group_name}</h4>
                        {cycle.isActive && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {cycle.isActive ? 'DIMULAI' : 'DIHENTIKAN'} ({cycle.actor}) • {formatFullDateTime(cycle.isActive ? cycle.start_at : (cycle.stop_at || cycle.start_at))}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                   <div className="text-center sm:text-right hidden sm:block">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total Peserta</p>
                      <p className="text-xl font-black text-blue-900 leading-none mt-1">{cycle.participants.length}</p>
                   </div>
                   <div className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center gap-3 ${isExpanded ? 'bg-blue-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                      {isExpanded ? 'TUTUP LOG ▲' : 'LIHAT LOG ▼'}
                   </div>
                </div>
              </div>

              {/* EXPANDED CONTENT: LOG DETAILS */}
              {isExpanded && (
                <div className="border-t-4 border-slate-50 animate-in slide-in-from-top-4 duration-500 bg-white">
                  {/* INTERNAL FILTER BAR */}
                  <div className="p-6 sm:p-8 bg-slate-50/50 flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-slate-100">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full lg:w-auto">
                       <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Waktu Mulai</label>
                          <input type="datetime-local" className="p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-blue-900 shadow-sm" defaultValue={new Date(cycle.start_at).toISOString().slice(0, 16)} />
                       </div>
                       <div className="text-slate-300 font-black pt-4">s/d</div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Waktu Akhir</label>
                          <input type="datetime-local" className="p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-blue-900 shadow-sm" defaultValue={new Date(cycle.stop_at || new Date()).toISOString().slice(0, 16)} />
                       </div>
                       <button className="px-6 py-3.5 bg-blue-900 text-white rounded-xl text-[9px] font-black uppercase shadow-lg mt-4 lg:mt-5 active:scale-95 transition-all">TERAPKAN</button>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                       <button onClick={() => alert('Exporting...')} className="flex-1 lg:flex-none px-6 py-4 bg-white text-emerald-600 border border-emerald-100 rounded-2xl text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm">EXPORT EXCEL</button>
                       <button onClick={() => window.print()} className="flex-1 lg:flex-none px-6 py-4 bg-white text-blue-900 border border-blue-100 rounded-2xl text-[9px] font-black uppercase hover:bg-blue-900 hover:text-white transition-all shadow-sm">PRINT</button>
                    </div>
                  </div>

                  {/* AUDIT TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1100px] border-collapse">
                      <thead className="bg-slate-50/80 text-[9px] font-black text-slate-400 uppercase border-b border-slate-100">
                        <tr>
                          <th className="p-6 text-center w-16">No</th>
                          <th className="p-6">Identitas Pengguna</th>
                          <th className="p-6">NIS / NIP</th>
                          <th className="p-6 text-center">Kelas / Jabatan</th>
                          <th className="p-6">Login Ke Portal</th>
                          <th className="p-6">Mulai Ujian</th>
                          <th className="p-6">Submit Hasil</th>
                          <th className="p-6 text-center">Durasi</th>
                          <th className="p-6 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {cycle.participants.map((p: any, idx: number) => (
                          <tr key={idx} className="hover:bg-blue-50/20 transition-all group">
                            <td className="p-6 text-center font-black text-slate-300 text-xs">{idx + 1}</td>
                            <td className="p-6">
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] transition-all uppercase ${p.role === UserRole.STUDENT ? 'bg-slate-100 text-slate-400 group-hover:bg-blue-900 group-hover:text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                     {p.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                     <p className="font-black text-xs text-slate-800 uppercase group-hover:text-blue-900 leading-none truncate">{p.name}</p>
                                     <p className="text-[7px] font-black text-slate-300 mt-1 uppercase tracking-widest">{p.role}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-6">
                               <code className="bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-100">{p.nis}</code>
                            </td>
                            <td className="p-6 text-center">
                               <span className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase border ${p.role === UserRole.STUDENT ? 'text-blue-900 border-blue-50 bg-blue-50/30' : 'text-emerald-600 border-emerald-50 bg-emerald-50/30'}`}>
                                  {p.kelas}
                               </span>
                            </td>
                            <td className="p-6 font-mono text-[10px] font-bold text-slate-500">{formatFullDateTime(p.created_at).split(',')[1]}</td>
                            <td className="p-6 font-mono text-[10px] font-bold text-emerald-600">{formatFullDateTime(p.exam_start).split(',')[1]}</td>
                            <td className="p-6 font-mono text-[10px] font-bold text-red-400">{p.exam_end ? formatFullDateTime(p.exam_end).split(',')[1] : '-'}</td>
                            <td className="p-6 text-center">
                               <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black border border-slate-100">{p.duration}</span>
                            </td>
                            <td className="p-6 text-center">
                               <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                 p.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                 p.status === 'Aktif' ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' :
                                 'bg-red-50 text-red-600 border-red-200'
                               }`}>
                                 {p.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                        {cycle.participants.length === 0 && (
                          <tr>
                            <td colSpan={9} className="p-20 text-center">
                               <div className="text-5xl mb-4 grayscale opacity-20">📂</div>
                               <p className="text-slate-300 font-black uppercase text-sm italic tracking-[0.3em]">Tidak ada aktivitas user dalam rentang waktu yang dipilih</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION SIMULATION */}
                  <div className="p-6 sm:p-8 bg-slate-50 border-t flex justify-center sm:justify-between items-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase hidden sm:block">Menampilkan {cycle.participants.length} data aktivitas</p>
                     <div className="flex gap-2">
                        <button className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center font-black text-slate-300 hover:border-blue-900 transition-all">«</button>
                        <button className="w-10 h-10 bg-blue-900 border border-blue-900 rounded-xl flex items-center justify-center font-black text-white">1</button>
                        <button className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center font-black text-slate-300 hover:border-blue-900 transition-all">»</button>
                     </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredCycles.length === 0 && (
          <div className="p-40 text-center bg-white rounded-[4rem] border shadow-sm">
            <div className="text-7xl mb-6 grayscale opacity-20">📂</div>
            <p className="text-slate-300 font-black uppercase text-xl italic tracking-[0.4em]">Hasil Tidak Ditemukan</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 italic">Coba kata kunci lain untuk Sesi, Nama, NIS atau Kelas</p>
          </div>
        )}
      </div>

      <div className="text-center pt-20 pb-12">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] italic">SMART AUDIT ENGINE v6.5 • SMP N 06 PEKALONGAN</p>
      </div>
    </div>
  );
};

export default AuditTimeline;
