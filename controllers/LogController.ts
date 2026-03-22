
import { Database } from '../core/Database';
import { Response } from '../core/Response';
import { API_BASE_URL } from '../utils';

const API_URL = API_BASE_URL;

export const LogController = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_access_logs`);
      const data = await res.json();
      return Response.json(data);
    } catch (e) {
      return Response.json([]);
    }
  },
  logActivity: async (input: { user_id: string | number; group_id: string | number; details?: string }) => {
    try {
      const res = await fetch(`${API_URL}?action=log_activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },
  getResetLogs: async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_reset_logs`);
      const data = await res.json();
      return Response.json(data);
    } catch (e) {
      return Response.json([]);
    }
  },
  getActiveMonitoring: async (params: any) => {
    try {
      const res = await fetch(`${API_URL}?action=get_active_monitoring&group_id=${params.group_id}`);
      return await res.json();
    } catch (e) {
      return Response.json({ ongoing: [], finished: [] });
    }
  },
  getSessionEvents: async (gid: number | string) => {
    try {
      const res = await fetch(`${API_URL}?action=get_session_events&group_id=${gid}`);
      return await res.json();
    } catch (e) {
      return Response.json([]);
    }
  }
};
