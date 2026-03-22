
import { Database } from '../core/Database';
import { User, UserRole, Question, QuestionGroup } from '../types';

export const AuthController = {
  login: (identifier: string, pass: string) => {
    const users = Database.getTable('users') as User[];
    const user = users.find(u => (u.username === identifier || u.nis === identifier || u.nip === identifier) && u.password === pass);
    if (user) {
      const { password, ...safeUser } = user;
      return { success: true, user: safeUser };
    }
    return { success: false, message: 'ID atau Password salah' };
  }
};

export const QuestionController = {
  getAll: () => Database.getTable('questions') as Question[],
  save: (data: any) => {
    const items = Database.getTable('questions');
    if (data.id) {
      const idx = items.findIndex((i: any) => i.id === data.id);
      items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
    } else {
      items.push({ ...data, id: Date.now().toString(), created_at: new Date().toISOString() });
    }
    Database.saveTable('questions', items);
    return { success: true };
  },
  delete: (id: string) => {
    const items = Database.getTable('questions').filter((i: any) => i.id !== id);
    Database.saveTable('questions', items);
    return { success: true };
  }
};

export const GroupController = {
  getAll: () => Database.getTable('groups') as QuestionGroup[],
  save: (data: any) => {
    const items = Database.getTable('groups');
    if (data.id) {
      const idx = items.findIndex((i: any) => i.id === data.id);
      items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
    } else {
      items.push({ ...data, id: Date.now(), created_at: new Date().toISOString() });
    }
    Database.saveTable('groups', items);
    return { success: true };
  },
  delete: (id: number) => {
    const items = Database.getTable('groups').filter((i: any) => i.id !== id);
    Database.saveTable('groups', items);
    return { success: true };
  }
};

export const ScoreController = {
  getAll: () => Database.getTable('scores'),
  submit: (data: any) => {
    const scores = Database.getTable('scores');
    scores.push({ ...data, id: Date.now(), created_at: new Date().toISOString() });
    Database.saveTable('scores', scores);
    
    // Clear progress after finish
    const prog = Database.getTable('progress').filter((p: any) => !(p.user_id === data.studentId && p.group_id === data.groupId));
    Database.saveTable('progress', prog);
    return { success: true };
  },
  reset: (uid: string, gid: number) => {
    const scores = Database.getTable('scores').filter((s: any) => !(s.user_id === uid && s.group_id === gid));
    Database.saveTable('scores', scores);
    return { success: true };
  }
};
