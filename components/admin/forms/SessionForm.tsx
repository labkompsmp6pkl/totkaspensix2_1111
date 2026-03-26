import React, { useState, useEffect } from 'react';
import { Save, X, Calendar, Clock, Shield, Settings } from 'lucide-react';
import Modal from '../../Modal';
import StatusSelector from './StatusSelector';

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const SessionForm: React.FC<SessionFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    duration: 60,
    status: 'INACTIVE',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        description: '',
        duration: 60,
        status: 'INACTIVE',
        start_time: '',
        end_time: ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal onClose={onClose} title={initialData ? 'Edit Sesi Ujian' : 'Tambah Sesi Ujian'} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
        <div className="space-y-8">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nama Sesi</label>
              <input 
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Contoh: Try Out Matematika 2024"
              />
           </div>

           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Deskripsi</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[120px]"
                placeholder="Berikan deskripsi singkat tentang sesi ujian ini..."
              />
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Durasi (Menit)</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                       <Clock className="w-4 h-4" />
                    </div>
                    <input 
                      type="number"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status Sesi</label>
                 <StatusSelector 
                   value={formData.status} 
                   onChange={(val) => setFormData({...formData, status: val})} 
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Waktu Mulai</label>
                 <input 
                   type="datetime-local"
                   value={formData.start_time}
                   onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                   className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                 />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Waktu Selesai</label>
                 <input 
                   type="datetime-local"
                   value={formData.end_time}
                   onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                   className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                 />
              </div>
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
            Simpan Sesi
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SessionForm;
