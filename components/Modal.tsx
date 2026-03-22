import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'primary' | 'warning' | 'info';
  hideCancel?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, title, message, confirmLabel, cancelLabel = "Batal", onConfirm, onCancel, type = 'primary', hideCancel = false
}) => {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 shadow-red-100';
      case 'warning': return 'bg-amber-500 shadow-amber-100';
      case 'info': return 'bg-blue-500 shadow-blue-100';
      default: return 'bg-blue-900 shadow-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger': return '🚪';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🚀';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border-b-8 border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-xl ${getTheme()} text-white`}>
            {getIcon()}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed px-4">
              {message}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase text-white shadow-lg active:scale-95 transition-all ${getTheme()}`}
            >
              {confirmLabel}
            </button>
            {!hideCancel && (
              <button 
                onClick={onCancel}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all"
              >
                {cancelLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;