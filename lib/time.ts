// 営業時間・スロットまわりのヘルパー

export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 19;
export const SLOT_MINUTES = 30;

/** 営業時間内の開始スロット（Date配列）を返す */
export function daySlots(day: Date): Date[] {
  const slots: Date[] = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m));
    }
  }
  return slots;
}

export function hhmm(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ymd(day: Date): string {
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
}

export function addDays(day: Date, n: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + n);
}

export function isToday(day: Date): boolean {
  const now = new Date();
  return ymd(day) === ymd(now);
}
