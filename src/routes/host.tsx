import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  blockNights,
  listBlocks,
  listInquiries,
  listReservations,
  openBlock,
  releaseStay,
  type BlockRow,
  type InquiryRow,
  type StayRow,
} from "@/lib/bookings.functions";
import { property } from "@/lib/property";
import { longDate, money } from "@/lib/pricing";

export const Route = createFileRoute("/host")({
  component: Host,
  head: () => ({
    meta: [
      { title: "Host desk · Robyn’s Nest" },
      { name: "description", content: "Reserved nights, guest questions, and how to list Robyn’s Nest on Google Vacation Rentals." },
    ],
  }),
});

const topicLabel: Record<string, string> = {
  dates: "Dates",
  "the-house": "The house",
  payment: "Payment",
  "something-else": "Other",
};

function Host() {
  const [stays, setStays] = useState<StayRow[]>([]);
  const [closed, setClosed] = useState<BlockRow[]>([]);
  const [notes, setNotes] = useState<InquiryRow[]>([]);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  const [label, setLabel] = useState("");

  async function load() {
    try {
      const [nextStays, nextClosed, nextNotes] = await Promise.all([
        listReservations(),
        listBlocks(),
        listInquiries(),
      ]);
      setStays(nextStays);
      setClosed(nextClosed);
      setNotes(nextNotes);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the desk.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-brass">Only dates and reference codes are stored</p>
          <h1 className="mt-1 font-display text-5xl">Host desk</h1>
        </div>
        <button type="button" onClick={() => void load()} className="h-11 rounded-full border border-line px-4 text-sm">
          Refresh
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-sea">{error}</p> : null}

      <section className="mt-10">
        <h2 className="font-display text-3xl">Reserved nights</h2>
        {stays.length === 0 ? (
          <p className="mt-3 text-muted">No holds yet. Open nights are all available.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {stays.map((stay) => (
              <li key={stay.code} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <p className="font-display text-2xl tracking-wide">{stay.code}</p>
                  <p className="text-sm text-muted">
                    {longDate(stay.arrive)} – {longDate(stay.depart)} · {stay.guests} guests · held {stay.created_at}
                  </p>
                </div>
                <p className="tabular-nums">{money(stay.total_cents)}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-muted">
          Block the same nights on VRBO ({property.vrbo}) until a channel manager syncs them. This calendar does not talk to VRBO by itself.
        </p>
        <form
          className="mt-4 flex flex-wrap items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void releaseStay({ data: { code } })
              .then(() => {
                setNote(`Released ${code.trim().toUpperCase()}.`);
                setCode("");
                return load();
              })
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Could not release that code.");
              });
          }}
        >
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="RN- code"
            aria-label="Confirmation code to release"
            className="h-11 w-40 rounded-full border border-line bg-foam px-4 text-sm"
          />
          <button type="submit" className="h-11 rounded-full border border-line px-4 text-sm">
            Release hold
          </button>
          {note ? <span className="text-sm text-muted">{note}</span> : null}
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Closed nights</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Close nights the house is not for rent — your own stay, a repair, a VRBO booking. Guests cannot arrive on a closed night. The morning you reopen can be the next arrival.
        </p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            void blockNights({ data: { arrive: from, depart: until, note: label } })
              .then(() => {
                setNote("Those nights are closed.");
                setFrom("");
                setUntil("");
                setLabel("");
                return load();
              })
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Could not close those nights.");
              });
          }}
        >
          <label className="text-sm text-muted">
            First night closed
            <input
              type="date"
              required
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-foam px-3 text-ink"
            />
          </label>
          <label className="text-sm text-muted">
            Opens again
            <input
              type="date"
              required
              value={until}
              onChange={(event) => setUntil(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-foam px-3 text-ink"
            />
          </label>
          <label className="text-sm text-muted">
            Note, optional
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={80}
              placeholder="Owner stay"
              className="mt-1 h-11 w-full rounded-xl border border-line bg-foam px-3 text-ink"
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className="h-11 w-full rounded-full bg-sea px-4 text-sm font-medium text-foam">
              Close these nights
            </button>
          </div>
        </form>
        {closed.length === 0 ? (
          <p className="mt-4 text-muted">No owner closures. Every night that is not reserved is open.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {closed.map((block) => (
              <li key={block.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-ink">
                    {longDate(block.arrive)} – {longDate(block.depart)}
                  </p>
                  <p className="text-sm text-muted">{block.note || "Closed"} · {block.created_at} ET</p>
                </div>
                <button
                  type="button"
                  className="h-11 rounded-full border border-line px-4 text-sm"
                  onClick={() => {
                    void openBlock({ data: { id: block.id } })
                      .then(() => {
                        setNote("Those nights are open again.");
                        return load();
                      })
                      .catch((err: unknown) => {
                        setError(err instanceof Error ? err.message : "Could not open those nights.");
                      });
                  }}
                >
                  Open these nights
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Questions</h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-muted">No messages yet. New ones appear here with a code. The words arrive at {property.email}.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {notes.map((note) => (
              <li key={note.code} className="py-4">
                <p className="font-display text-2xl">{note.code}</p>
                <p className="text-sm text-muted">
                  {topicLabel[note.topic] ?? note.topic} · {note.created_at} ET
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 grid gap-4 lg:grid-cols-2">
        <article className="rounded-card border border-line bg-foam p-6">
          <h2 className="font-display text-2xl">Getting paid</h2>
          <p className="mt-3 leading-relaxed text-ink/90">
            Holds stop double-booking on this site. They do not charge a card. To take payment here, connect a Stripe account. Guest emails and call-backs go to {property.email} and {property.phone}.
          </p>
        </article>
        <article className="rounded-card border border-line bg-foam p-6">
          <h2 className="font-display text-2xl">Google Vacation Rentals</h2>
          <p className="mt-3 leading-relaxed text-ink/90">
            Google’s rental unit does not pick up a website on its own. List through Google Hotel Center or a partner that pushes rates and availability — OwnerRez, Lodgify, Hostfully, or Guesty are the usual ones. Keep one calendar. This page already publishes the address, occupancy, and amenities in a form search engines can read.
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/90">
            <li>The gallery is your own photos of the house.</li>
            <li>Point robynsnestobx.com from Wix to this published site when you are ready.</li>
            <li>Turn on a channel manager so Google, VRBO, and this calendar share the same nights.</li>
            <li>Keep the VRBO listing ({property.vrbo}) until direct bookings replace it.</li>
          </ol>
        </article>
      </section>
    </main>
  );
}
