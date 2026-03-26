import React from 'react';
import { Type } from 'lucide-react';

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MathInput: React.FC<MathInputProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[120px] resize-y"
        placeholder={placeholder}
      />
      <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-lg shadow-sm pointer-events-none">
         <Type className="w-3 h-3 text-slate-400" />
         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Supports MathJax</span>
      </div>
    </div>
  );
};

export default MathInput;
