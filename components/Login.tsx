import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { AuthController } from '../controllers/AuthController';
import { ShieldCheck, User as UserIcon, Lock, ArrowRight, School, Info, AlertCircle } from 'lucide-react';

interface LoginProps {
  examCode: string;
  onLoginSuccess: (user: User) => void;
  API_BASE_URL: string;
}

const Login: React.FC<LoginProps> = ({ examCode, onLoginSuccess, API_BASE_URL }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await AuthController.login({ identifier: username, password });
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Username atau password salah.');
      }
    } catch (err) {
      setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-100 font-sans overflow-hidden">
      
      {/* Sisi Kiri: Branding & Info (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-900 relative flex-col justify-between p-16 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full border-[60px] border-white"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full border-[100px] border-white"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <School className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">SMPN 06 PEKALONGAN</h1>
              <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Academic Portal v9.9</p>
            </div>
          </div>

          <div className="space-y-8 max-w-md">
            <h2 className="text-5xl font-black leading-[0.9] tracking-tighter uppercase italic">
              Portal Ujian <br /> 
              <span className="text-blue-400">Terintegrasi.</span>
            </h2>
            <p className="text-blue-100/70 font-medium leading-relaxed text-lg">
              Selamat datang di sistem manajemen ujian terpadu SMP Negeri 06 Pekalongan. 
              Silakan masuk untuk mengakses materi ujian dan dashboard akademik Anda.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 border-t border-white/10 pt-10">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-blue-900 bg-blue-700 flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">
            Digunakan oleh <span className="text-white">800+</span> Siswa Aktif
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Form Login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between lg:hidden">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <School className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xs tracking-tighter">SMPN 06 PEKALONGAN</span>
           </div>
           <button onClick={() => setShowInfo(!showInfo)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Info className="w-5 h-5" />
           </button>
        </div>

        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
            
            {/* Dekorasi Form */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-16 -mt-16 pointer-events-none"></div>

            <div className="mb-10 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border border-blue-100">
                <ShieldCheck className="w-3 h-3" /> Secure Authentication
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Silakan Masuk</h3>
              <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Gunakan akun yang telah terdaftar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username / NIS</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Masukkan username..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95 border-b-4 border-blue-800
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:-translate-y-1'}
                `}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    MASUK SEKARANG
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Academic Node Status</p>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Server Online</span>
               </div>
            </div>
          </div>

          <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            &copy; 2026 IT SMPN 06 PEKALONGAN. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Info Modal Mobile */}
      {showInfo && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md lg:hidden">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-300">
              <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Informasi Sistem</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Gunakan NIS sebagai username dan password standar yang diberikan oleh wali kelas Anda. Jika lupa password, silakan hubungi admin IT sekolah.
              </p>
              <button onClick={() => setShowInfo(false)} className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest">Tutup</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Login;
