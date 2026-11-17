import { createFileRoute, Link } from "@tanstack/react-router";
import { property, seasons } from "@/lib/property";
import { money } from "@/lib/pricing";

export const Route = createFileRoute("/policies")({
  component: Policies,
  head: () => ({
    meta: [
      { title: "Policies & rates · Robyn’s Nest" },
      { name: "description", content: "Check-in, house rules, cancellation, and the direct nightly rates for Robyn’s Nest in Corolla." },
    ],
  }),
});

function Policies() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-5xl">Stay the way the house is set up.</h1>
      <div className="mt-8 space-y-8 text-lg leading-relaxed">
        <section>
          <h2 className="font-display text-2xl">Arrival</h2>
          <p className="mt-2 text-ink/90">
            Check-in is {property.checkIn}. Check-out is {property.checkOut}. Quiet hours run 10 pm to 8 am. Maximum occupancy is {property.sleeps}, including children. Events and extra overnight guests are not allowed.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl">The house rules</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-ink/90">
            <li>No pets, no smoking, and no vaping anywhere on the property.</li>
            <li>Pool and hot tub are for registered guests. Close the gate when you step away.</li>
            <li>Stairs only — there is no elevator.</li>
            <li>Beach driving needs a four-wheel-drive and a permit. The ramp is about three miles north.</li>
            <li>Leave the kitchen usable and trash bagged. Linens can stay on the beds.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl">Rates</h2>
          <p className="mt-2 text-ink/90">
            Nightly rates below are lodging only. Every stay adds a {money(property.cleaningCents, 2)} cleaning fee. Occupancy and sales tax (12.75%) is charged on the lodging and on the cleaning fee.
          </p>
          <p className="mt-2 text-ink/90">
            From {property.turnoverStart} through {property.turnoverEnd}, check-in and check-out are Saturdays only. Every other open date is a {property.offSeasonMinNights}-night minimum, arriving or leaving on any day.
          </p>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {seasons.map((season) => (
              <li key={season.id} className="flex items-baseline justify-between gap-4 py-3 text-base">
                <span>
                  {season.label}
                  <span className="mt-1 block text-sm text-muted">
                    {season.when}
                  </span>
                </span>
                <span className="tabular-nums">{money(season.nightly * 100)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl">Cancellation</h2>
          <p className="mt-2 text-ink/90">
            Cancel 30 or more days before arrival for a full refund of lodging, minus a $75 hold fee. Inside 30 days the lodging is non-refundable. Tax is refunded if the stay is cancelled before you arrive. Weather is not a reason to cancel — travel insurance is worth it in hurricane season.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl">Payment</h2>
          <p className="mt-2 text-ink/90">
            Reserving on this site holds the nights so they cannot be double-booked here. Card charging is connected when Stripe is live. Until then, email the confirmation to {property.host} at {property.email}, or call {property.phone}. He collects the total shown on your quote.
          </p>
        </section>
      </div>
      <Link to="/book" className="mt-10 inline-flex rounded-full bg-sea px-5 py-3 text-sm font-medium text-foam">
        Quote a stay
      </Link>
    </main>
  );
}
