import React, { useState, useMemo } from 'react';
import { Question, QuestionGroup, User } from '../../types';
import QuestionForm from './question/QuestionForm';
import QuestionList from './question/QuestionList';
import { Search, Filter, PlusCircle, Trash2, RefreshCw, FileText, LayoutGrid, List } from 'lucide-react';
import { QuestionController } from '../../controllers/QuestionController';

interface QuestionManagerProps {
  questions: Question[];
  groups: QuestionGroup[];
  refreshData: () => void;
  API_BASE_URL: string;
  activeGroupId: number | null;
  currentUser: User;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingId: string | number | null;
  setEditingId: (id: string | number | null) => void;
  form: Partial<Question>;
  setForm: (form: Partial<Question>) => void;
  initialForm: Partial<Question>;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ 
  questions, groups, refreshData, API_BASE_URL, activeGroupId, currentUser,
  showForm, setShowForm, editingId, setEditingId, form, setForm, initialForm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>(activeGroupId || 'all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || q.type === filterType;
      const matchesGroup = filterGroup === 'all' || (q.group_ids || []).map(Number).includes(Number(filterGroup));
      return matchesSearch && matchesType && matchesGroup;
    });
  }, [questions, searchTerm, filterType, filterGroup]);

  const handleEdit = (q: Question) => {
    setForm({ ...q });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus soal ini?")) return;
    try {
      const res = await QuestionController.delete(id);
      if (res.success) refreshData();
      else alert(res.message);
    } catch (e) {
      alert("Gagal menghapus soal.");
    }
  };

  const groupPointsMap = useMemo(() => {
    const map: Record<number, number> = {};
    groups.forEach(g => {
      map[Number(g.id)] = questions
        .filter(q => (q.group_ids || []).map(Number).includes(Number(g.id)))
        .reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    });
    return map;
  }, [questions, groups]);

  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  return (
    <div className="space-y-8">
      
      {/* Controls & Filters */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari butir soal..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
             <button 
               onClick={() => setViewMode('list')}
               className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <List className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <LayoutGrid className="w-4 h-4" />
             </button>
          </div>

          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all min-w-[140px]"
          >
            <option value="all">Semua Tipe</option>
            <option value="single">Pilihan Ganda</option>
            <option value="multiple">PG Kompleks</option>
            <option value="table">Tabel B/S</option>
          </select>

          <select 
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all min-w-[160px]"
          >
            <option value="all">Semua Sesi</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
          </select>

          <button 
            onClick={refreshData}
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        <QuestionList 
          questions={filteredQuestions} 
          groups={groups} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          viewMode={viewMode}
          groupPointsMap={groupPointsMap}
          onPreview={(q) => setPreviewQuestion(q)}
        />
      </div>

      {/* Question Form Modal */}
      {showForm && (
        <QuestionForm 
          form={form} 
          setForm={setForm} 
          groups={groups} 
          onClose={() => { setShowForm(false); setEditingId(null); setForm(initialForm); }} 
          onSuccess={() => { setShowForm(false); setEditingId(null); setForm(initialForm); refreshData(); }}
          editingId={editingId}
          API_BASE_URL={API_BASE_URL}
          currentUser={currentUser}
        />
      )}

    </div>
  );
};

export default QuestionManager;
