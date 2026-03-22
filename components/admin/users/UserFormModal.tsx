import React from 'react';
import { User, UserRole } from '../../../types';

interface UserFormModalProps {
  userForm: Partial<User>;
  setUserForm: (form: Partial<User> | null) => void;
  onSave: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ userForm, setUserForm, onSave }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[5000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl border-4 border-white animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black uppercase text-blue-900 italic tracking-tighter">
            {userForm.id ? '✏️ Edit Pengguna' : '➕ Tambah Pengguna'}
          </h3>
          <button 
            onClick={() => setUserForm(null)} 
            className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nama Lengkap</label>
            <input 
              className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-900 transition-all shadow-inner" 
              value={userForm.name || ''} 
              onChange={e => setUserForm({...userForm, name: e.target.value})} 
              placeholder="Nama Lengkap" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Username</label>
              <input 
                className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-900 transition-all shadow-inner" 
                value={userForm.username || ''} 
                onChange={e => setUserForm({...userForm, username: e.target.value})} 
                placeholder="Username" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Password</label>
              <input 
                className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-900 transition-all shadow-inner" 
                value={userForm.password || ''} 
                onChange={e => setUserForm({...userForm, password: e.target.value})} 
                placeholder="Password" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">NIS (Siswa)</label>
              <input 
                className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-900 transition-all shadow-inner" 
                value={userForm.nis || ''} 
                onChange={e => setUserForm({...userForm, nis: e.target.value})} 
                placeholder="NIS" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">NIP (Guru)</label>
              <input 
                className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-900 transition-all shadow-inner" 
                value={userForm.nip || ''} 
                onChange={e => setUserForm({...userForm, nip: e.target.value})} 
                placeholder="NIP" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Kelas</label>
              <input 
                className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-900 transition-all shadow-inner" 
                value={userForm.kelas || ''} 
                onChange={e => setUserForm({...userForm, kelas: e.target.value})} 
                placeholder="Contoh: 9A" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tahun Ajaran</label>
              <input 
                className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-900 transition-all shadow-inner" 
                value={userForm.tahun_ajaran || ''} 
                onChange={e => setUserForm({...userForm, tahun_ajaran: e.target.value})} 
                placeholder="2025/2026" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Role</label>
              <select 
                className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-900 transition-all shadow-inner" 
                value={userForm.role || UserRole.STUDENT} 
                onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}
              >
                <option value={UserRole.STUDENT}>SISWA</option>
                <option value={UserRole.TEACHER}>GURU</option>
                <option value={UserRole.ADMIN}>ADMIN</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button 
            onClick={() => setUserForm(null)} 
            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all"
          >
            BATAL
          </button>
          <button 
            onClick={onSave} 
            className="flex-[2] py-4 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-100 border-b-4 border-blue-950 active:scale-95 transition-all"
          >
            SIMPAN PERUBAHAN
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
