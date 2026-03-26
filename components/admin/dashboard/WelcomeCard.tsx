import React from 'react';
import { ShieldCheck, ArrowRight, School, Activity } from 'lucide-react';

interface WelcomeCardProps {
  userName: string;
  onMonitoringClick: () => void;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName, onMonitoringClick }) => {
  return (
    <div className="relative bg-blue-900 rounded-[3rem] p-10 sm:p-16 text-white overflow-hidden shadow-2xl shadow-blue-200">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          <ShieldCheck className="w-4 h-4 text-blue-300" />
          System Administrator Verified
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] mb-6">
          Selamat Datang, <br />
          <span className="text-blue-400">{userName.split(' ')[0]}.</span>
        </h1>
        <p className="text-blue-100/70 text-lg font-medium leading-relaxed mb-10">
          Pusat kendali akademik SMP Negeri 06 Pekalongan. Kelola seluruh aspek ujian digital Anda dari satu antarmuka terpadu.
        </p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={onMonitoringClick}
            className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3"
          >
            Mulai Monitoring
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Node Status: Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
