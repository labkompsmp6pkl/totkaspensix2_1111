import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, maxWidth = 'max-w-2xl', footer }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full ${maxWidth} bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500`}>
        
        {/* Header Modal */}
        <div className="px-8 sm:px-12 py-6 sm:py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{title}</h3>
            <div className="w-12 h-1 bg-blue-600 rounded-full mt-2"></div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="px-8 sm:px-12 py-8 sm:py-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer Modal */}
        {footer && (
          <div className="px-8 sm:px-12 py-6 sm:py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
