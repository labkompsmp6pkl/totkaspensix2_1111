import { Database } from '../core/Database';
import { Response } from '../core/Response';
import { API_BASE_URL, robustParse } from '../utils';

const API_URL = API_BASE_URL;

export const ConfigController = {
  get: async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_config`);
      const raw = await res.text();
      const data = robustParse(raw);
      
      if (data) return data;
      throw new Error("Invalid Response");
    } catch (e) {
      console.warn("Using local config due to API error");
      return Database.getConfig();
    }
  },
  update: async (input: any) => {
    try {
      const formData = new URLSearchParams();
      Object.keys(input).forEach(key => {
        if (input[key] !== null && input[key] !== undefined) {
          formData.append(key, input[key]);
        }
      });

      const res = await fetch(`${API_URL}?action=update_config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Server offline" };
    }
  }
};