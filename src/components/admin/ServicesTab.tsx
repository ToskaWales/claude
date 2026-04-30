import { useState } from 'react';
import { useApp } from '../../App';
import { generateId } from '../../store';
import type { Service } from '../../types';

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180];

function ServiceForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Service;
  onSave: (s: Omit<Service, 'id'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [duration, setDuration] = useState(String(initial?.duration ?? 30));
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onSave({
      name: name.trim(),
      duration: parseInt(duration),
      price: parseFloat(price),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-rose-50 rounded-xl p-4 border border-rose-100 space-y-3"
    >
      <div>
        <label className="text-xs text-stone-500 mb-1 block font-medium">
          Bezeichnung
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Herrenschnitt"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-700 text-sm focus:border-rose-400 outline-none bg-white"
          required
          autoFocus
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-stone-500 mb-1 block font-medium">
            Dauer
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-700 text-sm focus:border-rose-400 outline-none bg-white"
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} Min.
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-stone-500 mb-1 block font-medium">
            Preis (€)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="25"
            min="0"
            step="0.5"
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-700 text-sm focus:border-rose-400 outline-none bg-white"
            required
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-600 rounded-xl text-sm font-medium transition-colors border border-stone-200"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export default function ServicesTab() {
  const { state, updateState } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  function handleAdd(data: Omit<Service, 'id'>) {
    updateState({
      ...state,
      services: [...state.services, { id: generateId(), ...data }],
    });
    setIsAdding(false);
  }

  function handleEdit(id: string, data: Omit<Service, 'id'>) {
    updateState({
      ...state,
      services: state.services.map((s) => (s.id === id ? { ...s, ...data } : s)),
    });
    setEditingId(null);
  }

  function handleDelete(id: string) {
    const hasActiveBookings = state.bookings.some(
      (b) => b.serviceId === id && b.status === 'confirmed'
    );
    if (hasActiveBookings) {
      alert(
        'Diese Leistung hat noch aktive Buchungen und kann nicht gelöscht werden.'
      );
      return;
    }
    if (!confirm('Leistung wirklich löschen?')) return;
    updateState({
      ...state,
      services: state.services.filter((s) => s.id !== id),
    });
  }

  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-stone-800">
          Leistungen{' '}
          <span className="text-stone-400 font-normal">({state.services.length})</span>
        </h2>
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            + Neue Leistung
          </button>
        )}
      </div>

      {isAdding && (
        <ServiceForm onSave={handleAdd} onCancel={() => setIsAdding(false)} />
      )}

      {state.services.length === 0 && !isAdding ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-100 border-dashed">
          <p className="text-stone-400 text-sm">
            Noch keine Leistungen. Füge deine erste Leistung hinzu.
          </p>
        </div>
      ) : (
        state.services.map((service) =>
          editingId === service.id ? (
            <ServiceForm
              key={service.id}
              initial={service}
              onSave={(data) => handleEdit(service.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm"
            >
              <div>
                <p className="font-semibold text-stone-800">{service.name}</p>
                <p className="text-sm text-stone-500">
                  {service.duration} Min. &middot; {service.price} €
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingId(service.id);
                    setIsAdding(false);
                  }}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors text-sm"
                  title="Bearbeiten"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  title="Löschen"
                >
                  🗑️
                </button>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}
