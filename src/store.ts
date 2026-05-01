import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { AppState } from './types';

const STATE_REF = doc(db, 'app', 'state');

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
    const snap = await getDoc(STATE_REF);
    if (!snap.exists()) return defaultState;
    return { ...defaultState, ...snap.data() } as AppState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  setDoc(STATE_REF, state).catch(console.error);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
