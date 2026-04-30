import { useState } from 'react';
import { useApp } from '../../App';

export default function SettingsTab() {
  const { state, updateState } = useApp();

  const [businessName, setBusinessName] = useState(state.businessName);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) return;
    updateState({ ...state, businessName: businessName.trim() });
    setNameSuccess(true);
    setTimeout(() => setNameSuccess(false), 2500);
  }

  function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (currentPw !== state.adminPassword) {
      setPwError('Das aktuelle Passwort ist falsch.');
      return;
    }
    if (newPw.length < 4) {
      setPwError('Das neue Passwort muss mindestens 4 Zeichen haben.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('Die Passwörter stimmen nicht überein.');
      return;
    }

    updateState({ ...state, adminPassword: newPw });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setPwSuccess(true);
    setTimeout(() => setPwSuccess(false), 2500);
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <h2 className="font-semibold text-stone-800 mb-4">Geschäftsname</h2>
        <form onSubmit={saveName} className="space-y-3">
          <input
            type="text"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setNameSuccess(false);
            }}
            placeholder="Name deines Friseursalons"
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:border-rose-400 outline-none transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors"
          >
            {nameSuccess ? '✓ Gespeichert!' : 'Speichern'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <h2 className="font-semibold text-stone-800 mb-4">Passwort ändern</h2>
        <form onSubmit={savePassword} className="space-y-3">
          <input
            type="password"
            value={currentPw}
            onChange={(e) => {
              setCurrentPw(e.target.value);
              setPwError('');
            }}
            placeholder="Aktuelles Passwort"
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:border-rose-400 outline-none transition-colors"
          />
          <input
            type="password"
            value={newPw}
            onChange={(e) => {
              setNewPw(e.target.value);
              setPwError('');
            }}
            placeholder="Neues Passwort"
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:border-rose-400 outline-none transition-colors"
          />
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => {
              setConfirmPw(e.target.value);
              setPwError('');
            }}
            placeholder="Neues Passwort bestätigen"
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:border-rose-400 outline-none transition-colors"
          />
          {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors"
          >
            {pwSuccess ? '✓ Passwort geändert!' : 'Passwort ändern'}
          </button>
        </form>
      </div>
    </div>
  );
}
