import { useState } from 'react';

interface AdminLoginProps {
  onLogin: (password: string) => boolean;
  onClose: () => void;
}

export default function AdminLogin({ onLogin, onClose }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError(true);
      setPassword('');
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1 text-center">
          Admin-Anmeldung
        </h2>
        <p className="text-stone-500 text-sm mb-6 text-center">
          Gib dein Passwort ein, um die Verwaltung zu öffnen.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Passwort"
              className={`w-full px-4 py-3 rounded-xl border text-stone-800 outline-none transition-colors ${
                error
                  ? 'border-red-400 bg-red-50'
                  : 'border-stone-200 focus:border-rose-400 bg-stone-50'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1.5">Falsches Passwort.</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors"
          >
            Anmelden
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-medium transition-colors"
          >
            Abbrechen
          </button>
        </form>
        <p className="text-xs text-stone-300 text-center mt-4">
          Standard-Passwort: admin123
        </p>
      </div>
    </div>
  );
}
