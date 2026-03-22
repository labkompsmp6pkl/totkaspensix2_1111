import React, { useState, useEffect } from 'react';
import { QuestionGroup, Question, User, UserRole } from '../../types';
import { ensureArray, parseSafeDate } from '../../utils';
import { ConfigController } from '../../controllers/ConfigController';
import { GroupController } from '../../controllers/GroupController';
import SessionFilters from './sessions/SessionFilters';
import SessionGrid from './sessions/SessionGrid';
import SessionEditor from './sessions/SessionEditor';
import DeleteSessionConfirmation from './sessions/DeleteSessionConfirmation';

interface SessionManagerProps {
  groups: QuestionGroup[];
  questions: Question[];
  users: User[];
  examCode: string;
  activeGroupId: number | null;
  refreshData: () => void;
  API_BASE_URL: string;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  form: Partial<QuestionGroup>;
  setForm: React.Dispatch<React.SetStateAction<Partial<QuestionGroup>>>;
}

const SessionManager: React.FC<SessionManagerProps> = ({ 
  groups, questions, users, examCode, activeGroupId, refreshData, API_BASE_URL,
  showForm, setShowForm, editingId, setEditingId, form, setForm
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);
  const [localExamCode, setLocalExamCode] = useState(examCode);
  const [now, setNow] = useState(Date.now());
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const teacherList = users.filter(u => u.role === UserRole.TEACHER);
  
  const classOptions = React.useMemo(() => {
    const classes = new Set<string>();
    users.forEach(u => {
      if (u.kelas && u.role === UserRole.STUDENT) {
        classes.add(u.kelas.trim().toUpperCase());
      }
    });
    const list = Array.from(classes).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return list.length > 0 ? list : ['8U', '9A', '9B', '9C', '9D', '9E', '9F', '9G', '9Q', '9P'];
  }, [users]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const initialForm: Partial<QuestionGroup> = {
    group_name: '', group_code: '', duration_minutes: 60, extra_time_minutes: 0, is_shuffled: 1, target_classes: [], teacher_ids: []
  };

  const cleanupTeacherAssignments = (currentSelectedClasses: string[]) => {
    const currentTeachers = ensureArray(form.teacher_ids);
    return currentTeachers.map(a => {
      try {
        const obj = JSON.parse(a);
        const filteredClasses = ensureArray(obj.classes).filter(c => currentSelectedClasses.includes(c));
        return JSON.stringify({ ...obj, classes: filteredClasses });
      } catch(e) { return a; }
    });
  };

  const getParsedTeachers = (rawIds: any[]) => {
    return ensureArray(rawIds).map(raw => {
      try {
        const obj = JSON.parse(raw);
        const user = users.find(u => String(u.id) === String(obj.id));
        return { ...obj, name: user?.name || 'Unknown' };
      } catch(e) {
        const user = users.find(u => String(u.id) === String(raw));
        return { id: raw, classes: [], name: user?.name || 'Unknown' };
      }
    });
  };

  const getTeacherAssignment = (teacherId: string) => {
    const assignments = ensureArray(form.teacher_ids);
    const found = assignments.find(a => {
      try { return String(JSON.parse(a).id) === String(teacherId); }
      catch(e) { return String(a) === String(teacherId); }
    });
    if (!found) return null;
    try {
      const parsed = JSON.parse(found);
      return { id: parsed.id, classes: ensureArray(parsed.classes) };
    } catch(e) { return { id: found, classes: [] }; }
  };

  const toggleTeacherClass = (teacherId: string, className: string) => {
    const currentAssignments = [...ensureArray(form.teacher_ids)];
    const index = currentAssignments.findIndex(a => {
      try { return String(JSON.parse(a).id) === String(teacherId); }
      catch(e) { return String(a) === String(teacherId); }
    });

    if (index === -1) {
      currentAssignments.push(JSON.stringify({ id: teacherId, classes: [className] }));
    } else {
      let data;
      try { data = JSON.parse(currentAssignments[index]); }
      catch(e) { data = { id: teacherId, classes: [] }; }
      const classes = ensureArray(data.classes).map((c: string) => c.toUpperCase());
      const target = className.toUpperCase();
      data.classes = classes.includes(target) ? classes.filter((c: string) => c !== target) : [...classes, target];
      currentAssignments[index] = JSON.stringify(data);
    }
    setForm({ ...form, teacher_ids: currentAssignments });
  };

  const toggleTeacherSelection = (teacherId: string) => {
    const currentAssignments = ensureArray(form.teacher_ids);
    const isAssigned = currentAssignments.some(a => {
      try { return String(JSON.parse(a).id) === String(teacherId); }
      catch(e) { return String(a) === String(teacherId); }
    });
    if (isAssigned) {
      setForm({ ...form, teacher_ids: currentAssignments.filter(a => {
        try { return String(JSON.parse(a).id) !== String(teacherId); }
        catch(e) { return String(a) !== String(teacherId); }
      })});
    } else {
      setForm({ ...form, teacher_ids: [...currentAssignments, JSON.stringify({ id: teacherId, classes: [] })] });
    }
  };

  const getRemainingTimeData = (g: QuestionGroup) => {
    if (!g.last_started_at) return { text: "-", isExpired: false, start: null, end: null };
    const startObj = parseSafeDate(g.last_started_at);
    if (!startObj) return { text: "-", isExpired: false, start: null, end: null };
    const start = startObj.getTime();
    const totalMinutes = (Number(g.duration_minutes) || 0) + (Number(g.extra_time_minutes) || 0);
    const end = start + (totalMinutes * 60 * 1000);
    const rem = end - now;
    const formatH = (d: number) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (rem <= 0) return { text: "HABIS", isExpired: true, start: formatH(start), end: formatH(end) };
    const h = Math.floor(rem / 3600000);
    const m = Math.floor((rem % 3600000) / 60000);
    const s = Math.floor((rem % 60000) / 1000);
    let timeStr = "";
    if (h > 0) timeStr += `${h}j `;
    timeStr += `${m}m ${s}s`;
    return { text: timeStr, isExpired: false, start: formatH(start), end: formatH(end) };
  };

  const handleToggleGroup = async (gid: number, currentStatus: boolean) => {
    setIsUpdatingConfig(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('tka_user') || '{}');
      const res = await GroupController.toggleStatus({ group_id: gid, status: currentStatus ? 'STOP' : 'START', performer_id: currentUser.id });
      if (!res.success) alert("Gagal mengubah status sesi: " + (res.message || "Terjadi kesalahan."));
      refreshData();
    } catch (e: any) { alert("Error: " + e.message); } finally { setIsUpdatingConfig(false); }
  };

  const handleSaveGroup = async () => {
    if (!form.group_name || !form.group_code) return alert("Nama dan Kode Sesi wajib diisi!");
    setIsSaving(true);
    try {
      const res = await GroupController.save({ ...form, id: editingId });
      if (res.success) { setShowForm(false); refreshData(); } else alert("Gagal menyimpan: " + (res.message || "Terjadi kesalahan pada server."));
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await GroupController.delete(deleteConfirmId);
    setDeleteConfirmId(null); refreshData();
  };

  return (
    <div className="space-y-6">
      <SessionFilters 
        examCode={examCode}
        localExamCode={localExamCode}
        setLocalExamCode={setLocalExamCode}
        isUpdatingConfig={isUpdatingConfig}
        onUpdateConfig={async () => { setIsUpdatingConfig(true); await ConfigController.update({ exam_code: localExamCode }); refreshData(); setIsUpdatingConfig(false); }}
      />
      <SessionGrid 
        groups={groups}
        questions={questions}
        getRemainingTimeData={getRemainingTimeData}
        getParsedTeachers={getParsedTeachers}
        isUpdatingConfig={isUpdatingConfig}
        onToggle={handleToggleGroup}
        onEdit={(group) => { setEditingId(group.id); setForm({...group, target_classes: ensureArray(group.target_classes), teacher_ids: ensureArray(group.teacher_ids)}); setShowForm(true); }}
        onDelete={setDeleteConfirmId}
      />
      {showForm && <SessionEditor form={form} setForm={setForm} classOptions={classOptions} teacherList={teacherList} isSaving={isSaving} onSave={handleSaveGroup} onClose={() => setShowForm(false)} cleanupTeacherAssignments={cleanupTeacherAssignments} getTeacherAssignment={getTeacherAssignment} toggleTeacherSelection={toggleTeacherSelection} toggleTeacherClass={toggleTeacherClass} />}
      {deleteConfirmId && <DeleteSessionConfirmation onCancel={() => setDeleteConfirmId(null)} onConfirm={handleDelete} />}
    </div>
  );
};


export default SessionManager;
