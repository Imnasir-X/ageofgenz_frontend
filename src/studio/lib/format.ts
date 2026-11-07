const TZ = 'Asia/Dhaka';

export const fmtNumber = (n: number | null | undefined, digits = 0) =>
  n === null || n === undefined || Number.isNaN(n) ? '–' : n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const fmtUsd = (n: number | string | null | undefined, digits = 2) => {
  const v = typeof n === 'string' ? Number(n) : n;
  return v === null || v === undefined || Number.isNaN(v) ? '–' : `$${v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};

export const fmtPct = (n: number | null | undefined, digits = 1) => (n === null || n === undefined ? '–' : `${n.toFixed(digits)}%`);

export const fmtSigned = (n: number | null | undefined, digits = 1) =>
  n === null || n === undefined ? '–' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(digits)}%`;

export const fmtSeconds = (s: number | null | undefined) => {
  if (s === null || s === undefined) return '–';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m ? `${m}m ${sec.toString().padStart(2, '0')}s` : `${sec}s`;
};

/** Date/time on the owner's clock (Asia/Dhaka), whatever the browser zone. */
export const fmtDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('en-GB', { timeZone: TZ, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }) : '–';

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso.length === 10 ? `${iso}T00:00:00+06:00` : iso).toLocaleDateString('en-GB', { timeZone: TZ, day: 'numeric', month: 'short' }) : '–';

export const fmtHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

export const fmtHourRange = (h: number) => `${fmtHour(h)}–${fmtHour((h + 1) % 24)}`;

/** ISO string to the value of an <input type="datetime-local"> in Asia/Dhaka. */
export function toDhakaLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() + 6 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value, read as Asia/Dhaka (UTC+6, no DST), to ISO. */
export function fromDhakaLocalInput(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}:00+06:00`).toISOString();
}

export const relativeFromNow = (iso: string | null | undefined) => {
  if (!iso) return '–';
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [86400000, 'd'],
    [3600000, 'h'],
    [60000, 'm'],
  ];
  for (const [ms, label] of units) {
    if (abs >= ms) return diff >= 0 ? `${Math.floor(abs / ms)}${label} ago` : `in ${Math.floor(abs / ms)}${label}`;
  }
  return 'just now';
};
