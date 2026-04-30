interface HeaderProps {
  businessName: string;
  view: 'customer' | 'admin';
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
}

export default function Header({ businessName, view, isAdmin, onAdminClick, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            ✂
          </div>
          <span className="font-semibold text-stone-800 text-lg leading-tight">
            {businessName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onAdminClick}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'admin'
                  ? 'bg-rose-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {view === 'admin' ? 'Zur Buchung' : 'Verwaltung'}
            </button>
          )}
          {isAdmin ? (
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Abmelden
            </button>
          ) : (
            <button
              onClick={onAdminClick}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
