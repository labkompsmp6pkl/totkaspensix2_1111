
import React from 'react';
import SessionCard from './SessionCard';
import { QuestionGroup, Question } from '../../../types';

interface SessionGridProps {
  groups: QuestionGroup[];
  questions: Question[];
  onEdit: (g: QuestionGroup) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

const SessionGrid: React.FC<SessionGridProps> = ({
  groups,
  questions,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {groups.map(g => (
        <SessionCard 
          key={g.id} 
          g={g} 
          questions={questions} 
          onToggleStatus={onToggleStatus}
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};

export default SessionGrid;
