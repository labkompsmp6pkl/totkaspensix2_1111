
import { Response } from '../core/Response';
import { Database } from '../core/Database';
import { API_BASE_URL } from '../utils';

const API_URL = API_BASE_URL;

export const GroupController = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_groups`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      // Gunakan method khusus untuk menyimpan dengan validasi
      Database.saveGroups(Array.isArray(data) ? data : (data.data || []));
      
      return Response.json(data);
    } catch (e) {
      // Fallback ke data lokal jika offline
      const localData = Database.getGroups();
      return Response.json(localData);
    }
  },
  save: async (data: any) => {
    try {
      const res = await fetch(`${API_URL}?action=save_group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const items = Database.getTable('groups');
      if (data.id) {
        const idx = items.findIndex((i: any) => i.id === data.id);
        if (idx !== -1) items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
      } else {
        items.push({ ...data, id: Date.now(), created_at: new Date().toISOString() });
      }
      Database.saveGroups(items);
      return { success: true };
    }
  },
  delete: async (id: number) => {
    try {
      const res = await fetch(`${API_URL}?action=delete_group&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const items = Database.getTable('groups').filter((i: any) => i.id !== id);
      Database.saveGroups(items);
      return { success: true };
    }
  },
  toggleStatus: async (params: { group_id: number, status: 'START' | 'STOP', performer_id: number }) => {
    try {
      const res = await fetch(`${API_URL}?action=toggle_group_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const items = Database.getTable('groups');
      const idx = items.findIndex((i: any) => i.id === params.group_id);
      if (idx !== -1) {
        items[idx] = { 
          ...items[idx], 
          last_started_at: params.status === 'START' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString() 
        };
        Database.saveGroups(items);
      }
      return { success: true };
    }
  }
};
