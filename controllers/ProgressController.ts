
import { Response } from '../core/Response';
import { Database } from '../core/Database';
import { API_BASE_URL } from '../utils';

const API_URL = API_BASE_URL;

export const ProgressController = {
  save: async (input: any) => {
    try {
      const res = await fetch(`${API_URL}?action=save_progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const items = Database.getTable('progress');
      const idx = items.findIndex((i: any) => i.user_id === input.user_id && i.group_id === input.group_id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...input, updated_at: new Date().toISOString() };
      } else {
        items.push({ ...input, id: Date.now(), created_at: new Date().toISOString() });
      }
      Database.saveTable('progress', items);
      return { success: true };
    }
  },
  saveTimeLog: async (input: any) => {
    try {
      const res = await fetch(`${API_URL}?action=save_time_log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return { success: true }; // Time logs are less critical for local mode
    }
  },
  getStudentProgress: async (userId: string | number, groupId: string | number) => {
    try {
      const res = await fetch(`${API_URL}?action=get_student_progress_detail&user_id=${userId}&group_id=${groupId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return Response.json(data);
    } catch (e) {
      const items = Database.getTable('progress');
      const found = items.find((i: any) => i.user_id === userId && i.group_id === groupId);
      return Response.json(found || { answers: {}, uncertain: [] });
    }
  },
  getMyProgress: async (userId: string | number) => {
    try {
      const res = await fetch(`${API_URL}?action=get_my_progress&user_id=${userId}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const items = Database.getTable('progress');
      const filtered = items.filter((i: any) => i.user_id === userId);
      return Response.json(filtered);
    }
  }
};
