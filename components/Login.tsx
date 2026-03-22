
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthController } from '../controllers/AuthController';
import { generateMotivation } from '../services/ai/studentService';

interface LoginProps {
  examCode: string;
  onLoginSuccess: (user: User) => void;
  API_BASE_URL: string;
}

const Login: React.FC<LoginProps> = ({ examCode, onLoginSuccess, API_BASE_URL }) => {
  const [step, setStep] = useState<'TOKEN' | 'IDENTITY'>('TOKEN');
  const [tokenInput, setTokenInput] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const motivations = [
    "Logika dan analisa adalah kunci penguasaan ilmu pengetahuan.",
    "Tes Kemampuan Akademik mengukur kesiapanmu menaklukkan tantangan masa depan.",
    "Kejujuran dalam ujian adalah cerminan integritas pribadi yang unggul.",
    "Fokus, teliti, dan percaya diri: Rumus utama sukses Try Out hari ini.",
    "Setiap butir soal adalah peluang untuk membuktikan ketajaman berpikirmu.",
    "Jadilah versi terbaik dari dirimu melalui evaluasi belajar yang sungguh-sungguh."
  ];

  const [motivation, setMotivation] = useState(motivations[0]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const refreshMotivation = async () => {
    setIsAiLoading(true);
    const newMotivation = await generateMotivation();
    setMotivation(newMotivation);
    setIsAiLoading(false);
  };

  useEffect(() => {
    refreshMotivation();
    const timer = setInterval(() => {
      refreshMotivation();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.toUpperCase().trim() === examCode.toUpperCase().trim()) {
      setStep('IDENTITY');
      setError('');
    } else {
      setError('Token Akses Ujian Tidak Valid. Silakan hubungi pengawas.');
    }
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { setError('Lengkapi NIS/Username dan Kata Sandi.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const response = await AuthController.login({ identifier, password });
      if (response && response.success) {
        onLoginSuccess(response.user);
      } else { 
        setError(response?.message || 'Identitas atau Kata Sandi salah.'); 
      }
    } catch (e) { 
      setError('Gangguan sinkronisasi server ujian.'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* Left Panel: Academic Branding & Motivational Engine */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-16 bg-brand-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-800 via-brand-900 to-brand-950"></div>
        
        {/* Academic Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-brand-400/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 space-y-12">
          <div className="flex items-center gap-4 bg-white/10 w-fit px-5 py-3 rounded-2xl backdrop-blur-md border border-white/20">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUAewpaCEiTBuf9_nlRFk0cA01o876EqM6lw&s" alt="Logo" className="w-10 h-10 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-[11px] uppercase tracking-[0.2em] text-white">Portal Akademik</span>
              <span className="font-bold text-[9px] uppercase tracking-[0.1em] text-brand-300">SMPN 06 Pekalongan</span>
            </div>
          </div>

          <div className="space-y-6">
             <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Try Out <br/><span className="text-brand-300">Tes Kemampuan Akademik.</span>
             </h1>
             <p className="text-brand-100/70 text-[16px] font-medium tracking-wide leading-relaxed max-w-md">
                Edisi Persiapan Ujian Akhir & Pemetaan Kompetensi Siswa Berbasis Analisis Kognitif Digital.
             </p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">💡</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Insight Hari Ini</span>
              </div>
              <p className={`text-lg xl:text-xl font-medium italic leading-relaxed text-brand-50 transition-opacity duration-500 ${isAiLoading ? 'opacity-50' : 'opacity-100'}`}>
                "{motivation}"
              </p>
          </div>
          <div className="flex items-center gap-6 opacity-40">
             <div className="text-[9px] font-bold uppercase tracking-[0.4em]">Secure Node v9.6.8</div>
             <div className="h-px w-12 bg-white/30"></div>
             <div className="text-[9px] font-bold uppercase tracking-[0.4em]">Academic integrity first</div>
          </div>
        </div>
      </div>

      {/* Right Panel: Exam Access Forms */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-slate-50/40">
        <div className="w-full max-w-md space-y-12">
          
          <div className="space-y-3 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Akses Ujian.
            </h2>
            <p className="text-slate-400 text-[13px] font-medium uppercase tracking-[0.2em]">
              Otentikasi Peserta Try Out TKA
            </p>
          </div>

          <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
            {step === 'TOKEN' ? (
              <form onSubmit={handleTokenSubmit} className="p-8 space-y-8 animate-in fade-up">
                <div className="space-y-5 text-center">
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🔑</span>
                  </div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] block">Masukkan Token Akses Sesi</label>
                  <input 
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center text-3xl font-black uppercase tracking-[0.4em] text-brand-900 focus:border-brand-500 focus:bg-white outline-none transition-all shadow-inner"
                    placeholder="••••••"
                    value={tokenInput}
                    onChange={e => { setTokenInput(e.target.value.toUpperCase()); setError(''); }}
                    autoFocus
                  />
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide italic">Minta token sesi pada guru pengawas ujian</p>
                </div>
                
                <div className="space-y-4">
                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100 text-center uppercase tracking-wide">
                      {error}
                    </div>
                  )}
                  <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-brand-100 transition-all active:scale-95">
                    VALIDASI SESI ➔
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleIdentitySubmit} className="p-8 space-y-6 animate-in fade-up">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ID NIS / Username</label>
                    <div className="relative">
                      <input 
                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-brand-500 transition-all text-sm shadow-inner" 
                        placeholder="ID Identitas Anda" 
                        value={identifier} 
                        onChange={e => setIdentifier(e.target.value)} 
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">👤</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Kata Sandi Rahasia</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-brand-500 transition-all pr-12 text-sm shadow-inner" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔒</span>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-500 transition-colors text-lg">
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100 text-center uppercase tracking-wide">
                      {error}
                    </div>
                  )}
                  <button disabled={isLoading} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-brand-100 transition-all active:scale-95">
                    {isLoading ? 'MENGHUBUNGKAN...' : 'MASUK PORTAL UJIAN'}
                  </button>
                  <button type="button" onClick={() => setStep('TOKEN')} className="w-full text-center text-[10px] font-black text-slate-400 hover:text-brand-600 uppercase tracking-[0.2em] transition-colors">
                    ← Kembali Ke Validasi Sesi
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="text-center">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">SMP Negeri 06 Pekalongan • Sistem Terpadu © 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
