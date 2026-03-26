import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface OptionInputProps {
  label: string;
  value: string;
  isCorrect: boolean;
  onChange: (value: string) => void;
  onSetCorrect: () => void;
}

const OptionInput: React.FC<OptionInputProps> = ({ label, value, isCorrect, onChange, onSetCorrect }) => {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${
      isCorrect ? 'bg-indigo-50 border-indigo-600 shadow-sm' : 'bg-slate-50 border-slate-100'
    }`}>
      <button
        type="button"
        onClick={onSetCorrect}
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all shrink-0 ${
          isCorrect ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-400'
        }`}
      >
        {label}
      </button>
      
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-slate-700 placeholder-slate-300 resize-none min-h-[40px]"
          placeholder={`Masukkan pilihan ${label}...`}
        />
      </div>

      {isCorrect && (
        <div className="p-2 text-indigo-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default OptionInput;
