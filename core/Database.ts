
// Fallback memori jika LocalStorage diblokir oleh kebijakan Iframe/Browser
let memoryStorage: Record<string, string> = {};

export class Database {
  private static KEY = 'tka_smpn6_db_v8';

  private static getRawData() {
    const initial = {
      users: [
        { id: '1', name: 'Administrator', role: 'ADMIN', username: 'admin', password: 'kartiniraya06' }
      ],
      questions: [],
      groups: [],
      scores: [],
      config: { exam_code: 'TKA2026', active_group_id: null },
      logs: [],
      reset_logs: [],
      progress: []
    };

    try {
      const data = window.localStorage.getItem(this.KEY);
      if (!data) {
        // Coba simpan data awal, jika gagal (di iframe), biarkan catch yang menangani
        try { window.localStorage.setItem(this.KEY, JSON.stringify(initial)); } catch(e) {}
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      // Jika di dalam iframe dan localStorage diblokir
      if (memoryStorage[this.KEY]) {
        return JSON.parse(memoryStorage[this.KEY]);
      }
      return initial;
    }
  }

  private static saveRawData(data: any) {
    const stringified = JSON.stringify(data);
    try {
      window.localStorage.setItem(this.KEY, stringified);
    } catch (e) {
      // Simpan ke memori sebagai cadangan jika localStorage gagal (iframe issue)
      memoryStorage[this.KEY] = stringified;
    }
  }

  public static getTable(table: string) {
    return this.getRawData()[table] || [];
  }

  public static saveTable(table: string, data: any[]) {
    const allData = this.getRawData();
    allData[table] = data;
    this.saveRawData(allData);
  }

  /**
   * Method khusus untuk mengambil data groups dengan target_classes yang sudah ter-parse
   */
  public static getGroups(): any[] {
    const groups = this.getTable('groups');
    return groups.map((g: any) => {
      let targets = g.target_classes;
      
      // Jika string JSON, parse dulu
      if (typeof targets === 'string' && (targets.startsWith('[') || targets.startsWith('{'))) {
        try {
          targets = JSON.parse(targets);
        } catch (e) {}
      }
      
      return { ...g, target_classes: targets };
    });
  }

  /**
   * Method khusus untuk menyimpan data groups dengan validasi format
   */
  public static saveGroups(groups: any[]) {
    const validated = groups.map((g: any) => {
      let targets = g.target_classes;
      
      // Pastikan target_classes adalah array jika memungkinkan
      if (typeof targets === 'string') {
        if (targets.startsWith('[') || targets.startsWith('{')) {
          try {
            targets = JSON.parse(targets);
          } catch (e) {}
        } else if (targets.includes(',')) {
          targets = targets.split(',').map(t => t.trim());
        } else if (targets.trim() === '') {
          targets = [];
        } else {
          targets = [targets.trim()];
        }
      }
      
      if (!Array.isArray(targets)) {
        targets = targets ? [targets] : [];
      }
      
      return { ...g, target_classes: targets };
    });
    
    this.saveTable('groups', validated);
  }

  public static getConfig() {
    return this.getRawData().config || { exam_code: 'TKA2026', active_group_id: null };
  }

  public static saveConfig(config: any) {
    const allData = this.getRawData();
    allData.config = config;
    this.saveRawData(allData);
  }

  public static addLog(log: any) {
    const allData = this.getRawData();
    if (!allData.logs) allData.logs = [];
    allData.logs.unshift({ ...log, id: Date.now(), created_at: new Date().toISOString() });
    if (allData.logs.length > 100) allData.logs.pop();
    this.saveRawData(allData);
  }
}
