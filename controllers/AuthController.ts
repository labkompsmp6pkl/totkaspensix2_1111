import { Database } from '../core/Database';
import { Response } from '../core/Response';
import { API_BASE_URL, robustParse } from '../utils';

const API_URL = API_BASE_URL;

export const AuthController = {
  login: async (input: { identifier: string; password?: string; group_id?: number | null }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      // Gunakan URLSearchParams untuk mengirim data sebagai form-encoded (lebih aman dari blokir firewall)
      const formData = new URLSearchParams();
      formData.append('identifier', input.identifier);
      if (input.password) formData.append('password', input.password);
      if (input.group_id) formData.append('group_id', input.group_id.toString());

      const res = await fetch(`${API_URL}?action=login`, {
        method: 'POST',
        headers: { 
          // Firewall sering curiga dengan application/json. 
          // Menggunakan form-urlencoded adalah cara "stealth" paling ampuh.
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formData.toString(),
        signal: controller.signal
      });
      
      const rawText = await res.text();
      clearTimeout(timeoutId);

      // Tangani respon 403 (Forbidden) secara eksplisit
      if (res.status === 403) {
        return Response.json({ 
          success: false, 
          message: 'Server Memblokir Login (Error 403). Hubungi Admin untuk mematikan ModSecurity di cPanel.' 
        }, 403);
      }

      const data = robustParse(rawText);
      
      if (res.ok && data?.success) {
        const localUsers = Database.getTable('users');
        const existingIdx = localUsers.findIndex((u: any) => u.id === data.user.id);
        const userWithPass = { ...data.user, password: input.password };
        
        if (existingIdx !== -1) {
          localUsers[existingIdx] = userWithPass;
        } else {
          localUsers.push(userWithPass);
        }
        
        Database.saveTable('users', localUsers);
        return Response.json({ success: true, user: data.user });
      } else {
        const errMsg = data?.message || (rawText.includes('<html>') ? 'Server Mengalami Gangguan (HTTP ' + res.status + ')' : 'Identitas atau Kata Sandi salah.');
        return Response.json({ success: false, message: errMsg }, res.status);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
         return Response.json({ success: false, message: 'Waktu Habis (Timeout). Server lambat merespons.' }, 504);
      }

      // Coba Login Offline (Cache) sebagai cadangan
      const localUsers = Database.getTable('users');
      const cached = localUsers.find((u: any) => 
        (u.username === input.identifier || u.nis === input.identifier || u.nip === input.identifier) && 
        u.password === input.password
      );
      
      if (cached) {
        const { password, ...safeUser } = cached;
        return Response.json({ success: true, user: safeUser });
      }

      // Jika gagal total, tampilkan bantuan teknis
      return Response.json({ 
        success: false, 
        message: 'Akses Ditolak Firewall (CORS/SSL). Pastikan domain menggunakan HTTPS dan ModSecurity cPanel OFF.' 
      }, 503);
    }
  }
};