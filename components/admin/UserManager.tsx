import React, { useState, useMemo } from 'react';
import { User, UserRole, Score } from '../../types';
import UserForm from './users/UserFormModal';
import UserList from './users/UserTable';
import { Search, Filter, RefreshCw, Users, UserCheck, UserX, Shield, Trash2, History } from 'lucide-react';
import { UserController } from '../../controllers/UserController';
import AuditTimeline from '../admin/AuditTimeline';
import ErrorLogViewer from '../admin/ErrorLogViewer';

interface UserManagerProps {
  users: User[];
  refreshData: () => void;
  API_BASE_URL: string;
  accessLogs: any[];
  sessionLogs: any[];
  scores: Score[];
  userForm: Partial<User> | null;
  setUserForm: (form: Partial<User> | null) => void;
  currentUser: User;
}

const UserManager: React.FC<UserManagerProps> = ({ 
  users, refreshData, API_BASE_URL, accessLogs, sessionLogs, scores,
  userForm, setUserForm, currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [activeSubTab, setActiveSubTab] = useState<'LIST' | 'AUDIT' | 'ERROR'>('LIST');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (u.nis || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const handleEdit = (u: User) => {
    setUserForm({ ...u });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus pengguna ini? Data nilai dan progres terkait akan tetap ada namun tidak terhubung.")) return;
    try {
      const res = await UserController.delete(id);
      if (res.success) refreshData();
      else alert(res.message);
    } catch (e) {
      alert("Gagal menghapus pengguna.");
    }
  };

  const stats = useMemo(() => ({
    total: users.length,
    students: users.filter(u => u.role === UserRole.STUDENT).length,
    teachers: users.filter(u => u.role === UserRole.TEACHER).length,
    admins: users.filter(u => u.role === UserRole.ADMIN).length
  }), [users]);

  const getUserLastTrace = (userId: string | number) => {
    const log = accessLogs.find(l => Number(l.user_id) === Number(userId));
    if (!log) return null;
    return { type: log.action, time: log.created_at, details: log.details || '' };
  };

  const getAcademicYearFromDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  };

  const handleSaveUser = async () => {
    if (!userForm) return;
    try {
      const res = await UserController.save(userForm);
      
      if (res.success) {
        setUserForm(null);
        refreshData();
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert("Gagal menyimpan data pengguna.");
    }
  };

  return (
    <div className="space-y-10">
      
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
           <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Manajemen Pengguna</h2>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Kelola akun siswa, guru, dan administrator sistem.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
           {[
             { id: 'LIST', label: 'Daftar User', icon: Users },
             { id: 'AUDIT', label: 'Audit Log', icon: History },
             { id: 'ERROR', label: 'Error Log', icon: Shield }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveSubTab(tab.id as any)}
               className={`
                 flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                 ${activeSubTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
               `}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeSubTab === 'LIST' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total User', value: stats.total, icon: Users, color: 'indigo' },
              { label: 'Siswa', value: stats.students, icon: UserCheck, color: 'blue' },
              { label: 'Guru', value: stats.teachers, icon: Shield, color: 'emerald' },
              { label: 'Admin', value: stats.admins, icon: UserX, color: 'amber' }
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex items-center gap-5">
                 <div className={`p-3.5 bg-${s.color}-100 text-${s.color}-600 rounded-2xl`}>
                    <s.icon className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <p className="text-2xl font-black text-slate-800">{s.value}</p>
                 </div>
              </div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari nama, username, atau NIS..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3">
               <select 
                 value={filterRole}
                 onChange={(e) => setFilterRole(e.target.value as any)}
                 className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all min-w-[140px]"
               >
                 <option value="all">Semua Peran</option>
                 <option value={UserRole.STUDENT}>Siswa</option>
                 <option value={UserRole.TEACHER}>Guru</option>
                 <option value={UserRole.ADMIN}>Admin</option>
               </select>
               <button 
                onClick={refreshData}
                className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User List */}
          <UserList 
            users={filteredUsers} 
            onEdit={handleEdit} 
            onDelete={(id: string | number) => handleDelete(id.toString())} 
            getUserLastTrace={getUserLastTrace}
            getAcademicYearFromDate={getAcademicYearFromDate}
            onInspectLogs={() => {}}
            showTrash={false}
            trashData={[]}
            onRestore={() => {}}
          />
        </>
      )}

      {activeSubTab === 'AUDIT' && (
        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-200">
           <AuditTimeline logs={accessLogs} />
        </div>
      )}

      {activeSubTab === 'ERROR' && (
        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-200">
           <ErrorLogViewer />
        </div>
      )}

      {/* User Form Modal */}
      {userForm && (
        <UserForm 
          userForm={userForm} 
          setUserForm={setUserForm} 
          onSave={handleSaveUser}
        />
      )}

    </div>
  );
};

export default UserManager;
