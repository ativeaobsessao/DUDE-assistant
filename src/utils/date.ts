import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function getLocalDateString(timezone: string = 'America/Sao_Paulo'): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD
  return formatter.format(now);
}

export function getCurrentLocalTime(timezone: string = 'America/Sao_Paulo'): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  const formatter = new Intl.DateTimeFormat('en-GB', options); // en-GB gives HH:mm:ss
  return formatter.format(now);
}

export function formatFriendlyDate(dateStr: string): string {
  // dateStr is 'YYYY-MM-DD'
  // append T00:00:00 to avoid timezone shifts
  const d = new Date(dateStr + 'T00:00:00');
  let friendly = format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
  // Capitalize first letter
  friendly = friendly.charAt(0).toUpperCase() + friendly.slice(1);
  return friendly;
}

export function getWeekdayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  // return English weekday for DB matching 'Sunday', 'Monday' etc.
  return format(d, 'EEEE'); 
}

export function formatTime(timeString: string): string {
  if (!timeString) return '';
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}h:${parts[1]}min`;
  }
  return timeString;
}

export function formatDateToTime(dateVal: Date | string): string {
  if (!dateVal) return '';
  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}h:${m}min`;
}
