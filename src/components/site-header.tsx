import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/house", label: "The house" },
  { to: "/area", label: "Corolla" },
  { to: "/policies", label: "Policies" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-sand/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="min-w-0" onClick={() => setOpen(false)}>
          <span className="block font-display text-xl leading-none text-ink">Robyn’s Nest</span>
          <span className="mt-1 block text-xs tracking-wide text-muted">Corolla · Outer Banks</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={
                path === link.to
                  ? "text-sm text-sea"
                  : "text-sm text-ink transition-colors duration-200 hover:text-sea"
              }
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/book"
            className="rounded-full bg-sea px-4 py-2 text-sm font-medium text-foam transition-opacity duration-200 hover:opacity-90"
          >
            Check dates
          </Link>
        </nav>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-line px-5 py-3 md:hidden">
          <div className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="py-3 text-base text-ink"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/book"
              className="mt-2 rounded-full bg-sea px-4 py-3 text-center text-sm font-medium text-foam"
              onClick={() => setOpen(false)}
            >
              Check dates
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
