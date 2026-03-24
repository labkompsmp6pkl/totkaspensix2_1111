
import { Response } from '../core/Response';
import { Database } from '../core/Database';
import { API_BASE_URL, robustFetch, toFormData } from '../utils';

const API_URL = API_BASE_URL;

export const UserController = {
  getAll: async () => {
    try {
      const res = await robustFetch(`${API_URL}?action=get_users`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      Database.saveTable('users', data);
      return Response.json(data);
    } catch (e) {
      const localData = Database.getTable('users');
      return Response.json(localData);
    }
  },
  save: async (input: any) => {
    try {
      const res = await robustFetch(`${API_URL}?action=save_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: toFormData(input).toString()
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const items = Database.getTable('users');
      if (input.id) {
        const idx = items.findIndex((i: any) => i.id === input.id);
        if (idx !== -1) items[idx] = { ...items[idx], ...input, updated_at: new Date().toISOString() };
      } else {
        items.push({ ...input, id: Date.now().toString(), created_at: new Date().toISOString() });
      }
      Database.saveTable('users', items);
      return { success: true };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await robustFetch(`${API_URL}?action=delete_user&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const items = Database.getTable('users').filter((i: any) => i.id !== id);
      Database.saveTable('users', items);
      return { success: true };
    }
  }
};
