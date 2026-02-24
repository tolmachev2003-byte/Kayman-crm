// Days of week in Russian, starting Monday
export const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
export const DAY_NAMES_FULL = [
  "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье",
];

// Generate 30-min time slots from 08:00 to 21:00
export function generateTimeSlots(start = "08:00", end = "21:00"): string[] {
  const slots: string[] = [];
  let [h, m] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  while (h < eh || (h === eh && m < em)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) { h++; m = 0; }
  }
  return slots;
}

// Get Monday of the current week (or offset weeks)
export function getWeekStart(offset = 0): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Get array of 7 dates for the week
export function getWeekDates(offset = 0): Date[] {
  const monday = getWeekStart(offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// Format date to YYYY-MM-DD
export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

// Format date for display: "21 фев"
export function formatDateShort(d: Date): string {
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export const CLIENT_TYPES = ["новый", "постоянный", "пробный", "абонемент"] as const;
export const CLIENT_STATUSES = ["записался", "ходит", "ходил"] as const;
export const SUBSCRIPTION_TYPES = ["1", "4", "8"] as const;
