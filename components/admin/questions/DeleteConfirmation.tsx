
import React from 'react';

interface DeleteConfirmationProps {
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ 
  onCancel, onConfirm, title = "Hapus Butir Soal?", message = "Tindakan ini tidak dapat dibatalkan dan akan menghapus soal dari semua sesi terkait." 
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[4000] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full text-center space-y-6 shadow-2xl border-4 border-white animate-in zoom-in-95">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">⚠️</div>
        <h3 className="text-xl font-black text-blue-900 uppercase italic">{title}</h3>
        <p className="text-sm font-semibold text-slate-500">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-xl font-black uppercase text-[10px]">BATAL</button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-4 bg-red-500 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-red-200 active:scale-95 transition-all"
          >
            YA, HAPUS
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
