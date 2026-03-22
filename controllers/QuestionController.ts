
import { Response } from '../core/Response';
import { Database } from '../core/Database';
import { API_BASE_URL } from '../utils';

const API_URL = API_BASE_URL;

export const QuestionController = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_questions`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      Database.saveTable('questions', data); 
      return Response.json(data);
    } catch (e) {
      const localData = Database.getTable('questions');
      return Response.json(localData);
    }
  },
  save: async (data: any) => {
    try {
      const res = await fetch(`${API_URL}?action=save_question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const items = Database.getTable('questions');
      if (data.id) {
        const idx = items.findIndex((i: any) => i.id === data.id);
        if (idx !== -1) items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
      } else {
        items.push({ ...data, id: Date.now().toString(), created_at: new Date().toISOString() });
      }
      Database.saveTable('questions', items);
      return { success: true };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}?action=delete_question&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const items = Database.getTable('questions').filter((i: any) => i.id !== id);
      Database.saveTable('questions', items);
      return { success: true };
    }
  }
};
