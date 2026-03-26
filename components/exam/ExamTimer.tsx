import React from 'react';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
  timeLeft: number;
}

const ExamTimer: React.FC<ExamTimerProps> = ({ timeLeft }) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLow = timeLeft < 300; // 5 minutes

  return (
    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
      isLow ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-700'
    }`}>
      <Clock className="w-5 h-5" />
      <span className="text-2xl font-black tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default ExamTimer;
