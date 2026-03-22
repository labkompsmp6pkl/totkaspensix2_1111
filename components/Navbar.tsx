
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserController } from '../controllers/UserController';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  isOffline?: boolean;
  lastSync?: Date;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isOffline, lastSync }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    if (!user) return;
    if (!newPassword || newPassword.length < 3) return alert("Password minimal 3 karakter!");
    
    setIsUpdating(true);
    try {
      const res = await UserController.save({ ...user, password: newPassword });
      if (res.success) {
        alert("Password diperbarui!");
        setShowProfile(false);
        setNewPassword('');
      }
    } catch (e) {
      alert("Gagal memperbarui password.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <nav className="py-2 bg-slate-50 px-4 sm:px-8 flex justify-between items-center sticky top-0 z-[1000] w-full">
      {/* LEFT: BRANDING (Minimal) */}
      <div className="flex items-center gap-2">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUAewpaCEiTBuf9_nlRFk0cA01o876EqM6lw&s" 
          alt="Logo" 
          className="w-4 h-4 object-contain grayscale opacity-40" 
        />
        <div className="flex flex-col">
          <h1 className="font-bold text-[9px] sm:text-[10px] tracking-widest uppercase leading-none text-slate-400 italic">
            SMPN 06 Pekalongan
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`w-1 h-1 rounded-full ${isOffline ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
            <p className="text-[6px] font-bold text-slate-300 uppercase tracking-widest">
              {isOffline ? 'OFFLINE' : 'ONLINE'}
            </p>
          </div>
        </div>
      </div>

      {/* CENTER: NAV LINKS (Optional/Subtle) */}
      <div className="hidden md:flex items-center gap-6">
        <span className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] cursor-pointer">Sistem Akademik</span>
      </div>
      
      {/* RIGHT: USER MENU (Subtle) */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end pr-3 border-r border-slate-200">
            <span className="text-[7px] font-bold uppercase text-slate-300 tracking-widest leading-none mb-0.5">{user.role}</span>
            <button 
              onClick={() => setShowProfile(true)} 
              className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase leading-none flex items-center gap-1"
            >
              {user.name} <span className="text-[8px] opacity-30">⚙️</span>
            </button>
          </div>

          <button 
            onClick={onLogout} 
            className="text-slate-400 hover:text-red-500 text-[9px] font-bold uppercase tracking-widest transition-colors active:scale-95"
          >
            KELUAR
          </button>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-2xl p-7 border border-slate-100 shadow-2xl space-y-5 animate-in fade-up">
              <div className="text-center">
                 <h3 className="text-lg font-extrabold text-slate-900">Ubah Keamanan</h3>
                 <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Gunakan sandi yang sulit ditebak</p>
              </div>
              <input 
                type="password" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-brand-900 outline-none focus:border-brand-500 transition-all text-sm" 
                placeholder="PASSWORD BARU" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                 <button 
                   disabled={isUpdating}
                   onClick={handleUpdatePassword} 
                   className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold uppercase text-[11px] shadow-lg shadow-brand-100 active:scale-95 transition-all tracking-widest"
                 >
                   {isUpdating ? 'MEMPROSES...' : 'PERBARUI AKSES'}
                 </button>
                 <button onClick={() => setShowProfile(false)} className="w-full py-2 text-slate-400 font-bold uppercase text-[9px] tracking-widest">Tutup Panel</button>
              </div>
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
