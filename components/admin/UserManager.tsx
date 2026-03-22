
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { ensureArray } from '../../utils';
import UserFilters from './users/UserFilters';
import UserTable from './users/UserTable';
import UserFormModal from './users/UserFormModal';
import UserLogInspector from './users/UserLogInspector';
import DeleteUserConfirmation from './users/DeleteUserConfirmation';
import RestoreUserConfirmation from './users/RestoreUserConfirmation';

interface UserManagerProps {
  users: User[];
  refreshData: () => void;
  API_BASE_URL: string;
  accessLogs?: any[];
  sessionLogs?: any[];
  scores?: any[];
  userForm: Partial<User> | null;
  setUserForm: (user: Partial<User> | null) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, refreshData, API_BASE_URL, accessLogs = [], sessionLogs = [], scores = [], userForm, setUserForm }) => {
  const [showTrash, setShowTrash] = useState(false);
  const [trashData, setTrashData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [filterPresence, setFilterPresence] = useState<'ALL' | 'HADIR' | 'BELUM_HADIR'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'DATE_DESC' | 'DATE_ASC'>('DATE_DESC');
  const [inspectUserLogs, setInspectUserLogs] = useState<User | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString('id-ID'));
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | number | null>(null);
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => { setLastUpdated(new Date().toLocaleTimeString('id-ID')); }, [users, accessLogs, sessionLogs]);

  const currentUser = JSON.parse(localStorage.getItem('tka_user') || '{}');

  const fetchTrash = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}?action=get_users_trash`);
      const data = await res.json();
      setTrashData(ensureArray(data));
    } catch (e) {}
  };

  useEffect(() => { if (showTrash) fetchTrash(); }, [showTrash]);

  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  };

  const getAcademicYearFromDate = (dateStr?: string) => {
    if (!dateStr) return "TIDAK ADA";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "TIDAK ADA";
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  };

  const usersWithLogs = useMemo(() => {
    const ids = new Set(accessLogs.map(log => String(log.user_id)));
    ensureArray(scores).forEach(s => { if (s.user_id) ids.add(String(s.user_id)); });
    return ids;
  }, [accessLogs, scores]);

  const classStats = useMemo(() => {
    const filtered = users.filter(u => (u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase())) && (selectedYear === "ALL" || (u.tahun_ajaran || getAcademicYearFromDate(u.created_at)).toUpperCase() === selectedYear));
    const stats: Record<string, number> = { "ALL": filtered.length };
    filtered.forEach(u => { const cls = (u.kelas || "TANPA KELAS").toUpperCase(); stats[cls] = (stats[cls] || 0) + 1; });
    return stats;
  }, [users, search, selectedYear]);

  const sortedClasses = useMemo(() => Object.keys(classStats).sort((a, b) => a === "ALL" ? -1 : b === "ALL" ? 1 : a.localeCompare(b, undefined, { numeric: true })), [classStats]);

  const yearStats = useMemo(() => {
    const filtered = users.filter(u => (u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase())) && (selectedClass === "ALL" || (u.kelas || "TANPA KELAS").toUpperCase() === selectedClass));
    const stats: Record<string, number> = { "ALL": filtered.length };
    filtered.forEach(u => { const year = (u.tahun_ajaran || getAcademicYearFromDate(u.created_at)).toUpperCase(); stats[year] = (stats[year] || 0) + 1; });
    return stats;
  }, [users, search, selectedClass]);

  const sortedYears = useMemo(() => Object.keys(yearStats).sort((a, b) => a === "ALL" ? -1 : b === "ALL" ? 1 : b.localeCompare(a)), [yearStats]);

  const presenceStats = useMemo(() => {
    const filtered = users.filter(u => (u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase())) && (selectedClass === "ALL" || (u.kelas || "TANPA KELAS").toUpperCase() === selectedClass) && (selectedYear === "ALL" || (u.tahun_ajaran || getAcademicYearFromDate(u.created_at)).toUpperCase() === selectedYear));
    let hadir = 0; filtered.forEach(u => { if (usersWithLogs.has(String(u.id))) hadir++; });
    return { ALL: filtered.length, HADIR: hadir, BELUM_HADIR: filtered.length - hadir };
  }, [users, search, selectedClass, selectedYear, usersWithLogs]);

  const filteredUsers = useMemo(() => {
    let result = users.filter(u => {
      const matchS = u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
      const matchC = selectedClass === "ALL" || (u.kelas || "TANPA KELAS").toUpperCase() === selectedClass;
      const matchY = selectedYear === "ALL" || (u.tahun_ajaran || getAcademicYearFromDate(u.created_at)).toUpperCase() === selectedYear;
      const isP = usersWithLogs.has(String(u.id));
      const matchP = filterPresence === 'ALL' || (filterPresence === 'HADIR' && isP) || (filterPresence === 'BELUM_HADIR' && !isP);
      return matchS && matchC && matchY && matchP;
    });
    result.sort((a, b) => {
      if (sortBy === 'NAME') return a.name.localeCompare(b.name);
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortBy === 'DATE_DESC' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [users, search, selectedClass, selectedYear, filterPresence, sortBy, usersWithLogs]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}?action=save_user`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
      const data = await res.json();
      if (data.success) { setUserForm(null); refreshData(); } else { alert(data.message || "Gagal menyimpan data"); }
    } catch (error) { alert("Terjadi kesalahan koneksi"); }
  };

  const getUserLastTrace = (userId: string | number) => {
    const log = accessLogs.find(l => String(l.user_id) === String(userId));
    if (log) return { type: 'LOGIN', time: log.created_at, details: log.group_name || 'Portal Utama' };
    const score = ensureArray(scores).find(s => String(s.user_id) === String(userId));
    if (score) return { type: 'SUBMIT', time: score.end_time || score.created_at, details: score.group_name || 'Misi Selesai' };
    return null;
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await fetch(`${API_BASE_URL}?action=delete_user&id=${deleteConfirmId}`, {method:'DELETE'});
    setDeleteConfirmId(null); refreshData();
  };

  const handleRestore = async () => {
    if (!restoreConfirmId) return;
    const res = await fetch(`${API_BASE_URL}?action=restore_user`, { method:'POST', body:JSON.stringify({ id: restoreConfirmId, performer_id: currentUser.id, password: adminPassword }) });
    const data = await res.json();
    if (data.success) { setRestoreConfirmId(null); setAdminPassword(""); refreshData(); } else { alert(data.message || "Gagal memulihkan akun"); }
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-[124px] sm:top-[140px] z-[80] flex flex-col md:flex-row justify-between items-center bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] border shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-blue-900 tracking-tighter italic">👥 Manajemen Pengguna</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total {users.length} Akun • {usersWithLogs.size} Aktif</p>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Sinkronisasi: {lastUpdated}</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select className="p-4 bg-white border-2 rounded-2xl text-[10px] font-black uppercase text-blue-900 outline-none shadow-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="DATE_DESC">📅 TERBARU</option>
            <option value="DATE_ASC">📅 TERLAMA</option>
            <option value="NAME">🔤 NAMA A-Z</option>
          </select>
          <input className="p-4 bg-slate-50 border-2 rounded-2xl text-xs font-bold w-full md:w-72 outline-none shadow-inner" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => setShowTrash(!showTrash)} className={`px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase transition-all ${showTrash ? 'bg-amber-600 text-white' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-900 border-2'}`}>{showTrash ? '📂 AKTIF' : '🗑️ SAMPAH'}</button>
        </div>
      </div>

      {!showTrash && (
        <UserFilters 
          selectedYear={selectedYear} setSelectedYear={setSelectedYear} sortedYears={sortedYears} yearStats={yearStats}
          selectedClass={selectedClass} setSelectedClass={setSelectedClass} sortedClasses={sortedClasses} classStats={classStats}
          filterPresence={filterPresence} setFilterPresence={setFilterPresence} presenceStats={presenceStats}
        />
      )}

      <div className="bg-white rounded-[2.5rem] border-4 border-slate-50 overflow-hidden shadow-sm">
        <UserTable 
          users={filteredUsers} getUserLastTrace={getUserLastTrace} getAcademicYearFromDate={getAcademicYearFromDate}
          onInspectLogs={setInspectUserLogs} onEdit={setUserForm} onDelete={setDeleteConfirmId}
          showTrash={showTrash} trashData={trashData} onRestore={setRestoreConfirmId}
        />
      </div>

      {userForm && <UserFormModal userForm={userForm} setUserForm={setUserForm} onSave={handleSave} />}
      {inspectUserLogs && <UserLogInspector user={inspectUserLogs} onClose={() => setInspectUserLogs(null)} accessLogs={accessLogs} sessionLogs={sessionLogs} />}
      {deleteConfirmId && <DeleteUserConfirmation onCancel={() => setDeleteConfirmId(null)} onConfirm={handleDelete} />}
      {restoreConfirmId && <RestoreUserConfirmation adminPassword={adminPassword} setAdminPassword={setAdminPassword} onCancel={() => { setRestoreConfirmId(null); setAdminPassword(""); }} onConfirm={handleRestore} />}
    </div>
  );
};

export default UserManager;

