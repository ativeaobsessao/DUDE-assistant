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
  // timeString is '08:00:00'
  return timeString.slice(0, 5);
}
