import React, { useState, useEffect } from 'react';
import { Save, X, User, Shield, Mail, Key, Hash } from 'lucide-react';
import Modal from '../../Modal';
import RoleSelector from './RoleSelector';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<any>({
    username: '',
    password: '',
    name: '',
    role: 'STUDENT',
    email: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: '' // Don't pre-fill password
      });
    } else {
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'STUDENT',
        email: ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal onClose={onClose} title={initialData ? 'Edit Pengguna' : 'Tambah Pengguna'} maxWidth="xl">
      <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
        <div className="space-y-8">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nama Lengkap</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                 </div>
                 <input 
                   type="text"
                   required
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                   placeholder="Masukkan nama lengkap..."
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Username / NIS</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                       <Hash className="w-4 h-4" />
                    </div>
                    <input 
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Username..."
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Role Pengguna</label>
                 <RoleSelector 
                   value={formData.role} 
                   onChange={(val) => setFormData({...formData, role: val})} 
                 />
              </div>
           </div>

           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email (Opsional)</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                 </div>
                 <input 
                   type="email"
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                   placeholder="email@example.com"
                 />
              </div>
           </div>

           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                {initialData ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
              </label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                 </div>
                 <input 
                   type="password"
                   required={!initialData}
                   value={formData.password}
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                   placeholder="••••••••"
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
            Simpan Pengguna
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;
