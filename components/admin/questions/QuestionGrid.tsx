
import React from 'react';
import QuestionCard from './QuestionCard';

interface QuestionGridProps {
  questions: any[];
  groups: any[];
  groupPointsMap: Record<number, number>;
  onPreview: (q: any) => void;
  onEdit: (q: any) => void;
  onDelete: (id: string) => void;
}

const QuestionGrid: React.FC<QuestionGridProps> = ({
  questions,
  groups,
  groupPointsMap,
  onPreview,
  onEdit,
  onDelete
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 items-stretch auto-rows-fr">
       {questions.map((q: any, idx) => (
          <div key={q.id} className="h-full min-h-0">
            <QuestionCard 
              q={q} 
              idx={idx} 
              groups={groups} 
              groupPointsMap={groupPointsMap} 
              onPreview={onPreview} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          </div>
       ))}
       {questions.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-[3rem] border border-dashed border-slate-200">
             <div className="text-6xl opacity-20">🔍</div>
             <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Tidak ada butir soal yang ditemukan...</p>
          </div>
       )}
    </div>
  );
};

export default QuestionGrid;
