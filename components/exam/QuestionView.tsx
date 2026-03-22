import React from 'react';
import { Question, ExamSession } from '../../types';
import MediaRenderer from './MediaRenderer';
import { MathJax } from 'better-react-mathjax';
import { ensureArray } from '../../utils';

interface QuestionViewProps {
  question: Question;
  activeSession: ExamSession;
  onSingleSelect: (qId: string, optId: string) => void;
  onMultipleSelect: (qId: string, optId: string) => void;
  onTableSelect: (qId: string, stId: string, choice: string) => void;
  onToggleUncertain: (qId: string) => void;
  isUncertain: boolean;
}

const QuestionView: React.FC<QuestionViewProps> = ({ 
  question, 
  activeSession, 
  onSingleSelect, 
  onMultipleSelect, 
  onTableSelect,
  onToggleUncertain,
  isUncertain
}) => {
  const currentAnswer = activeSession.answers[question.id];

  const renderFormattedText = (text: string) => {
    if (!text) return null;

    if (!text.includes('[MEDIA]')) {
      return (
        <div className={`w-full mb-4 sm:mb-6 text-left p-4 rounded-2xl transition-all ${isUncertain ? 'bg-amber-50 border-2 border-amber-200' : ''}`}>
          {isUncertain && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🚩</span>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">Soal Ditandai Ragu-Ragu</span>
            </div>
          )}
          <MathJax dynamic className="text-sm sm:text-lg font-semibold text-slate-800 leading-relaxed prose prose-slate max-w-none rendered-question-text">
            <div dangerouslySetInnerHTML={{ __html: text }} />
          </MathJax>
          <MediaRenderer url={question.mediaUrl} className="w-full" />
        </div>
      );
    }

    const parts = text.split('[MEDIA]');
    return (
      <div className={`w-full mb-4 sm:mb-6 text-left space-y-4 p-4 rounded-2xl transition-all ${isUncertain ? 'bg-amber-50 border-2 border-amber-200' : ''}`}>
        {isUncertain && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚩</span>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">Soal Ditandai Ragu-Ragu</span>
          </div>
        )}
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <MathJax dynamic className="text-sm sm:text-lg font-semibold text-slate-800 leading-relaxed prose prose-slate max-w-none inline-block w-full text-left rendered-question-text">
              <div dangerouslySetInnerHTML={{ __html: part }} />
            </MathJax>
            {index < parts.length - 1 && <MediaRenderer url={question.mediaUrl} className="w-full my-6" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-start">
      {/* TEKS SOAL */}
      <div className="w-full">
        {renderFormattedText(question.text)}
        
        {question.type === 'multiple' && (
          <div className="mt-2 mb-4 flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 w-fit">
            <span className="text-xs">💡</span>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight">
              Pilih beberapa jawaban yang menurut Anda benar
            </span>
          </div>
        )}
      </div>
      
      {/* PILIHAN JAWABAN */}
      <div className="w-full mt-2">
        {question.type === 'single' || question.type === 'multiple' ? (
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {question.options?.map(opt => {
              const isSelected = question.type === 'single' 
                ? currentAnswer === opt.id 
                : ensureArray(currentAnswer).includes(opt.id);

              return (
                <button 
                  key={opt.id}
                  type="button"
                  onClick={() => question.type === 'single' ? onSingleSelect(question.id, opt.id) : onMultipleSelect(question.id, opt.id)}
                  className={`text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all group relative flex flex-col gap-2 ${isSelected ? 'bg-blue-50 border-blue-900 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-100'}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-all ${
                      isSelected 
                        ? 'bg-blue-900 border-blue-900 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-400 font-bold'
                    }`}>
                      <span className="text-[9px] sm:text-xs uppercase">{opt.id}</span>
                    </div>
                    
                    <div className="flex-1">
                       <MathJax dynamic className={`text-xs sm:text-base transition-colors block rendered-question-text ${isSelected ? 'font-black text-blue-900' : 'font-semibold text-slate-600'}`}>
                          <div dangerouslySetInnerHTML={{ __html: opt.text }} />
                       </MathJax>
                    </div>

                    <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-900 border-blue-900' : 'border-slate-100 bg-slate-50'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                  </div>
                  
                  {opt.mediaUrl && (
                    <div className="w-full flex justify-center">
                       <MediaRenderer url={opt.mediaUrl} className="!my-1 !rounded-lg max-w-xs" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white overflow-x-auto">
            <table className="w-full text-left min-w-[500px] border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-3 sm:p-4">Pernyataan</th>
                  {(question.tableOptions || ['SESUAI', 'TIDAK SESUAI']).map((opt, idx) => (
                    <th key={idx} className="p-3 sm:p-4 text-center w-20 sm:w-28 uppercase font-black text-blue-900">{opt}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(question.statements || []).map(st => (
                  <tr key={st.id} className="hover:bg-blue-50/10 transition-colors">
                    <td className="p-3 sm:p-4">
                       <div className="flex flex-col gap-2">
                          <MathJax dynamic className="text-slate-700 font-bold text-xs sm:text-base leading-snug rendered-question-text">
                            <div dangerouslySetInnerHTML={{ __html: st.text }} />
                          </MathJax>
                          {st.mediaUrl && (
                             <div className="max-w-[200px]">
                                <MediaRenderer url={st.mediaUrl} className="!my-0 !rounded-lg" />
                             </div>
                          )}
                       </div>
                    </td>
                    {(question.tableOptions || ['SESUAI', 'TIDAK SESUAI']).map((opt, idx) => {
                      // PERBAIKAN: Robust Comparison untuk seleksi siswa (Case-Insensitive & Trim)
                      const ansValue = String(currentAnswer?.[st.id] || '').trim().toUpperCase();
                      const optValue = String(opt || '').trim().toUpperCase();
                      const isSelected = ansValue === optValue && ansValue !== '';
                      
                      return (
                        <td key={idx} className="p-3 sm:p-4 text-center">
                          <button 
                            type="button"
                            onClick={() => onTableSelect(question.id, st.id, opt)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 flex items-center justify-center mx-auto transition-all active:scale-90 ${
                                isSelected 
                                ? 'bg-blue-900 border-blue-900 text-white shadow-lg ring-4 ring-blue-100' 
                                : 'bg-white border-slate-100 hover:border-blue-200'
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full transition-all ${isSelected ? 'bg-white scale-125' : 'bg-slate-100'}`}></div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionView;