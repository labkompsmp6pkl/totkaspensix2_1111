import React from 'react';

interface DeleteUserConfirmationProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteUserConfirmation: React.FC<DeleteUserConfirmationProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[6000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6 border-4 border-white animate-in zoom-in-95">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">⚠️</div>
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase italic leading-tight">Hapus Akun?</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 leading-relaxed">
            Akun ini akan dipindahkan ke tempat sampah dan tidak dapat mengakses sistem.
          </p>
        </div>
        <div className="flex gap-3 pt-4">
          <button 
            onClick={onCancel} 
            className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all"
          >
            BATAL
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
          >
            YA, HAPUS
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserConfirmation;
