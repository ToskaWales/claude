import type { AvailableBlock, Booking } from './types';

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getAvailableStartTimes(
  date: string,
  serviceDuration: number,
  blocks: AvailableBlock[],
  bookings: Booking[]
): string[] {
  const dateBlocks = blocks.filter((b) => b.date === date);
  const dateBookings = bookings.filter(
    (b) => b.date === date && b.status === 'confirmed'
  );

  const available = new Set<string>();

  for (const block of dateBlocks) {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);

    for (let t = blockStart; t + serviceDuration <= blockEnd; t += 30) {
      const slotEnd = t + serviceDuration;

      const hasOverlap = dateBookings.some((b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return t < bEnd && slotEnd > bStart;
      });

      if (!hasOverlap) {
        available.add(minutesToTime(t));
      }
    }
  }

  return [...available].sort();
}

export function getDatesWithAvailability(
  blocks: AvailableBlock[],
  bookings: Booking[],
  serviceDuration: number,
  fromDate: string
): string[] {
  const uniqueDates = [...new Set(blocks.map((b) => b.date))].filter(
    (d) => d >= fromDate
  );
  return uniqueDates.filter(
    (date) =>
      getAvailableStartTimes(date, serviceDuration, blocks, bookings).length > 0
  );
}
