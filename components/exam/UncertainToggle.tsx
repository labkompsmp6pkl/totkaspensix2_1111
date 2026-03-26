import React from 'react';
import { AlertCircle } from 'lucide-react';

interface UncertainToggleProps {
  isUncertain: boolean;
  onToggle: () => void;
}

const UncertainToggle: React.FC<UncertainToggleProps> = ({ isUncertain, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-2 ${
        isUncertain 
          ? 'bg-amber-50 border-amber-200 text-amber-600' 
          : 'bg-white border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500'
      }`}
    >
      <AlertCircle className="w-5 h-5" />
      Ragu-ragu
    </button>
  );
};

export default UncertainToggle;
