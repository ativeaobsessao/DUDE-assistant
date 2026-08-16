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
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  if (year && month && day) {
    return `${year}-${month}-${day}`;
  }
  // Fallback
  const fallback = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  return fallback.toISOString().split('T')[0];
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
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
  const hour = parts.find(p => p.type === 'hour')?.value || '00';
  const minute = parts.find(p => p.type === 'minute')?.value || '00';
  const second = parts.find(p => p.type === 'second')?.value || '00';
  
  const h = hour === '24' ? '00' : hour;
  return `${h.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
}

function safeParseDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  return new Date(dateStr);
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = safeParseDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  try {
    let friendly = format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
    return friendly.charAt(0).toUpperCase() + friendly.slice(1);
  } catch (e) {
    return dateStr;
  }
}

export function getWeekdayName(dateStr: string): string {
  if (!dateStr) return '';
  const d = safeParseDate(dateStr);
  if (isNaN(d.getTime())) return '';
  try {
    return format(d, 'EEEE'); 
  } catch (e) {
    return '';
  }
}

export function formatTime(timeString: string): string {
  if (!timeString) return '';
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}h:${parts[1]}min`;
  }
  return timeString;
}

export function formatDateToTime(dateVal: Date | string | null | undefined): string {
  if (!dateVal) return '';
  try {
    const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return '';
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}h:${m}min`;
  } catch (e) {
    return '';
  }
}
