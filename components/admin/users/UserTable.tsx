import React from 'react';
import { User } from '../../../types';
import { formatFullDateTime } from '../../../utils';

interface UserTableProps {
  users: User[];
  getUserLastTrace: (userId: string | number) => { type: string; time: string; details: string } | null;
  getAcademicYearFromDate: (dateStr?: string) => string;
  onInspectLogs: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string | number) => void;
  showTrash: boolean;
  trashData: any[];
  onRestore: (id: string | number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  getUserLastTrace,
  getAcademicYearFromDate,
  onInspectLogs,
  onEdit,
  onDelete,
  showTrash,
  trashData,
  onRestore
}) => {
  if (showTrash) {
    return (
      <div className="p-8 space-y-4">
        {trashData.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Tempat sampah kosong</p>
          </div>
        ) : (
          trashData.map(u => (
            <div key={u.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-dashed">
              <p className="font-black text-xs uppercase text-slate-500">
                {u.name} <span className="text-[10px] opacity-40 font-normal">({u.deleted_at})</span>
              </p>
              <button 
                onClick={() => onRestore(u.id)} 
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black shadow-lg hover:bg-emerald-700 transition-all"
              >
                PULIHKAN
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[800px]">
        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
          <tr>
            <th className="p-8">Profil Peserta</th>
            <th className="p-8">Status Keamanan</th>
            <th className="p-8">Audit Jejak Digital</th>
            <th className="p-8 text-right">Opsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map(u => {
            const trace = getUserLastTrace(u.id);
            const isP = !!trace;
            return (
              <tr key={u.id} className={`hover:bg-blue-50/20 transition-all ${!isP ? 'bg-red-50/10' : ''}`}>
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-inner ${isP ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-300'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black uppercase text-xs text-slate-800 leading-tight">{u.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {u.role} • <span className="text-blue-600">{u.kelas || '-'}</span> 
                        <span className="ml-2 text-emerald-600">[{u.tahun_ajaran || getAcademicYearFromDate(u.created_at)}]</span>
                        {(u.nis || u.nip) && <span className="ml-2 text-slate-500">({u.nis || u.nip})</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <div className="space-y-1">
                    <code className="bg-slate-50 px-3 py-1 rounded-lg font-black text-slate-600 text-[10px] border">@{u.username}</code>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">ID: #{u.id}</p>
                  </div>
                </td>
                <td className="p-8">
                  {isP ? (
                    <div className="flex flex-col gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase w-fit shadow-sm ${trace.type === 'LOGIN' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        ✓ {trace.type} TERDETEKSI
                      </span>
                      <p className="text-[10px] font-black text-slate-700 uppercase leading-none">{formatFullDateTime(trace.time)}</p>
                      <p className="text-[9px] font-bold text-slate-400 truncate max-w-[150px] uppercase italic">{trace.details}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black rounded uppercase w-fit">✗ KOSONG</span>
                      <p className="text-[8px] font-bold text-slate-300 uppercase italic">Belum ada aktivitas</p>
                    </div>
                  )}
                </td>
                <td className="p-8 text-right space-x-2">
                  <button 
                    onClick={() => onInspectLogs(u)} 
                    className="p-3 bg-slate-50 rounded-xl hover:bg-blue-900 hover:text-white transition-all border"
                    title="Audit Jejak"
                  >
                    📋
                  </button>
                  <button 
                    onClick={() => onEdit(u)} 
                    className="p-3 bg-slate-50 rounded-xl hover:bg-amber-500 hover:text-white transition-all border"
                    title="Edit User"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => onDelete(u.id)} 
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
                    title="Hapus User"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
