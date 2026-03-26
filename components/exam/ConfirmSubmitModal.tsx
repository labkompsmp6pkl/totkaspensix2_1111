import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import Modal from '../Modal';

interface ConfirmSubmitModalProps {
  answeredCount: number;
  totalQuestions: number;
  uncertainCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const ConfirmSubmitModal: React.FC<ConfirmSubmitModalProps> = ({ 
  answeredCount, 
  totalQuestions, 
  uncertainCount,
  isSubmitting,
  onSubmit,
  onCancel
}) => {
  const isComplete = answeredCount === totalQuestions;

  return (
    <Modal onClose={onCancel} title="Konfirmasi Selesai Ujian" maxWidth="md">
      <div className="p-8 text-center">
        <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-8 ${
          isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {isComplete ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
        </div>
        
        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
          {isComplete ? 'Yakin Ingin Selesai?' : 'Belum Semua Terjawab!'}
        </h3>
        
        <p className="text-slate-500 font-medium leading-relaxed mb-8">
          {isComplete 
            ? 'Anda telah menjawab seluruh pertanyaan. Pastikan kembali jawaban Anda sebelum mengirim.' 
            : `Anda baru menjawab ${answeredCount} dari ${totalQuestions} soal. Apakah Anda yakin ingin mengakhiri ujian sekarang?`}
          {uncertainCount > 0 && (
            <span className="block mt-2 text-amber-600 font-bold">
              Perhatian: Masih ada {uncertainCount} soal yang ditandai ragu-ragu.
            </span>
          )}
        </p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-10">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Jawaban</span>
              <span className="text-xs font-black text-slate-900">{Math.round((answeredCount/totalQuestions)*100)}%</span>
           </div>
           <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${(answeredCount/totalQuestions)*100}%` }}
              ></div>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Periksa Kembali
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`flex-1 px-8 py-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all disabled:opacity-50 ${
              isComplete ? 'bg-emerald-600 shadow-emerald-100' : 'bg-amber-600 shadow-amber-100'
            }`}
          >
            {isSubmitting ? 'Mengirim...' : 'Ya, Selesai'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmSubmitModal;
