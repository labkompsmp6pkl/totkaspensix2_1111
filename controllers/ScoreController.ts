
import { Response } from '../core/Response';
import { Database } from '../core/Database';
import { API_BASE_URL, robustFetch, toFormData } from '../utils';

const API_URL = API_BASE_URL;

export const ScoreController = {
  submit: async (data: any) => {
    try {
      const res = await robustFetch(`${API_URL}?action=submit_score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: toFormData(data).toString()
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const scores = Database.getTable('scores');
      scores.push({ ...data, id: Date.now(), created_at: new Date().toISOString() });
      Database.saveTable('scores', scores);
      
      const prog = Database.getTable('progress').filter((p: any) => !(p.user_id === data.studentId && p.group_id === data.groupId));
      Database.saveTable('progress', prog);
      return { success: true };
    }
  },
  getAll: async () => {
    try {
      const res = await robustFetch(`${API_URL}?action=get_scores&_t=${Date.now()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      Database.saveTable('scores', data);
      return Response.json(data);
    } catch (e) {
      const localData = Database.getTable('scores');
      return Response.json(localData);
    }
  },
  getHistory: async (params: { user_id?: string | number, group_id?: string | number, _t?: number }) => {
    try {
      const q = new URLSearchParams();
      if (params.user_id) q.append('user_id', params.user_id.toString());
      if (params.group_id) q.append('group_id', params.group_id.toString());
      q.append('_t', (params._t || Date.now()).toString());
      
      const res = await robustFetch(`${API_URL}?action=get_score_history&${q.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return Response.json(data);
    } catch (e) {
      const scores = Database.getTable('scores');
      const filtered = scores.filter((s: any) => {
        let match = true;
        if (params.user_id && s.user_id !== params.user_id) match = false;
        if (params.group_id && s.group_id !== params.group_id) match = false;
        return match;
      });
      return Response.json(filtered);
    }
  },
  reset: async (params: any) => {
    try {
      const res = await robustFetch(`${API_URL}?action=reset_score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: toFormData(params).toString()
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const scores = Database.getTable('scores').filter((s: any) => !(s.user_id === params.user_id && s.group_id === params.group_id));
      Database.saveTable('scores', scores);
      return { success: true };
    }
  }
};
