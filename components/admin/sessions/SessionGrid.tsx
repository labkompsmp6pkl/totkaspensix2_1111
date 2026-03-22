
import React from 'react';
import SessionCard from './SessionCard';

interface SessionGridProps {
  groups: any[];
  questions: any[];
  getRemainingTimeData: (g: any) => any;
  getParsedTeachers: (ids: any[]) => any[];
  isUpdatingConfig: boolean;
  onToggle: (gid: number, currentStatus: boolean) => void;
  onEdit: (group: any) => void;
  onDelete: (id: number) => void;
}

const SessionGrid: React.FC<SessionGridProps> = ({
  groups,
  questions,
  getRemainingTimeData,
  getParsedTeachers,
  isUpdatingConfig,
  onToggle,
  onEdit,
  onDelete
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {groups.map(g => (
        <SessionCard 
          key={g.id} 
          g={g} 
          questions={questions} 
          isLive={g.last_started_at !== null && !getRemainingTimeData(g).isExpired} 
          timeData={getRemainingTimeData(g)} 
          teachers={getParsedTeachers(g.teacher_ids || [])} 
          isUpdatingConfig={isUpdatingConfig} 
          onToggle={onToggle} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};

export default SessionGrid;
