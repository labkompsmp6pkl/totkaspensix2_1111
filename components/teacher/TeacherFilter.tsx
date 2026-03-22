
import React from 'react';
import { QuestionGroup, User } from '../../types';
import { ensureArray } from '../../utils';

interface TeacherFilterProps {
  teacherSessions: QuestionGroup[];
  availableClasses: string[];
  selectedGroupId: string;
  selectedClass: string;
  onGroupChange: (id: string) => void;
  onClassChange: (cls: string) => void;
}

const TeacherFilter: React.FC<TeacherFilterProps> = ({ teacherSessions, availableClasses, selectedGroupId, selectedClass, onGroupChange, onClassChange }) => {
  const currentUserStr = localStorage.getItem('tka_user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  // 1. Filter Sesi yang diikuti guru
  const filteredSessions = teacherSessions.filter(g => {
    if (!currentUser || currentUser.role !== 'GURU') return true;
    return ensureArray(g.teacher_ids).some(a => {
      try { return String(JSON.parse(a).id) === String(currentUser.id); }
      catch(e) { return String(a) === String(currentUser.id); }
    });
  });

  // 2. Tentukan Kelas yang boleh dilihat guru berdasarkan sesi terpilih
  const getRestrictedClasses = () => {
    if (!currentUser || currentUser.role !== 'GURU' || selectedGroupId === 'all') return availableClasses;
    
    const session = teacherSessions.find(g => String(g.id) === selectedGroupId);
    if (!session) return availableClasses;

    const myAssignment = ensureArray(session.teacher_ids).find(a => {
      try { return String(JSON.parse(a).id) === String(currentUser.id); }
      catch(e) { return String(a) === String(currentUser.id); }
    });

    if (!myAssignment) return availableClasses;

    try {
      const parsed = JSON.parse(myAssignment);
      const specificClasses = ensureArray(parsed.classes);
      // Jika guru ditugaskan tapi tidak pilih kelas spesifik, tampilkan semua target_classes di sesi tersebut
      return specificClasses.length > 0 ? specificClasses : ensureArray(session.target_classes);
    } catch(e) {
      return ensureArray(session.target_classes);
    }
  };

  const restrictedClasses = getRestrictedClasses();

  return (
    <>
       <div className="md:col-span-1">
          <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Pilih Sesi Ujian</label>
          <select 
            className="w-full p-3 sm:p-4 bg-slate-50 border-2 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase focus:border-blue-900 outline-none transition-all appearance-none cursor-pointer shadow-sm" 
            value={selectedGroupId} 
            onChange={e => onGroupChange(e.target.value)}
          >
             <option value="all">🔍 Semua Sesi Saya</option>
             {filteredSessions.map(g => {
               const dateVal = g.start_time || g.created_at;
               const dateStr = dateVal ? new Date(dateVal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru';
               return (
                 <option key={g.id} value={g.id.toString()}>
                   {g.group_name} ({dateStr})
                 </option>
               );
             })}
          </select>
       </div>
       <div className="md:col-span-1">
          <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Tampilkan Kelas</label>
          <select 
            className="w-full p-3 sm:p-4 bg-slate-50 border-2 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase focus:border-blue-900 outline-none transition-all appearance-none cursor-pointer shadow-sm" 
            value={selectedClass} 
            onChange={e => onClassChange(e.target.value)}
          >
             <option value="all">📚 Semua Kelas Pantauan</option>
             {restrictedClasses.map(cls => <option key={cls} value={cls}>Kelas {cls}</option>)}
          </select>
       </div>
    </>
  );
};

export default TeacherFilter;
