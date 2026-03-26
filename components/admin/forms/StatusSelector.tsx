import React from 'react';
import { Activity } from 'lucide-react';

interface StatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ value, onChange }) => {
  const statuses = [
    { id: 'ACTIVE', label: 'Aktif' },
    { id: 'INACTIVE', label: 'Tidak Aktif' },
    { id: 'ARCHIVED', label: 'Arsip' },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
        <Activity className="w-4 h-4" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
      >
        {statuses.map((status) => (
          <option key={status.id} value={status.id}>
            {status.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default StatusSelector;
