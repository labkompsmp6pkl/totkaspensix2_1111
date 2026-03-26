import React, { useState, useMemo } from 'react';
import { QuestionGroup, Question, User } from '../../types';
import SessionForm from './session/SessionForm';
import SessionList from './session/SessionList';
import { Search, Filter, RefreshCw, Layers, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { GroupController } from '../../controllers/GroupController';

interface SessionManagerProps {
  groups: QuestionGroup[];
  questions: Question[];
  users: User[];
  examCode: string;
  activeGroupId: number | null;
  refreshData: () => void;
  API_BASE_URL: string;
  currentUser: User;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  form: any;
  setForm: (form: any) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ 
  groups, questions, users, examCode, activeGroupId, refreshData, API_BASE_URL, currentUser,
  showForm, setShowForm, editingId, setEditingId, form, setForm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'draft'>('all');

  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchesSearch = g.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           g.group_code.toLowerCase().includes(searchTerm.toLowerCase());
      const isLive = g.last_started_at !== null;
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'live' ? isLive : !isLive);
      return matchesSearch && matchesStatus;
    });
  }, [groups, searchTerm, filterStatus]);

  const handleEdit = (g: QuestionGroup) => {
    setForm({ ...g });
    setEditingId(Number(g.id));
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus sesi ujian ini? Semua data nilai terkait mungkin akan terpengaruh.")) return;
    try {
      const res = await GroupController.delete(id);
      if (res.success) refreshData();
      else alert(res.message);
    } catch (e) {
      alert("Gagal menghapus sesi.");
    }
  };

  const handleToggleStatus = async (id: number) => {
    const group = groups.find(g => Number(g.id) === id);
    if (!group) return;

    const newStatus = group.last_started_at ? 'STOP' : 'START';
    
    try {
      const res = await GroupController.toggleStatus({
        group_id: id,
        status: newStatus,
        performer_id: Number(currentUser.id)
      });
      if (res.success) refreshData();
      else alert(res.message);
    } catch (e) {
      alert("Gagal mengubah status sesi.");
    }
  };

  return (
    <div className="space-y-10">
      
      {/* Header & Stats */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
           <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Manajemen Sesi Ujian</h2>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Kelola jadwal, durasi, dan akses ujian siswa.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                 <Layers className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Sesi</p>
                 <p className="text-lg font-black text-slate-800">{groups.length}</p>
              </div>
           </div>
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                 <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sesi Aktif</p>
                 <p className="text-lg font-black text-slate-800">{groups.filter(g => g.last_started_at).length}</p>
              </div>
           </div>
           <div className="hidden sm:flex bg-slate-50 p-4 rounded-2xl border border-slate-200 items-center gap-4">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                 <Clock className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Draft</p>
                 <p className="text-lg font-black text-slate-800">{groups.filter(g => !g.last_started_at).length}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama atau kode sesi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3">
           <select 
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value as any)}
             className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all min-w-[140px]"
           >
             <option value="all">Semua Status</option>
             <option value="live">Sedang Berlangsung</option>
             <option value="draft">Draft / Selesai</option>
           </select>
           <button 
            onClick={refreshData}
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Session List */}
      <SessionList 
        groups={filteredGroups} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onToggleStatus={handleToggleStatus} 
        questions={questions}
      />

      {/* Session Form Modal */}
      {showForm && (
        <SessionForm 
          form={form} 
          setForm={setForm} 
          users={users} 
          onClose={() => { setShowForm(false); setEditingId(null); }} 
          onSuccess={() => { setShowForm(false); setEditingId(null); refreshData(); }}
          editingId={editingId}
          API_BASE_URL={API_BASE_URL}
        />
      )}

    </div>
  );
};

export default SessionManager;
