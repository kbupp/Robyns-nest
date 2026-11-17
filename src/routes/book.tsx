import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { StayCalendar, nightsBlocked } from "@/components/stay-calendar";
import { listBlocks, listReservations, releaseStay, reserveStay, type StayRow } from "@/lib/bookings.functions";
import { property, seasons } from "@/lib/property";
import { longDate, money, quoteStay, formatDay, inSaturdaySeason, isSaturday } from "@/lib/pricing";

export const Route = createFileRoute("/book")({
  component: Book,
  head: () => ({
    meta: [
      { title: "Availability · Robyn’s Nest" },
      { name: "description", content: "See open nights at Robyn’s Nest and reserve dates for 1045 Corolla Drive." },
    ],
  }),
});

function Book() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [arrive, setArrive] = useState("");
  const [depart, setDepart] = useState("");
  const [guests, setGuests] = useState(8);
  const [rows, setRows] = useState<{ arrive: string; depart: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState<StayRow | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  async function refresh() {
    const [next, closed] = await Promise.all([listReservations(), listBlocks()]);
    setRows([...next, ...closed]);
  }

  useEffect(() => {
    let live = true;
    refresh()
      .catch(() => {
        if (live) setError("The calendar could not load. Try again in a moment.");
      });
    return () => {
      live = false;
    };
  }, []);

  const blocked = useMemo(() => nightsBlocked(rows), [rows]);
  const quote = quoteStay(arrive, depart, guests);

  function pick(iso: string) {
    setHeld(null);
    setError("");
    if (inSaturdaySeason(iso) && !isSaturday(iso)) {
      setError(
        `From ${property.turnoverStart} through ${property.turnoverEnd}, check-in and check-out are Saturdays only.`,
      );
      return;
    }
    if (!arrive || (arrive && depart)) {
      setArrive(iso);
      setDepart("");
      return;
    }
    if (iso <= arrive) {
      setArrive(iso);
      setDepart("");
      return;
    }
    const cursor = new Date(`${arrive}T12:00:00`);
    const end = new Date(`${iso}T12:00:00`);
    while (cursor < end) {
      if (blocked.has(formatDay(cursor))) {
        setError("That stretch crosses a reserved night. Start again on an open day.");
        setArrive(iso);
        setDepart("");
        return;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    setDepart(iso);
  }

  async function reserve() {
    if (!quote.ok) return;
    setBusy(true);
    setError("");
    try {
      const row = await reserveStay({ data: { arrive, depart, guests } });
      setHeld(row);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reserve those dates.");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function release() {
    if (!held) return;
    setBusy(true);
    try {
      await releaseStay({ data: { code: held.code } });
      setHeld(null);
      setArrive("");
      setDepart("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not release the hold.");
    } finally {
      setBusy(false);
    }
  }

  const mailto = held
    ? `mailto:${property.email}?subject=${encodeURIComponent(`Reservation ${held.code} · Robyn’s Nest`)}&body=${encodeURIComponent(
        `Confirmation: ${held.code}\nArrival: ${longDate(held.arrive)}\nDeparture: ${longDate(held.depart)}\nGuests: ${held.guests}\nTotal due: ${money(held.total_cents)}\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n`,
      )}`
    : "";

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-5">
      <section className="rounded-card border border-line bg-foam p-4 sm:p-6 lg:col-span-3">
        <h1 className="font-display text-4xl">Open nights</h1>
        <p className="mt-2 text-muted">
          Tap arrival, then the morning you leave. {property.turnoverStart} through {property.turnoverEnd} is Saturday to Saturday. Every other open stretch is {property.offSeasonMinNights} nights, any day.
        </p>
        <div className="mt-6">
          <StayCalendar
            month={month}
            onMonth={setMonth}
            arrive={arrive}
            depart={depart}
            onPick={pick}
            blocked={blocked}
          />
        </div>
      </section>

      <aside className="lg:col-span-2">
        <div className="rounded-card border border-line bg-foam p-6 lg:sticky lg:top-24">
          {held ? (
            <div>
              <p className="text-sm text-brass">Dates held</p>
              <p className="mt-2 font-display text-4xl tracking-wide">{held.code}</p>
              <p className="mt-3 text-ink">
                {longDate(held.arrive)} – {longDate(held.depart)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {held.nights} nights · {held.guests} guests
              </p>
              <p className="mt-4 font-display text-3xl tabular-nums">{money(held.total_cents)}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                These nights are blocked for every visitor. Email {property.host} at {property.email}, or call {property.phone}, so he can collect {money(held.total_cents)} and welcome you. Card checkout is added when Stripe is connected.
              </p>
              <label className="mt-4 block text-sm text-muted">
                Your name
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-3 text-ink" />
              </label>
              <label className="mt-3 block text-sm text-muted">
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-3 text-ink" />
              </label>
              <label className="mt-3 block text-sm text-muted">
                Phone
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-3 text-ink" />
              </label>
              <a href={mailto} className="mt-4 flex h-12 items-center justify-center rounded-full bg-sea text-sm font-medium text-foam">
                Email this confirmation
              </a>
              <button type="button" disabled={busy} onClick={release} className="mt-3 h-11 w-full text-sm text-muted underline decoration-line underline-offset-4">
                Release these dates
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-brass">Quote</p>
              <h2 className="mt-1 font-display text-3xl">Reserve the house</h2>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted">Guests</span>
                <div className="flex items-center gap-3">
                  <button type="button" className="size-11 rounded-full border border-line" onClick={() => setGuests((n) => Math.max(1, n - 1))} aria-label="Fewer guests">
                    –
                  </button>
                  <span className="w-6 text-center tabular-nums">{guests}</span>
                  <button type="button" className="size-11 rounded-full border border-line" onClick={() => setGuests((n) => Math.min(12, n + 1))} aria-label="More guests">
                    +
                  </button>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Arrive</dt>
                  <dd>{arrive ? longDate(arrive) : "Select"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Depart</dt>
                  <dd>{depart ? longDate(depart) : "Select"}</dd>
                </div>
                {quote.nights > 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Nights</dt>
                    <dd className="tabular-nums">{quote.nights}</dd>
                  </div>
                ) : null}
                {quote.ok ? (
                  <>
                    {quote.avgNightly ? (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Avg nightly</dt>
                        <dd className="tabular-nums">{money(quote.avgNightly, 2)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Lodging</dt>
                      <dd className="tabular-nums">{money(quote.lodging, 2)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Cleaning</dt>
                      <dd className="tabular-nums">{money(quote.cleaning, 2)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Tax 12.75%</dt>
                      <dd className="tabular-nums">{money(quote.tax, 2)}</dd>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-line pt-2 text-base">
                      <dt>Total</dt>
                      <dd className="font-display text-2xl tabular-nums">{money(quote.total, 2)}</dd>
                    </div>
                    {quote.adjustments && quote.adjustments.length > 0 ? (
                      <p className="pt-2 text-xs text-muted">{quote.adjustments.join(" · ")}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="pt-2 text-muted">{quote.reason}</p>
                )}
              </dl>
              {error ? <p className="mt-3 text-sm text-sea">{error}</p> : null}
              <button
                type="button"
                disabled={!quote.ok || busy}
                onClick={reserve}
                className="mt-5 h-12 w-full rounded-full bg-sea text-sm font-medium text-foam disabled:opacity-40"
              >
                {busy ? "Holding dates…" : "Reserve these dates"}
              </button>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Reserving blocks the calendar. It does not charge a card yet. The total includes a {money(property.cleaningCents, 2)} cleaning fee and 12.75% tax on the lodging and the cleaning fee.
              </p>
            </div>
          )}
        </div>
        <ul className="mt-4 space-y-1 px-1 text-xs text-muted">
          {seasons.map((season) => (
            <li key={season.id}>
              {season.label} from {money(season.nightly * 100)} / night · {season.when}
            </li>
          ))}
          <li>Rates adjust for weekends (+12%), longer stays (−5% / −8%), and booking window.</li>
          <li>June 5 – August 13: Saturday check-in and Saturday check-out only.</li>
          <li>All other open dates: {property.offSeasonMinNights}-night minimum, any day.</li>
        </ul>
      </aside>
    </main>
  );
}
