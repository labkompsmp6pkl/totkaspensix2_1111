
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'db.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    users: [
      { id: '1', name: 'Administrator', role: 'ADMIN', username: 'admin', password: 'kartiniraya06' },
      { id: '2', name: 'Tejo', role: 'STUDENT', username: 'tejo', password: '12345', kelas: '9A', nis: '12345' }
    ],
    questions: [],
    groups: [],
    scores: [],
    config: { exam_code: 'TKA2026', active_group_id: null },
    logs: [],
    progress: [],
    time_logs: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

function getDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.all('/api.php', (req: Request, res: Response) => {
    const action = (req.query.action as string || '').toLowerCase();
    const db = getDB();
    const input = { ...req.query, ...req.body };

    console.log(`[API] Action: ${action}`, input);

    switch (action) {
      case 'login':
        const { identifier, password } = input;
        const user = db.users.find((u: any) => 
          (u.username === identifier || u.nis === identifier || u.nip === identifier) && 
          u.password === password
        );
        if (user) {
          const { password, ...safeUser } = user;
          res.json({ success: true, user: safeUser });
        } else {
          res.json({ success: false, message: 'Identitas atau Kata Sandi salah.' });
        }
        break;

      case 'get_config': res.json(db.config); break;
      case 'update_config':
        db.config = { ...db.config, ...input };
        saveDB(db);
        res.json({ success: true });
        break;

      case 'get_questions': res.json(db.questions); break;
      case 'save_question':
        if (input.id) {
          const idx = db.questions.findIndex((q: any) => q.id === input.id);
          if (idx !== -1) db.questions[idx] = { ...db.questions[idx], ...input };
        } else {
          db.questions.push({ ...input, id: Date.now().toString() });
        }
        saveDB(db);
        res.json({ success: true });
        break;

      case 'get_groups': res.json(db.groups); break;
      case 'save_group':
        if (input.id) {
          const idx = db.groups.findIndex((g: any) => g.id === input.id);
          if (idx !== -1) db.groups[idx] = { ...db.groups[idx], ...input };
        } else {
          db.groups.push({ ...input, id: Date.now().toString() });
        }
        saveDB(db);
        res.json({ success: true });
        break;

      case 'get_scores': res.json(db.scores); break;
      case 'submit_score':
        db.scores.push({ ...input, id: Date.now().toString(), created_at: new Date().toISOString() });
        saveDB(db);
        res.json({ success: true });
        break;

      case 'get_users': res.json(db.users.map(({ password, ...u }: any) => u)); break;
      case 'save_user':
        if (input.id) {
          const idx = db.users.findIndex((u: any) => u.id === input.id);
          if (idx !== -1) db.users[idx] = { ...db.users[idx], ...input };
        } else {
          db.users.push({ ...input, id: Date.now().toString() });
        }
        saveDB(db);
        res.json({ success: true });
        break;

      case 'migrate': res.json({ success: true, message: 'Database Node.js siap.' }); break;
      case 'ping': res.json({ success: true, time: Date.now(), db: 'Connected' }); break;
      case 'log_activity':
        db.logs.unshift({ ...input, id: Date.now(), created_at: new Date().toISOString() });
        if (db.logs.length > 100) db.logs.pop();
        saveDB(db);
        res.json({ success: true });
        break;

      default:
        res.json({ success: true, message: 'Academic Node Online' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
