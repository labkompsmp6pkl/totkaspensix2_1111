import React from 'react';

interface RestoreUserConfirmationProps {
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const RestoreUserConfirmation: React.FC<RestoreUserConfirmationProps> = ({
  adminPassword,
  setAdminPassword,
  onCancel,
  onConfirm
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[6000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6 border-4 border-white animate-in zoom-in-95">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">🔄</div>
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase italic leading-tight">Pulihkan Akun?</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 leading-relaxed">
            Masukkan password admin untuk memverifikasi tindakan ini.
          </p>
        </div>
        <input 
          type="password" 
          className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-center outline-none focus:border-emerald-500 transition-all shadow-inner" 
          placeholder="Password Admin" 
          value={adminPassword} 
          onChange={e => setAdminPassword(e.target.value)} 
        />
        <div className="flex gap-3 pt-4">
          <button 
            onClick={onCancel} 
            className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all"
          >
            BATAL
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
          >
            PULIHKAN
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestoreUserConfirmation;
