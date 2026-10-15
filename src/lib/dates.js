import dayjs from './dayjs';

export function formatDate(date) {
  return date ? dayjs(date, 'YYYY-MM-DD').format('DD/MM/YYYY') : null;
}

export function personAge(birthday, deathday) {
  if (!birthday) return null;
  return dayjs(deathday || undefined).diff(dayjs(birthday, 'YYYY-MM-DD'), 'year');
}
