import { useApp } from '../../App';
import { formatDate, todayStr } from '../../utils';
import type { Booking, Service } from '../../types';

function statusBadge(booking: Booking, isPast: boolean) {
  if (booking.status === 'cancelled') {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 font-medium">Storniert</span>;
  }
  if (isPast) {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium">Vergangen</span>;
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Bestätigt</span>;
}

function BookingCard({
  booking,
  service,
  onCancel,
}: {
  booking: Booking;
  service: Service | undefined;
  onCancel: () => void;
}) {
  const today = todayStr();
  const isPast = booking.date < today;
  const isActive = booking.status === 'confirmed' && !isPast;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isActive
          ? 'bg-white border-stone-200 shadow-sm'
          : 'bg-stone-50 border-stone-100 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {statusBadge(booking, isPast)}
            <span className="text-sm font-semibold text-stone-700">
              {formatDate(booking.date)} · {booking.startTime}–{booking.endTime} Uhr
            </span>
          </div>
          <p className="font-semibold text-stone-800">{booking.customerName}</p>
          <p className="text-sm text-stone-500">{booking.customerPhone}</p>
          {service && (
            <p className="text-sm text-stone-500 mt-0.5">
              {service.name} · {service.price} €
            </p>
          )}
          {booking.notes && (
            <p className="text-sm text-stone-400 italic mt-1.5">
              &ldquo;{booking.notes}&rdquo;
            </p>
          )}
        </div>
        {isActive && (
          <button
            onClick={onCancel}
            className="flex-shrink-0 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            Stornieren
          </button>
        )}
      </div>
    </div>
  );
}

export default function BookingsTab() {
  const { state, updateState } = useApp();
  const today = todayStr();

  const upcoming = state.bookings
    .filter((b) => b.date >= today && b.status === 'confirmed')
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  const past = state.bookings
    .filter((b) => b.date < today || b.status === 'cancelled')
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));

  function cancelBooking(bookingId: string) {
    if (!confirm('Termin wirklich stornieren?')) return;
    updateState({
      ...state,
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ),
    });
  }

  function getService(serviceId: string): Service | undefined {
    return state.services.find((s) => s.id === serviceId);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-semibold text-stone-800 mb-3">
          Kommende Termine{' '}
          <span className="text-stone-400 font-normal">({upcoming.length})</span>
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-stone-100">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-stone-400">Keine anstehenden Termine.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                service={getService(booking.serviceId)}
                onCancel={() => cancelBooking(booking.id)}
              />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-semibold text-stone-800 mb-3">
            Vergangene & stornierte Termine{' '}
            <span className="text-stone-400 font-normal">({past.length})</span>
          </h2>
          <div className="space-y-2">
            {past.slice(0, 30).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                service={getService(booking.serviceId)}
                onCancel={() => cancelBooking(booking.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
