
import React from 'react';
import { Question, QuestionGroup } from '../../../types';
import QuestionCard from '../questions/QuestionCard';
import QuestionGrid from '../questions/QuestionGrid';

interface QuestionListProps {
  questions: Question[];
  groups: QuestionGroup[];
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
  viewMode: 'list' | 'grid';
  groupPointsMap: Record<number, number>;
  onPreview: (q: Question) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ 
  questions, groups, onEdit, onDelete, viewMode, groupPointsMap, onPreview 
}) => {
  if (questions.length === 0) {
    return (
      <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Tidak ada soal yang ditemukan</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <QuestionGrid 
        questions={questions} 
        groups={groups} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        groupPointsMap={groupPointsMap}
        onPreview={onPreview}
      />
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <QuestionCard 
          key={q.id} 
          q={q} 
          idx={idx}
          groups={groups} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          groupPointsMap={groupPointsMap}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};

export default QuestionList;
