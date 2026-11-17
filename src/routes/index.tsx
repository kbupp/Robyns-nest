import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { property, photos, seasons, amenities } from "@/lib/property";
import { guestReviews } from "@/lib/reviews";
import { money } from "@/lib/pricing";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Robyn’s Nest · 1045 Corolla Drive" },
      {
        name: "description",
        content:
          "Five bedrooms, a private pool and hot tub, and a short walk to the beach in Whalehead, Corolla. Check dates and reserve Robyn’s Nest directly.",
      },
    ],
  }),
});

const schema = {
  "@context": "https://schema.org",
  "@type": ["VacationRental", "LodgingBusiness"],
  name: "Robyn's Nest",
  description:
    "Five-bedroom Outer Banks vacation home at 1045 Corolla Drive with a private pool, hot tub, and a short walk to the beach. Sleeps 12.",
  telephone: "+1-717-756-0200",
  email: property.email,
  url: property.site,
  image: photos.slice(0, 4).map((photo) => `${property.site}${photo.src}`),
  address: {
    "@type": "PostalAddress",
    streetAddress: property.address,
    addressLocality: property.city,
    addressRegion: property.region,
    postalCode: property.postal,
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: property.lat,
    longitude: property.lng,
  },
  numberOfRooms: property.bedrooms,
  containsPlace: {
    "@type": "Accommodation",
    occupancy: { "@type": "QuantitativeValue", "maxValue": property.sleeps },
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: { "@type": "QuantitativeValue", value: property.sqft, unitCode: "FTK" },
    amenityFeature: amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
  },
  checkinTime: "16:00",
  checkoutTime: "10:00",
  petsAllowed: false,
  smokingAllowed: false,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: property.score,
    bestRating: "10",
    reviewCount: property.reviews,
  },
  review: guestReviews.map((review) => ({
    "@type": "Review",
    author: { "@type": "Person", name: review.name },
    datePublished: review.date,
    reviewBody: review.text,
    reviewRating: { "@type": "Rating", ratingValue: review.score, bestRating: 10 },
  })),
};

type Tab = "overview" | "reviews" | "amenities";

function Home() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="mx-auto grid max-w-6xl items-stretch gap-0 px-5 py-6 lg:grid-cols-2 lg:py-10">
        <div className="flex flex-col justify-center bg-ink px-6 py-10 text-foam sm:px-10 lg:rounded-l-card">
          <p className="text-sm tracking-wide text-brass">Whalehead Beach · Corolla, NC</p>
          <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">Robyn’s Nest</h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-foam/85">
            Fifth row, second lot from the corner. A private pool and hot tub, ocean light from the crow’s nest, and room for twelve.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/book" className="rounded-full bg-foam px-5 py-3 text-sm font-medium text-ink">
              See the calendar
            </Link>
            <Link to="/house" className="rounded-full border border-foam/30 px-5 py-3 text-sm text-foam">
              Tour the house
            </Link>
          </div>
        </div>
        <img
          src="/photos/front.jpg"
          alt="Front of Robyn’s Nest, with the deck, flags, and the walkway under the house"
          className="aspect-4/3 w-full rounded-card object-cover object-center lg:rounded-l-none lg:rounded-r-card"
        />
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
        {[
          ["5", "Bedrooms"],
          ["3", "Full baths"],
          ["12", "Guests"],
          [property.score, "out of 10"],
        ].map(([value, label]) => (
          <div key={label} className="bg-foam px-4 py-5">
            <p className="font-display text-3xl tabular-nums text-ink">{value}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex gap-1 rounded-full border border-line bg-foam p-1">
          {(
            [
              ["overview", "Overview"],
              ["reviews", `Reviews (${property.reviews})`],
              ["amenities", "Amenities"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === id ? "bg-ink text-foam" : "text-ink/70 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="mt-8 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="font-display text-4xl text-ink">Everything a week at the beach actually needs.</h2>
            </div>
            <div className="space-y-4 text-lg leading-relaxed text-ink/90 lg:col-span-7">
              <p>
                Robyn’s Nest sits on the fifth row at Whalehead, a short sandy walk to the Atlantic. The house is about {property.sqft.toLocaleString()} square feet: five bedrooms, three full baths, linens already on the beds.
              </p>
              <p>
                Mornings start on the screened porch. Afternoons are the pool, then the beach chairs that live under the house. You only need to pack beach towels.
              </p>
              <p className="text-base text-muted">
                Guests score this house {property.score} from {property.reviews} stays. Direct booking uses the calendar on this site.
              </p>
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="mt-8">
            <p className="text-sm text-brass">
              {property.score} out of 10 · {property.reviews} stays
            </p>
            <h2 className="mt-2 font-display text-4xl">What guests wrote.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {guestReviews.length} of the {property.reviews} stays include a written note. Every one of those notes is here.
            </p>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {guestReviews.map((review) => (
                <figure key={review.name + review.date} className="flex flex-col rounded-card border border-line bg-foam p-5">
                  <blockquote className="leading-relaxed text-ink/90">“{review.text}”</blockquote>
                  <figcaption className="mt-4 text-sm text-muted">
                    {review.name} · {review.when} · {review.score}/10
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {tab === "amenities" && (
          <div className="mt-8">
            <h2 className="font-display text-4xl">In the house</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {amenities.map((item) => (
                <li key={item} className="rounded-card border border-line bg-foam px-4 py-3 text-sm text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo) => (
            <figure key={photo.src} className="overflow-hidden rounded-card bg-foam">
              <img src={photo.src} alt={photo.alt} className="aspect-video w-full object-cover" />
              <figcaption className="px-3 py-2 text-sm text-muted">{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-foam">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 lg:grid-cols-2">
          <div>
            <p className="text-sm text-brass">Dynamic rates · {money(property.cleaningCents, 2)} cleaning · 12.75% tax on both</p>
            <h2 className="mt-2 font-display text-4xl">A clear price before you hold the dates.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Rates adjust for weekends, length of stay, and how far ahead you book. {property.turnoverStart} through {property.turnoverEnd} is Saturday to Saturday. Every other open date is a {property.offSeasonMinNights}-night minimum, any day. Cleaning is {money(property.cleaningCents, 2)}, then 12.75% tax on the lodging and the cleaning fee.
            </p>
            <ul className="mt-6 divide-y divide-line">
              {seasons.map((season) => (
                <li key={season.id} className="flex items-baseline justify-between gap-4 py-3">
                  <span>
                    <span className="block text-ink">{season.label}</span>
                    <span className="text-sm text-muted">{season.when}</span>
                  </span>
                  <span className="font-display text-2xl tabular-nums">from {money(season.nightly * 100)}</span>
                </li>
              ))}
            </ul>
            <Link to="/book" className="mt-6 inline-flex rounded-full bg-sea px-5 py-3 text-sm font-medium text-foam">
              Check a week
            </Link>
          </div>
          <img
            src="/photos/pool.jpg"
            alt="Private pool and hot tub behind the house"
            className="aspect-video w-full rounded-card object-cover"
          />
        </div>
      </section>
    </main>
  );
}