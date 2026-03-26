import React from 'react';
import { Shield } from 'lucide-react';

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => {
  const roles = [
    { id: 'STUDENT', label: 'Siswa' },
    { id: 'TEACHER', label: 'Guru' },
    { id: 'ADMIN', label: 'Administrator' },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
        <Shield className="w-4 h-4" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.label}
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

export default RoleSelector;
