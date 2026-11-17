import { formatDay, parseDay } from "@/lib/pricing";

type Props = {
  month: Date;
  onMonth: (next: Date) => void;
  arrive: string;
  depart: string;
  onPick: (iso: string) => void;
  blocked: Set<string>;
};

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function cells(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const out: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i += 1) out.push(null);
  for (let day = 1; day <= count; day += 1) {
    out.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  return out;
}

export function StayCalendar({ month, onMonth, arrive, depart, onPick, blocked }: Props) {
  const label = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = formatDay(new Date());

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm text-ink"
          onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        >
          Prev
        </button>
        <p className="font-display text-xl text-ink">{label}</p>
        <button
          type="button"
          className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm text-ink"
          onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {weekdays.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
        {cells(month).map((date, index) => {
          if (!date) return <div key={`e-${index}`} />;
          const iso = formatDay(date);
          const past = iso < today;
          const isBlocked = blocked.has(iso);
          const disabled = past || isBlocked;
          const inRange = arrive && depart && iso >= arrive && iso < depart;
          const edge = iso === arrive || (depart && iso === depart);
          const tone = edge
            ? "bg-sea text-foam"
            : inRange
              ? "bg-sea/15 text-ink"
              : disabled
                ? "text-muted/50"
                : "text-ink hover:bg-foam";
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onPick(iso)}
              aria-label={iso}
              aria-pressed={iso === arrive || iso === depart}
              className={`flex h-11 items-center justify-center rounded-full text-sm tabular-nums transition-colors duration-200 ${tone} ${
                iso === today && !edge ? "ring-1 ring-brass" : ""
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted">
        Closed nights cannot be chosen. The morning you leave stays open for the next arrival.
      </p>
    </div>
  );
}

export function nightsBlocked(ranges: { arrive: string; depart: string }[]): Set<string> {
  const set = new Set<string>();
  for (const range of ranges) {
    const cursor = parseDay(range.arrive);
    const end = parseDay(range.depart);
    while (cursor < end) {
      set.add(formatDay(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return set;
}
