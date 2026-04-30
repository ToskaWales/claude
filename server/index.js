import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');

const defaultState = {
  businessName: 'Haarschnitt Atelier',
  adminPassword: 'admin123',
  services: [
    { id: '1', name: 'Herrenschnitt', duration: 30, price: 25 },
    { id: '2', name: 'Damenschnitt', duration: 60, price: 45 },
    { id: '3', name: 'Haarfarbe', duration: 90, price: 75 },
    { id: '4', name: 'Kinderschnitt (bis 12 J.)', duration: 30, price: 18 },
    { id: '5', name: 'Strähnen', duration: 120, price: 95 },
  ],
  blocks: [],
  bookings: [],
};

function readData() {
  if (!existsSync(DATA_FILE)) return defaultState;
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/state', (_req, res) => {
  res.json(readData());
});

app.put('/api/state', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid body' });
  }
  writeData(req.body);
  res.json({ ok: true });
});

// Serve built frontend in production
app.use(express.static(join(__dirname, '../dist')));
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
