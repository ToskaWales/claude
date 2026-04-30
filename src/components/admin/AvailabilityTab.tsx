import { useState } from 'react';
import { useApp } from '../../App';
import { generateId } from '../../store';
import { formatDate, timeToMinutes, todayStr } from '../../utils';
import type { AvailableBlock } from '../../types';

function MiniCalendar({
  selectedDate,
  onSelectDate,
  datesWithBlocks,
  datesWithBookings,
}: {
  selectedDate: string;
  onSelectDate: (d: string) => void;
  datesWithBlocks: Set<string>;
  datesWithBookings: Set<string>;
}) {
  const [calMonth, setCalMonth] = useState<Date>(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
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
    <div>
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
          const isSelected = date === selectedDate;
          const hasBlocks = datesWithBlocks.has(date);
          const hasBookings = datesWithBookings.has(date);

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-rose-600 text-white'
                  : 'hover:bg-stone-100 text-stone-700'
              }`}
            >
              {Number(date.split('-')[2])}
              {hasBlocks && (
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected ? 'bg-white/70' : hasBookings ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Verfügbar
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Gebucht
        </span>
      </div>
    </div>
  );
}

export default function AvailabilityTab() {
  const { state, updateState } = useApp();
  const today = todayStr();

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('13:00');
  const [addError, setAddError] = useState('');

  const blocksForDate = state.blocks
    .filter((b) => b.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const bookingsForDate = state.bookings.filter(
    (b) => b.date === selectedDate && b.status === 'confirmed'
  );

  const datesWithBlocks = new Set(state.blocks.map((b) => b.date));
  const datesWithBookings = new Set(
    state.bookings
      .filter((b) => b.status === 'confirmed')
      .map((b) => b.date)
  );

  function handleAddBlock() {
    setAddError('');
    const nStart = timeToMinutes(newStart);
    const nEnd = timeToMinutes(newEnd);

    if (nStart >= nEnd) {
      setAddError('Startzeit muss vor der Endzeit liegen.');
      return;
    }
    if (nEnd - nStart < 30) {
      setAddError('Block muss mindestens 30 Minuten lang sein.');
      return;
    }

    const overlaps = blocksForDate.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return nStart < bEnd && nEnd > bStart;
    });

    if (overlaps) {
      setAddError('Dieser Zeitraum überschneidet sich mit einem bestehenden Block.');
      return;
    }

    const newBlock: AvailableBlock = {
      id: generateId(),
      date: selectedDate,
      startTime: newStart,
      endTime: newEnd,
    };

    updateState({ ...state, blocks: [...state.blocks, newBlock] });
  }

  function handleDeleteBlock(id: string) {
    const block = state.blocks.find((b) => b.id === id)!;
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);

    const hasBookings = bookingsForDate.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      return bStart >= blockStart && bStart < blockEnd;
    });

    if (hasBookings) {
      alert(
        'Dieser Block enthält noch gebuchte Termine. Bitte zuerst die Buchungen stornieren.'
      );
      return;
    }

    updateState({ ...state, blocks: state.blocks.filter((b) => b.id !== id) });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <h2 className="font-semibold text-stone-800 mb-4">Datum wählen</h2>
        <MiniCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          datesWithBlocks={datesWithBlocks}
          datesWithBookings={datesWithBookings}
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <h2 className="font-semibold text-stone-800 mb-0.5">
          {formatDate(selectedDate)}
        </h2>
        <p className="text-sm text-stone-400 mb-5">
          {blocksForDate.length === 0
            ? 'Keine Verfügbarkeit eingetragen'
            : `${blocksForDate.length} Zeitblock${blocksForDate.length > 1 ? 'e' : ''}`}
        </p>

        <div className="space-y-2 mb-6 min-h-[80px]">
          {blocksForDate.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-stone-300 text-sm bg-stone-50 rounded-xl border border-dashed border-stone-200">
              Noch keine Blöcke für diesen Tag
            </div>
          ) : (
            blocksForDate.map((block) => {
              const blockBookings = bookingsForDate.filter((b) => {
                const bStart = timeToMinutes(b.startTime);
                return (
                  bStart >= timeToMinutes(block.startTime) &&
                  bStart < timeToMinutes(block.endTime)
                );
              });
              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="font-medium text-stone-700 text-sm">
                      {block.startTime} – {block.endTime} Uhr
                    </span>
                    {blockBookings.length > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {blockBookings.length} Buchung{blockBookings.length > 1 ? 'en' : ''}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    title="Block löschen"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-stone-100 pt-5">
          <h3 className="text-sm font-semibold text-stone-700 mb-3">
            Neuen Block hinzufügen
          </h3>
          <div className="flex gap-2 items-end flex-wrap">
            <div className="flex-1 min-w-[100px]">
              <label className="text-xs text-stone-500 mb-1 block">Von</label>
              <input
                type="time"
                value={newStart}
                onChange={(e) => {
                  setNewStart(e.target.value);
                  setAddError('');
                }}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-700 text-sm focus:border-rose-400 outline-none bg-stone-50"
              />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="text-xs text-stone-500 mb-1 block">Bis</label>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => {
                  setNewEnd(e.target.value);
                  setAddError('');
                }}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-700 text-sm focus:border-rose-400 outline-none bg-stone-50"
              />
            </div>
            <button
              onClick={handleAddBlock}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
            >
              + Hinzufügen
            </button>
          </div>
          {addError && (
            <p className="text-red-500 text-xs mt-2">{addError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
