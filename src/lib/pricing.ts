import { property, seasons, type SeasonId } from "@/lib/property";

export type Quote = {
  arrive: string;
  depart: string;
  nights: number;
  guests: number;
  lodging: number;
  cleaning: number;
  tax: number;
  total: number;
  minNights: number;
  season: SeasonId;
  ok: boolean;
  reason: string;
  avgNightly?: number;
  adjustments?: string[];
};

const TAX = property.taxRate;
const CLEANING = property.cleaningCents;
const MIN_OTHER = property.offSeasonMinNights;

export function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const date = parseDay(iso);
  date.setDate(date.getDate() + days);
  return formatDay(date);
}

export function todayInCorolla(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function seasonFor(iso: string): (typeof seasons)[number] {
  const date = parseDay(iso);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const key = month * 100 + day;
  if (key >= 613 && key <= 815) return seasons.find((s) => s.id === "peak")!;
  if ((key >= 516 && key <= 612) || (key >= 816 && key <= 906)) {
    return seasons.find((s) => s.id === "high")!;
  }
  if ((key >= 301 && key <= 515) || (key >= 907 && key <= 1031)) {
    return seasons.find((s) => s.id === "shoulder")!;
  }
  return seasons.find((s) => s.id === "low")!;
}

/** June 5 through August 13, every year. Turnover is Saturday only in this stretch. */
export function inSaturdaySeason(iso: string): boolean {
  const date = parseDay(iso);
  const key = (date.getMonth() + 1) * 100 + date.getDate();
  return key >= 605 && key <= 813;
}

export function isSaturday(iso: string): boolean {
  return parseDay(iso).getDay() === 6;
}

export function isWeekendNight(iso: string): boolean {
  const day = parseDay(iso).getDay();
  return day === 5 || day === 6; // Friday or Saturday
}

export function nightsBetween(arrive: string, depart: string): number {
  const ms = parseDay(depart).getTime() - parseDay(arrive).getTime();
  return Math.round(ms / 86_400_000);
}

export function eachNight(arrive: string, depart: string): string[] {
  const nights = nightsBetween(arrive, depart);
  const out: string[] = [];
  for (let i = 0; i < nights; i += 1) out.push(addDays(arrive, i));
  return out;
}

export function touchesSaturdaySeason(arrive: string, depart: string): boolean {
  if (inSaturdaySeason(arrive) || inSaturdaySeason(depart)) return true;
  return eachNight(arrive, depart).some(inSaturdaySeason);
}

export function daysUntil(iso: string): number {
  const today = parseDay(todayInCorolla());
  const target = parseDay(iso);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Dynamic nightly rate in cents for a single night. */
export function dynamicNightlyCents(iso: string, nights: number, arrive: string): number {
  const base = seasonFor(iso).nightly * 100;
  let rate = base;
  const adjustments: string[] = [];

  // Weekend premium
  if (isWeekendNight(iso)) {
    rate = Math.round(rate * 1.12);
    adjustments.push("+12% weekend");
  }

  // Length-of-stay discount
  if (nights >= 14) {
    rate = Math.round(rate * 0.92);
    adjustments.push("−8% 14+ nights");
  } else if (nights >= 7) {
    rate = Math.round(rate * 0.95);
    adjustments.push("−5% 7+ nights");
  }

  // Advance-booking adjustment
  const advance = daysUntil(arrive || iso);
  if (advance >= 90) {
    rate = Math.round(rate * 0.97);
    adjustments.push("−3% early");
  } else if (advance <= 7 && advance >= 0) {
    rate = Math.round(rate * 1.08);
    adjustments.push("+8% last-minute");
  }

  return rate;
}

export function money(cents: number, digits: 0 | 2 = 0): string {
  const whole = digits === 0 && cents % 100 === 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function quoteStay(arrive: string, depart: string, guests: number): Quote {
  const nights = nightsBetween(arrive, depart);
  const season = seasonFor(arrive || todayInCorolla());
  const saturdayStay = arrive && depart ? touchesSaturdaySeason(arrive, depart) : false;
  const blank: Quote = {
    arrive,
    depart,
    nights: Math.max(nights, 0),
    guests,
    lodging: 0,
    cleaning: 0,
    tax: 0,
    total: 0,
    minNights: saturdayStay ? 7 : MIN_OTHER,
    season: season.id,
    ok: false,
    reason: "",
  };

  if (!arrive || !depart || nights <= 0) {
    return { ...blank, reason: "Choose an arrival date, then the morning you leave." };
  }
  if (arrive < todayInCorolla()) {
    return { ...blank, reason: "Arrival has to be today or later." };
  }
  if (guests < 1 || guests > 12) {
    return { ...blank, reason: "The house sleeps 1 to 12." };
  }
  if (nights > 28) {
    return { ...blank, reason: "Stays are limited to 28 nights. Ask the host for longer." };
  }
  if (saturdayStay && (!isSaturday(arrive) || !isSaturday(depart))) {
    return {
      ...blank,
      reason: `From ${property.turnoverStart} through ${property.turnoverEnd}, check-in and check-out are Saturdays only.`,
    };
  }
  if (!saturdayStay && nights < MIN_OTHER) {
    return {
      ...blank,
      reason: `Outside ${property.turnoverStart}–${property.turnoverEnd}, stays are at least ${MIN_OTHER} nights. Check in or out on any day.`,
    };
  }

  let lodging = 0;
  const notes = new Set<string>();
  for (const night of eachNight(arrive, depart)) {
    const nightRate = dynamicNightlyCents(night, nights, arrive);
    lodging += nightRate;
    // collect unique adjustment labels for display
    if (isWeekendNight(night)) notes.add("Weekend nights +12%");
  }
  if (nights >= 14) notes.add("14+ night discount −8%");
  else if (nights >= 7) notes.add("7+ night discount −5%");
  const advance = daysUntil(arrive);
  if (advance >= 90) notes.add("Early booking −3%");
  else if (advance <= 7 && advance >= 0) notes.add("Last-minute +8%");

  const cleaning = CLEANING;
  const tax = Math.round((lodging + cleaning) * TAX);
  const avgNightly = nights > 0 ? Math.round(lodging / nights) : 0;

  return {
    ...blank,
    lodging,
    cleaning,
    tax,
    total: lodging + cleaning + tax,
    ok: true,
    reason: "",
    avgNightly,
    adjustments: Array.from(notes),
  };
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function longDate(iso: string): string {
  return parseDay(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}