import type { AppState } from './types';

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

export async function loadState(): Promise<AppState> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Ladefehler');
    const data = await res.json() as Partial<AppState>;
    return { ...defaultState, ...data };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  fetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  }).catch(console.error);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
