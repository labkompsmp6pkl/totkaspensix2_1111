import React, { useState, useMemo, useEffect } from 'react';
import { Question, QuestionGroup, ScoringMode, User } from '../../types';
import { ensureArray } from '../../utils';
import { QuestionController } from '../../controllers/QuestionController';
import QuestionFilters from './questions/QuestionFilters';
import QuestionGrid from './questions/QuestionGrid';
import SearchAndAddBar from './SearchAndAddBar';
import QuestionPreview from './questions/QuestionPreview';
import QuestionEditor from './questions/QuestionEditor';
import DeleteConfirmation from './questions/DeleteConfirmation';

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
  setForm: React.Dispatch<React.SetStateAction<Partial<Question>>>;
  initialForm: Partial<Question>;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ 
  questions, groups, refreshData, API_BASE_URL, activeGroupId, currentUser,
  showForm, setShowForm, editingId, setEditingId, form, setForm, initialForm
}) => {
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [sortType, setSortType] = useState<'ID' | 'ORDER'>('ID');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; 
  
  // Fungsi Scroll sudah kembali sederhana
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const subjects = ['Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Bahasa Inggris', 'Informatika', 'TKA Umum'];

  const groupPointsMap = useMemo(() => {
    const map: Record<number, number> = {};
    groups.forEach(g => {
      const qInGroup = questions.filter(q => ensureArray(q.group_ids).map(Number).includes(Number(g.id)));
      map[g.id] = qInGroup.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
    });
    return map;
  }, [groups, questions]);

  const handleEdit = React.useCallback((q: any) => {
    setEditingId(q.id);
    setForm({ ...q, group_ids: ensureArray(q.group_ids).map(Number), scoring_mode: q.scoring_mode || 'all_or_nothing', points: Number(q.points), tableOptions: q.tableOptions?.length > 0 ? q.tableOptions : ['BENAR', 'SALAH'] });
    setShowForm(true);
  }, [setEditingId, setForm, setShowForm]);

  const handleModeChange = (newMode: ScoringMode) => {
    setForm((prev: Partial<Question>) => {
      if (newMode === 'all_or_nothing') return { ...prev, scoring_mode: 'all_or_nothing' };
      const updatedOptions = ensureArray(prev.options).map(opt => ({ ...opt, points: (prev.type === 'single' ? opt.id === prev.correctOptionId : ensureArray(prev.correctOptionIds).includes(opt.id)) ? (prev.points || 10) : 0 }));
      return { ...prev, scoring_mode: 'partial', options: updatedOptions };
    });
  };

  const autoCalculatedPoints = useMemo(() => {
    if (form.scoring_mode === 'all_or_nothing') return form.points || 0;
    if (form.type === 'single') return Math.max(...(form.options?.map(o => Number(o.points) || 0) || [0]));
    if (form.type === 'multiple') return (form.options?.reduce((acc, o) => acc + (Number(o.points) || 0), 0) || 0);
    if (form.type === 'table') return (form.statements?.reduce((acc, s) => acc + (Number(s.points) || 0), 0) || 0);
    return 0;
  }, [form]);

  const handleSave = async () => {
    setIsSaving(true);
    await QuestionController.save({ ...form, id: editingId, points: form.scoring_mode === 'all_or_nothing' ? form.points : autoCalculatedPoints, created_by: currentUser.id });
    setShowForm(false); refreshData(); setIsSaving(false);
  };

  const filteredAndSortedQuestions = useMemo(() => {
    let result = questions.filter(q => {
      const text = (q.text || "").toLowerCase();
      const query = (searchQuery || "").toLowerCase();
      return text.includes(query) && (filterSubject === 'ALL' || q.subject === filterSubject);
    });
    if (sortType === 'ID') result.sort((a, b) => Number(b.id) - Number(a.id));
    else result.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
    return result;
  }, [questions, searchQuery, filterSubject, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSubject, sortType]);

  const totalPages = Math.ceil(filteredAndSortedQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredAndSortedQuestions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full space-y-6 pt-2 pb-24 min-h-[70vh]">
      <SearchAndAddBar 
        onSearch={(q) => setSearchQuery(q)} 
        onAdd={() => { setForm(initialForm); setEditingId(null); setShowForm(true); }}
      />
      
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <QuestionFilters 
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          sortType={sortType}
          setSortType={setSortType}
          subjects={subjects}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <div>
              <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic leading-none">Katalog Bank Soal</h3>
              <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">Total: {filteredAndSortedQuestions.length} Butir Soal</p>
           </div>
        </div>

        <div className="pt-2">
          <QuestionGrid 
            questions={paginatedQuestions}
            groups={groups}
            groupPointsMap={groupPointsMap}
            onPreview={setPreviewQuestion}
            onEdit={handleEdit}
            onDelete={setDeleteConfirmId}
          />

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8 pt-4 pb-8 border-t border-slate-100">
              <button 
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  scrollToTop();
                }}
                disabled={currentPage === 1}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
              >
                <span>&larr;</span> Sebelumnya
              </button>
              
              <div className="px-4 py-2 bg-indigo-50/50 rounded-xl text-xs font-bold text-indigo-600 border border-indigo-100/50 shadow-sm">
                Halaman {currentPage} dari {totalPages}
              </div>
              
              <button 
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  scrollToTop();
                }}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
              >
                Selanjutnya <span>&rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {previewQuestion && <QuestionPreview question={previewQuestion} onClose={() => setPreviewQuestion(null)} />}
      {showForm && <QuestionEditor form={form} setForm={setForm} groups={groups} subjects={subjects} autoCalculatedPoints={autoCalculatedPoints} isSaving={isSaving} onSave={handleSave} onClose={() => setShowForm(false)} handleModeChange={handleModeChange} />}
      {deleteConfirmId && <DeleteConfirmation onCancel={() => setDeleteConfirmId(null)} onConfirm={async () => {
          try { await fetch(`${API_BASE_URL}?action=delete_question&id=${deleteConfirmId}`, { method: 'DELETE' }); setDeleteConfirmId(null); refreshData(); } catch (error) { console.error("Gagal menghapus soal:", error); setDeleteConfirmId(null); }
      }} />}
    </div>
  );
};

export default QuestionManager;
