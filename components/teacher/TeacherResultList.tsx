
import React from 'react';
import { ExamSession, User } from '../../types';

interface TeacherResultListProps {
  filteredScores: ExamSession[];
  users: User[];
}

const TeacherResultList: React.FC<TeacherResultListProps> = ({ filteredScores, users }) => {
  return (
    <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
          <tr>
            <th className="px-10 py-6">Profil Siswa / Kelas</th>
            <th className="px-10 py-6">Sesi Ujian</th>
            <th className="px-10 py-6 text-center">Ragu-Ragu</th>
            <th className="px-10 py-6 text-right">Skor Akhir</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filteredScores.map(s => {
            const student = users.find(u => Number(u.id) === Number(s.studentId));
            const uncertainCount = s.uncertainAnswers?.length || 0;

            return (
              <tr key={s.id} className="hover:bg-blue-50/50 transition-all group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-lg shadow-lg">
                       {student?.name.charAt(0) || 'S'}
                     </div>
                     <div>
                       <p className="font-black text-slate-800 text-base leading-none mb-1 group-hover:text-blue-900 transition-colors uppercase">{student?.name || 'Siswa'}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KELAS {student?.kelas || '-'} | NIS {student?.nis || '-'}</p>
                     </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <p className="font-black text-slate-700 text-[10px] uppercase tracking-tighter">{s.group_name || 'Umum'}</p>
                  <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">{new Date(s.endTime!).toLocaleTimeString('id-ID')}</p>
                </td>
                <td className="px-10 py-8 text-center">
                  {uncertainCount > 0 ? (
                    <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl text-[9px] font-black shadow-sm uppercase">🚩 {uncertainCount} RAGU</span>
                  ) : (
                    <span className="text-slate-300 text-[9px] font-black uppercase italic">Tidak Ada</span>
                  )}
                </td>
                <td className="px-10 py-8 text-right">
                   <span className={`text-5xl font-black tracking-tighter ${s.score! >= 70 ? 'text-blue-900' : 'text-slate-400'}`}>
                     {s.score}
                   </span>
                </td>
              </tr>
            );
          })}
          {filteredScores.length === 0 && (
            <tr>
              <td colSpan={4} className="p-24 text-center">
                <div className="text-5xl mb-4 grayscale opacity-20">📊</div>
                <p className="text-slate-300 font-black uppercase text-xl">Belum Ada Data Sesuai Filter</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherResultList;
