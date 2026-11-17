import { createFileRoute } from "@tanstack/react-router";
import { attractions, property } from "@/lib/property";

export const Route = createFileRoute("/area")({
  component: Area,
  head: () => ({
    meta: [
      { title: "Corolla & Whalehead · Robyn’s Nest" },
      { name: "description", content: "What is around 1045 Corolla Drive: the beach, wild horses, Currituck Light, and groceries." },
    ],
  }),
});

function Area() {
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("1045 Corolla Drive, Corolla, NC 27927")}`;
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 lg:grid-cols-2">
        <div>
          <p className="text-sm text-brass">{property.neighborhood}</p>
          <h1 className="mt-2 font-display text-5xl">A short walk to the water, a few minutes from the village.</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/90">
            The house is the second lot from the corner, so the dune path is close. Corolla’s shops and the lighthouse sit a short drive south. North, the beach opens toward the horses.
          </p>
          <a href={map} className="mt-6 inline-flex text-sm text-sea underline decoration-brass underline-offset-4">
            Open 1045 Corolla Drive in maps
          </a>
        </div>
        <img src="/photos/view.jpg" alt="View from the upper deck over the pines toward the ocean" className="aspect-video w-full rounded-card object-cover" />
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-8 sm:grid-cols-2">
        {attractions.map((spot) => (
          <article key={spot.name} className="rounded-card border border-line bg-foam p-5">
            <h2 className="font-display text-2xl">{spot.name}</h2>
            <p className="mt-2 leading-relaxed text-ink/90">{spot.note}</p>
          </article>
        ))}
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 lg:grid-cols-2">
        <img src="/photos/porch.jpg" alt="Screened porch looking into the pines" className="aspect-video w-full rounded-card object-cover" />
        <img src="/photos/exterior.jpg" alt="The house among the pines" className="aspect-video w-full rounded-card object-cover" />
      </section>
    </main>
  );
}
