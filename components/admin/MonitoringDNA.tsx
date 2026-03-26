import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Activity, User, Clock, AlertCircle, CheckCircle2, Shield, Search, Filter, RefreshCw } from 'lucide-react';
import { API_BASE_URL, ensureArray } from '../../utils';

interface MonitoringDNAProps {
  users: any[];
  groups: any[];
}

const MonitoringDNA: React.FC<MonitoringDNAProps> = ({ users, groups }) => {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const fetchActiveUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}?action=get_active_monitoring`);
      if (res.ok) {
        const data = await res.json();
        setActiveUsers(ensureArray(data));
      }
    } catch (err) {
      console.error("Gagal memuat monitoring aktif:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 10000); // Update setiap 10 detik
    return () => clearInterval(interval);
  }, [fetchActiveUsers]);

  const filteredActive = useMemo(() => {
    return activeUsers.filter(u => {
      const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (u.username || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [activeUsers, searchTerm, filterRole]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Real-time Monitoring DNA</h4>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Pantau aktivitas pengguna yang sedang aktif di sistem.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">{activeUsers.length} ONLINE</span>
          </div>
          <button 
            onClick={fetchActiveUsers}
            className={`p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all ${isLoading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari pengguna aktif..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
          />
        </div>
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
        >
          <option value="all">Semua Peran</option>
          <option value="STUDENT">Siswa</option>
          <option value="TEACHER">Guru</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* DNA Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredActive.length > 0 ? filteredActive.map((user, idx) => {
          const isStudent = user.role === 'STUDENT';
          const lastActivity = new Date(user.last_heartbeat);
          const diffSeconds = Math.floor((Date.now() - lastActivity.getTime()) / 1000);
          const isStale = diffSeconds > 60;

          return (
            <div key={idx} className={`
              bg-white p-6 rounded-[2rem] border transition-all hover:shadow-xl group
              ${isStale ? 'border-amber-100 opacity-70' : 'border-slate-200 shadow-sm'}
            `}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${isStudent ? 'bg-indigo-600' : 'bg-blue-900'}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none truncate max-w-[140px]">{user.name}</h5>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{user.role}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${isStale ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Terakhir</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600">
                    {lastActivity.toLocaleTimeString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600">{user.ip_address || 'Unknown'}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Live Tracking</span>
                 </div>
                 <button className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Detail Sesi</button>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Activity className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tidak ada pengguna aktif yang terdeteksi.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default MonitoringDNA;
