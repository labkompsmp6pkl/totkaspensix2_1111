import React from 'react';
import { GraduationCap, ArrowRight, BookOpen, Calendar } from 'lucide-react';

interface WelcomeTeacherProps {
  userName: string;
  onActionClick: () => void;
}

const WelcomeTeacher: React.FC<WelcomeTeacherProps> = ({ userName, onActionClick }) => {
  return (
    <div className="relative bg-indigo-900 rounded-[3rem] p-10 sm:p-16 text-white overflow-hidden shadow-2xl shadow-indigo-200">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          <GraduationCap className="w-4 h-4 text-indigo-300" />
          Academic Instructor Verified
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] mb-6">
          Halo, Bapak/Ibu <br />
          <span className="text-indigo-400">{userName.split(' ')[0]}.</span>
        </h1>
        <p className="text-indigo-100/70 text-lg font-medium leading-relaxed mb-10">
          Selamat datang di dashboard pengajar. Pantau perkembangan nilai siswa dan analisis hasil ujian dengan data yang akurat.
        </p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={onActionClick}
            className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3"
          >
            Lihat Analisis Nilai
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4">
            <Calendar className="w-4 h-4 text-indigo-300" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTeacher;
