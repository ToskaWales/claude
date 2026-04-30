import { createContext, useContext, useEffect, useState } from 'react';
import type { AppState } from './types';
import { loadState, saveState } from './store';
import Header from './components/Header';
import AdminPanel from './components/admin/AdminPanel';
import CustomerView from './components/customer/CustomerView';
import AdminLogin from './components/admin/AdminLogin';

interface AppContextType {
  state: AppState;
  updateState: (newState: AppState) => void;
}

export const AppContext = createContext<AppContextType>(null!);

export function useApp() {
  return useContext(AppContext);
}

export default function App() {
  const [state, setStateRaw] = useState<AppState | null>(null);
  const [view, setView] = useState<'customer' | 'admin'>('customer');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    loadState().then(setStateRaw);
  }, []);

  function updateState(newState: AppState) {
    setStateRaw(newState);
    saveState(newState);
  }

  function handleAdminClick() {
    if (isAdminLoggedIn) {
      setView((v) => (v === 'admin' ? 'customer' : 'admin'));
    } else {
      setShowLoginModal(true);
    }
  }

  function handleLogin(password: string): boolean {
    if (state && password === state.adminPassword) {
      setIsAdminLoggedIn(true);
      setView('admin');
      setShowLoginModal(false);
      return true;
    }
    return false;
  }

  function handleLogout() {
    setIsAdminLoggedIn(false);
    setView('customer');
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Lädt...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, updateState }}>
      <div className="min-h-screen bg-stone-50">
        <Header
          businessName={state.businessName}
          view={view}
          isAdmin={isAdminLoggedIn}
          onAdminClick={handleAdminClick}
          onLogout={handleLogout}
        />
        <main className="max-w-5xl mx-auto px-4 py-8">
          {view === 'customer' ? <CustomerView /> : <AdminPanel />}
        </main>
      </div>
      {showLoginModal && (
        <AdminLogin
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </AppContext.Provider>
  );
}
