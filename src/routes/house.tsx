import { createFileRoute, Link } from "@tanstack/react-router";
import { levels, property } from "@/lib/property";

export const Route = createFileRoute("/house")({
  component: House,
  head: () => ({
    meta: [
      { title: "The house · Robyn’s Nest" },
      { name: "description", content: "Five bedrooms, three baths, a private pool, hot tub, and screened porch at 1045 Corolla Drive." },
    ],
  }),
});

const beds = [
  { room: "Primary, top floor", beds: "King · TV · deck light from above" },
  { room: "King, middle floor", beds: "King · TV · deck access" },
  { room: "King, middle floor", beds: "King · TV · deck access" },
  { room: "King, middle floor", beds: "King · TV · deck access" },
  { room: "Bunk room", beds: "Two bunk sets · TV · deck access" },
];

function House() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm text-brass">{property.address}</p>
      <h1 className="mt-2 max-w-3xl font-display text-5xl">Three floors, made up and ready.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/90">
        Bath towels, washcloths, mats, kitchen towels, and bed linens are here. Bring beach towels. The dining table seats eight, with four more at the kitchen bar.
      </p>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {levels.map((level) => (
          <article key={level.name} className="rounded-card border border-line bg-foam p-6">
            <h2 className="font-display text-2xl">{level.name}</h2>
            <p className="mt-3 leading-relaxed text-ink/90">{level.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <img src="/photos/primary.jpg" alt="Top-floor primary bedroom with a jetted tub" className="aspect-video w-full rounded-card object-cover" />
        <img src="/photos/kitchen.jpg" alt="Kitchen, breakfast bar, and dining table" className="aspect-video w-full rounded-card object-cover" />
        <img src="/photos/living.jpg" alt="Living room with a fireplace" className="aspect-video w-full rounded-card object-cover" />
        <img src="/photos/bunks.jpg" alt="Bunk room" className="aspect-video w-full rounded-card object-cover" />
      </div>

      <h2 className="mt-14 font-display text-4xl">Where everyone sleeps</h2>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {beds.map((bed) => (
          <li key={bed.room} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
            <span className="text-ink">{bed.room}</span>
            <span className="text-muted">{bed.beds}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">Beds for 12. One bedroom also has a crib. No elevator — upper floors are stairs only. No pets. No smoking or vaping.</p>

      <div className="mt-10">
        <Link to="/book" className="inline-flex rounded-full bg-sea px-5 py-3 text-sm font-medium text-foam">
          Check these dates
        </Link>
      </div>
    </main>
  );
}
