
import React, { useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { ensureArray } from '../../../utils';
import { Edit3, Trash2, Eye, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';

const QuestionCard = React.memo(({ q, idx, groups, groupPointsMap, onPreview, onEdit, onDelete }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const assignedGroups = groups.filter((g: any) => ensureArray(q.group_ids).map(Number).includes(Number(g.id)));
  
  const hasGraphic = (q.text || "").toLowerCase().includes('grafik') || (q.text || "").toLowerCase().includes('gambar') || q.mediaUrl;

  return (
    <div className="question-card h-full flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group/card overflow-visible min-h-0 relative">
      {/* TOP DECORATIVE BAR */}
      <div className="h-2 bg-slate-900 w-full rounded-t-[2.5rem] shrink-0"></div>
      
      <div className="question-card-content p-6 sm:p-8 flex-1 flex flex-col min-h-0 overflow-visible relative">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg group-hover/card:scale-110 transition-transform duration-300">
              {q.sort_order || idx + 1}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">BUTIR SOAL</p>
              <h4 className="font-black text-slate-900 uppercase text-xs mt-1.5 truncate max-w-[140px] italic">{q.subject}</h4>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-tight">{q.points} POIN</span>
            </div>
            <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
              {q.type}
            </span>
          </div>
        </div>

        {/* GRAPHIC AREA */}
        {hasGraphic && (
          <div className="mb-6 w-full aspect-video bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden relative group/graphic shadow-inner">
            {q.mediaUrl ? (
              <img 
                src={q.mediaUrl} 
                className="w-full h-full object-contain p-4" 
                alt="Visual Soal" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <ImageIcon className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase italic tracking-widest">Visual Asset Area</span>
              </div>
            )}
            <div className="absolute inset-0 bg-indigo-600/0 group-hover/graphic:bg-indigo-600/5 transition-colors pointer-events-none"></div>
          </div>
        )}

        {/* QUESTION TEXT AREA */}
        <div className="flex-1 min-h-0 overflow-visible flex flex-col">
          <div className={`relative flex-1 min-h-0 ${isExpanded ? 'overflow-visible' : 'max-h-[200px] overflow-hidden line-clamp-wrapper'}`}>
            <MathJax dynamic>
              <div 
                className={`rendered-question-text text-sm sm:text-base font-semibold text-slate-700 leading-relaxed ${isExpanded ? 'overflow-visible' : 'line-clamp-4 md:line-clamp-6'}`}
                dangerouslySetInnerHTML={{ __html: q.text || '' }} 
              />
            </MathJax>
            {!isExpanded && q.text && q.text.length > 200 && (
              <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
            )}
          </div>
          
          {/* Read More Toggle */}
          {q.text && q.text.length > 200 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black flex items-center gap-2 uppercase tracking-widest transition-all border border-slate-100 hover:border-indigo-100 shadow-sm"
            >
              {isExpanded ? (
                <>Tutup Detail <ChevronUp className="w-3.5 h-3.5" /></>
              ) : (
                <>Baca Selengkapnya <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
          )}
        </div>

        {/* DISTRIBUTION SECTION */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Distribusi Sesi</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {assignedGroups.map((g: any) => (
              <div key={g.id} className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden transition-all hover:border-indigo-300 hover:shadow-md">
                <div className="px-3 py-1.5 text-[10px] font-black text-slate-600 border-r border-slate-100">{g.group_name}</div>
                <div className="px-3 py-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50/30">Σ {groupPointsMap[Number(g.id)] || 0}</div>
              </div>
            ))}
            {assignedGroups.length === 0 && (
              <div className="flex items-center gap-2.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[10px] font-black uppercase italic tracking-wider">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                Belum Terdistribusi
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 mt-auto rounded-b-[2.5rem]">
        <button 
          onClick={() => onPreview(q)} 
          className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 hover:-translate-y-0.5"
        >
          <Eye className="w-4 h-4" />
          TINJAU
        </button>
        <div className="flex gap-2">
          <button 
            onClick={(e) => { console.log("Edit clicked for question:", q.id); e.stopPropagation(); onEdit(q); }} 
            className="w-12 h-12 flex items-center justify-center bg-white text-slate-600 rounded-2xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
            title="Edit Soal"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { console.log("Delete clicked for question:", q.id); e.stopPropagation(); onDelete(q.id); }} 
            className="w-12 h-12 flex items-center justify-center bg-white text-red-500 rounded-2xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 shadow-sm"
            title="Hapus Soal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default QuestionCard;
