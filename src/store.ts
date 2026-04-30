import type { AppState } from './types';

const STORAGE_KEY = 'friseur_app_v1';

const defaultState: AppState = {
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

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppState>;
      return { ...defaultState, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return defaultState;
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
