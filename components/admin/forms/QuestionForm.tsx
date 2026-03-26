import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Image as ImageIcon, Type, CheckCircle2 } from 'lucide-react';
import Modal from '../../Modal';
import MathInput from './MathInput';
import OptionInput from './OptionInput';
import GroupSelector from './GroupSelector';
import QuestionTypeSelector from './QuestionTypeSelector';

interface QuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  groups: any[];
}

const QuestionForm: React.FC<QuestionFormProps> = ({ isOpen, onClose, onSave, initialData, groups }) => {
  const [formData, setFormData] = useState<any>({
    question_text: '',
    question_type: 'MULTIPLE_CHOICE',
    group_id: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    option_e: '',
    correct_answer: 'A',
    image_url: '',
    explanation: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        question_text: '',
        question_type: 'MULTIPLE_CHOICE',
        group_id: groups[0]?.id || '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        option_e: '',
        correct_answer: 'A',
        image_url: '',
        explanation: ''
      });
    }
  }, [initialData, groups]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal onClose={onClose} title={initialData ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'} maxWidth="4xl">
      <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Teks Pertanyaan</label>
                <MathInput 
                  value={formData.question_text} 
                  onChange={(val) => setFormData({...formData, question_text: val})} 
                  placeholder="Masukkan teks pertanyaan (mendukung MathJax)..."
                />
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tipe Soal</label>
                   <QuestionTypeSelector 
                     value={formData.question_type} 
                     onChange={(val) => setFormData({...formData, question_type: val})} 
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sesi Ujian</label>
                   <GroupSelector 
                     groups={groups}
                     value={formData.group_id} 
                     onChange={(val) => setFormData({...formData, group_id: val})} 
                   />
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">URL Gambar (Opsional)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <ImageIcon className="w-4 h-4" />
                   </div>
                   <input 
                     type="text"
                     value={formData.image_url}
                     onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                     placeholder="https://example.com/image.jpg"
                   />
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilihan Jawaban</label>
             {['A', 'B', 'C', 'D', 'E'].map((opt) => (
               <OptionInput 
                 key={opt}
                 label={opt}
                 value={formData[`option_${opt.toLowerCase()}`]}
                 isCorrect={formData.correct_answer === opt}
                 onChange={(val) => setFormData({...formData, [`option_${opt.toLowerCase()}`]: val})}
                 onSetCorrect={() => setFormData({...formData, correct_answer: opt})}
               />
             ))}
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-3"
          >
            <Save className="w-5 h-5" />
            Simpan Pertanyaan
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuestionForm;
