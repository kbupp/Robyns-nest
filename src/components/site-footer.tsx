import { Link } from "@tanstack/react-router";
import { property } from "@/lib/property";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-foam">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl">Robyn’s Nest</p>
          <p className="mt-2 text-sm text-foam/80">
            {property.address}
            <br />
            {property.city}, {property.region} {property.postal}
          </p>
        </div>
        <div className="text-sm leading-6 text-foam/80">
          <p className="text-foam">{property.host}</p>
          <p>
            <a className="underline decoration-brass underline-offset-4" href={property.phoneHref}>
              {property.phone}
            </a>
          </p>
          <p>
            <a className="underline decoration-brass underline-offset-4" href={`mailto:${property.email}`}>
              {property.email}
            </a>
          </p>
          <p className="mt-2">Check-in {property.checkIn}</p>
          <p>Check-out {property.checkOut}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/book" className="text-foam hover:text-brass">
            Availability
          </Link>
          <Link to="/policies" className="text-foam hover:text-brass">
            House rules
          </Link>
          <a className="text-foam hover:text-brass" href={property.vrbo}>
            Also on VRBO
          </a>
          <Link to="/host" className="text-foam/70 hover:text-foam">
            Host desk
          </Link>
        </div>
      </div>
    </footer>
  );
}
