// Paksa menggunakan domain lokal agar data selalu sinkron dengan server Node.js
export const API_BASE_URL = "/api.php";

/**
 * Robust Date Parsing
 */
export const parseSafeDate = (dateStr: any): Date | null => {
  if (!dateStr || dateStr === "0000-00-00 00:00:00" || dateStr === "-" || dateStr === "null" || dateStr === "") return null;
  
  try {
    if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
    
    const dateInput = dateStr.toString();
    const normalized = dateInput.replace(/-/g, '/').replace('T', ' ');
    const d = new Date(normalized);
    
    if (isNaN(d.getTime())) {
       return null;
    }
    return d;
  } catch (e) {
    return null;
  }
};

/**
 * Format Tanggal Lengkap: DD MMM YYYY, HH:mm:ss
 */
export const formatFullDateTime = (dateStr: any): string => {
  const date = parseSafeDate(dateStr);
  if (!date) return "-";
  
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\./g, ':');
};

/**
 * Helper untuk mengubah object menjadi URLSearchParams (x-www-form-urlencoded)
 * Berguna untuk melewati firewall yang memblokir JSON body.
 */
export const toFormData = (data: any): URLSearchParams => {
  const params = new URLSearchParams();
  Object.keys(data).forEach(key => {
    const val = data[key];
    if (val === null || val === undefined) return;
    
    if (typeof val === 'object') {
      params.append(key, JSON.stringify(val));
    } else {
      params.append(key, val.toString());
    }
  });
  return params;
};

/**
 * Fetch wrapper yang lebih tangguh terhadap 403 Forbidden
 */
export const robustFetch = async (url: string, options: any = {}) => {
  try {
    const res = await fetch(url, options);
    
    if (res.status === 403) {
      console.error("403 Forbidden detected at:", url);
      return { 
        ok: false, 
        status: 403, 
        json: async () => ({ success: false, message: "Akses Ditolak (403). Periksa ModSecurity atau Izin File di Hosting." }),
        text: async () => "403 Forbidden"
      };
    }
    
    return res;
  } catch (e) {
    console.error("Network error at:", url, e);
    return { 
      ok: false, 
      status: 0, 
      json: async () => ({ success: false, message: "Koneksi Gagal" }),
      text: async () => "Network Error"
    };
  }
};

/**
 * Robust JSON Parsing
 */
export const robustParse = (data: any) => {
  if (data === null || data === undefined) return null;
  if (typeof data !== 'string') return data;
  
  const cleanData = data.trim();
  
  if (cleanData.startsWith('<!DOCTYPE') || cleanData.startsWith('<html') || cleanData.includes('403 Forbidden')) {
    return { 
      success: false, 
      message: "Server Error (403/500). Periksa ModSecurity atau Izin File di Hosting." 
    };
  }

  try {
    const jsonStart = cleanData.indexOf('{');
    const jsonEnd = cleanData.lastIndexOf('}');
    const arrayStart = cleanData.indexOf('[');
    const arrayEnd = cleanData.lastIndexOf(']');

    const isObjectFirst = jsonStart !== -1 && (arrayStart === -1 || jsonStart < arrayStart);

    if (isObjectFirst && jsonEnd !== -1) {
      return JSON.parse(cleanData.substring(jsonStart, jsonEnd + 1));
    } else if (arrayStart !== -1 && arrayEnd !== -1) {
      return JSON.parse(cleanData.substring(arrayStart, arrayEnd + 1));
    }
    
    return JSON.parse(cleanData);
  } catch (e) {
    return null;
  }
};

/**
 * Helper Super Robust untuk memastikan data selalu berupa array.
 * Mencegah error ".includes is not a function"
 */
export const ensureArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data) return [];
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  
  if (typeof data === 'object' && data !== null && Array.isArray((data as any).data)) return (data as any).data;
  
  return [];
};

/**
 * Helper Robust untuk memastikan data berupa object (untuk soal matriks/tabel)
 */
export const ensureObject = (data: any): Record<string, any> => {
  if (data === null || data === undefined) return {};
  if (typeof data === 'object' && !Array.isArray(data)) return data;
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  
  return {};
};