import { useState } from 'react';
import { useApp } from '../../App';
import { generateId } from '../../store';
import {
  formatDate,
  getAvailableStartTimes,
  getDatesWithAvailability,
  minutesToTime,
  timeToMinutes,
  todayStr,
} from '../../utils';
import type { Booking, Service } from '../../types';

type Step = 'service' | 'date' | 'time' | 'details' | 'confirmation';

const STEP_LABELS = ['Leistung', 'Datum', 'Uhrzeit', 'Details'];

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ['service', 'date', 'time', 'details'];
  const current = steps.indexOf(step);
  if (step === 'confirmation') return null;

  return (
    <div className="flex items-center justify-center mb-8">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                current === i
                  ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                  : current > i
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              {current > i ? '✓' : i + 1}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                current === i ? 'text-stone-800' : 'text-stone-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`w-8 sm:w-14 h-0.5 mx-2 transition-colors ${
                current > i ? 'bg-rose-200' : 'bg-stone-100'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors"
    >
      ← Zurück
    </button>
  );
}

function BookingCalendar({
  availableDates,
  selectedDate,
  onSelect,
}: {
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelect: (d: string) => void;
}) {
  const today = todayStr();
  const [calMonth, setCalMonth] = useState<Date>(() => {
    const sorted = [...availableDates].sort();
    if (sorted.length > 0) {
      const [y, m] = sorted[0].split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;

  const days: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(
      `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm max-w-xs mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCalMonth(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 font-bold"
        >
          ‹
        </button>
        <span className="font-semibold text-stone-700 text-sm">
          {firstDay.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCalMonth(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 font-bold"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-stone-400 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          if (!date) return <div key={i} />;
          const isAvailable = availableDates.has(date);
          const isPast = date < today;
          const isSelected = date === selectedDate;

          return (
            <button
              key={date}
              onClick={() => isAvailable && !isPast && onSelect(date)}
              disabled={!isAvailable || isPast}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                ${isSelected ? 'bg-rose-600 text-white ring-2 ring-rose-300' : ''}
                ${isAvailable && !isPast && !isSelected
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer font-semibold'
                  : ''}
                ${(!isAvailable || isPast) && !isSelected
                  ? 'text-stone-300 cursor-not-allowed'
                  : ''}
              `}
            >
              {Number(date.split('-')[2])}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 mt-3 text-center">
        Markierte Tage haben freie Termine
      </p>
    </div>
  );
}

export default function CustomerView() {
  const { state, updateState } = useApp();

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingRef, setBookingRef] = useState('');

  function reset() {
    setStep('service');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setName('');
    setPhone('');
    setNotes('');
    setBookingRef('');
  }

  function handleServiceSelect(service: Service) {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep('date');
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep('time');
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setStep('details');
  }

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !name.trim() || !phone.trim()) return;

    const endTime = minutesToTime(timeToMinutes(selectedTime) + selectedService.duration);
    const booking: Booking = {
      id: generateId(),
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      serviceId: selectedService.id,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      notes: notes.trim(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    updateState({ ...state, bookings: [...state.bookings, booking] });
    setBookingRef(booking.id.toUpperCase().slice(-6));
    setStep('confirmation');
  }

  const availableDates =
    selectedService != null
      ? new Set(
          getDatesWithAvailability(
            state.blocks,
            state.bookings,
            selectedService.duration,
            todayStr()
          )
        )
      : new Set<string>();

  const availableTimes =
    selectedService && selectedDate
      ? getAvailableStartTimes(selectedDate, selectedService.duration, state.blocks, state.bookings)
      : [];

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator step={step} />

      {/* Step 1: Service selection */}
      {step === 'service' && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              Termin online buchen
            </h2>
            <p className="text-stone-500">
              Wähle die gewünschte Leistung aus.
            </p>
          </div>
          {state.services.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-100">
              <p className="text-4xl mb-3">✂️</p>
              <p className="text-stone-400">Zurzeit sind keine Leistungen verfügbar.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {state.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="flex items-center justify-between p-5 bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-rose-300 hover:shadow-md transition-all text-left group"
                >
                  <div>
                    <p className="font-semibold text-stone-800 text-lg group-hover:text-rose-700 transition-colors">
                      {service.name}
                    </p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {service.duration} Minuten
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-stone-700">
                      {service.price} €
                    </span>
                    <span className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-rose-100 flex items-center justify-center text-stone-400 group-hover:text-rose-600 transition-colors">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Date selection */}
      {step === 'date' && selectedService && (
        <div>
          <BackButton
            onClick={() => setStep('service')}
          />
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-stone-800 mb-1">
              Datum wählen
            </h2>
            <p className="text-stone-500 text-sm">
              {selectedService.name} &middot; {selectedService.duration} Min. &middot;{' '}
              {selectedService.price} €
            </p>
          </div>
          {availableDates.size === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-100 max-w-xs mx-auto">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-stone-600 font-medium">Keine freien Termine</p>
              <p className="text-sm text-stone-400 mt-1">
                Bitte schaue später wieder vorbei.
              </p>
            </div>
          ) : (
            <BookingCalendar
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
            />
          )}
        </div>
      )}

      {/* Step 3: Time selection */}
      {step === 'time' && selectedDate && selectedService && (
        <div>
          <BackButton onClick={() => setStep('date')} />
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-stone-800 mb-1">
              Uhrzeit wählen
            </h2>
            <p className="text-stone-500 text-sm">{formatDate(selectedDate)}</p>
          </div>
          {availableTimes.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              Keine freien Zeiten mehr für diesen Tag.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-sm mx-auto sm:max-w-none">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-rose-400 hover:bg-rose-50 hover:shadow-md transition-all font-semibold text-stone-700 hover:text-rose-700 text-sm"
                >
                  {time} Uhr
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Details form */}
      {step === 'details' && selectedService && selectedDate && selectedTime && (
        <div>
          <BackButton onClick={() => setStep('time')} />
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-stone-800 mb-1">
              Deine Kontaktdaten
            </h2>
            <p className="text-stone-500 text-sm">
              Fast geschafft! Nur noch deine Daten eingeben.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vor- und Nachname"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:border-rose-400 outline-none transition-colors"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                  Telefon <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 170 1234567"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:border-rose-400 outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                  Anmerkungen{' '}
                  <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Besondere Wünsche oder Hinweise..."
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:border-rose-400 outline-none transition-colors resize-none"
                />
              </div>

              <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 space-y-2">
                <h3 className="text-sm font-semibold text-stone-700 mb-1">
                  Zusammenfassung
                </h3>
                {[
                  ['Leistung', selectedService.name],
                  ['Datum', formatDate(selectedDate)],
                  ['Uhrzeit', `${selectedTime} Uhr`],
                  ['Dauer', `${selectedService.duration} Min.`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-stone-500">{label}</span>
                    <span className="font-medium text-stone-700">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-stone-200 mt-1">
                  <span className="text-stone-700">Preis</span>
                  <span className="text-stone-800">{selectedService.price} €</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim() || !phone.trim()}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl font-bold text-base transition-colors"
              >
                Jetzt buchen
              </button>
              <p className="text-xs text-stone-400 text-center">
                Mit der Buchung stimmst du dem Terminierungssystem zu.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Step 5: Confirmation */}
      {step === 'confirmation' && selectedService && selectedDate && selectedTime && (
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              Termin bestätigt!
            </h2>
            <p className="text-stone-500 mb-6">
              Dein Termin wurde erfolgreich gebucht. Bitte erscheine pünktlich.
            </p>

            <div className="bg-stone-50 rounded-xl p-5 text-left space-y-2.5 mb-6 border border-stone-100">
              <div className="flex justify-between text-sm items-center">
                <span className="text-stone-500">Buchungs-Nr.</span>
                <span className="font-mono font-bold text-stone-800 bg-stone-200 px-2 py-0.5 rounded text-xs">
                  #{bookingRef}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Name</span>
                <span className="font-medium text-stone-800">{name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Leistung</span>
                <span className="font-medium text-stone-800">{selectedService.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Datum</span>
                <span className="font-medium text-stone-800">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Uhrzeit</span>
                <span className="font-medium text-stone-800">{selectedTime} Uhr</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-stone-200">
                <span className="text-stone-600">Preis</span>
                <span className="text-stone-800">{selectedService.price} €</span>
              </div>
            </div>

            <p className="text-sm text-stone-400 mb-6">
              Bei Verhinderung bitte rechtzeitig absagen, damit der Termin freigegeben werden kann.
            </p>

            <button
              onClick={reset}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors"
            >
              Weiteren Termin buchen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
