import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { registerInquiry } from "@/lib/bookings.functions";
import { property } from "@/lib/property";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact the host · Robyn’s Nest" },
      { name: "description", content: "Ask about dates, the house, or payment for Robyn’s Nest in Corolla." },
    ],
  }),
});

const topics = [
  { id: "dates", label: "Dates & availability" },
  { id: "the-house", label: "The house" },
  { id: "payment", label: "Payment" },
  { id: "something-else", label: "Something else" },
] as const;

function Contact() {
  const [topic, setTopic] = useState<(typeof topics)[number]["id"]>("dates");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.includes("@") || note.trim().length < 8) {
      setError("Add your name, a real email, and a short note.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await registerInquiry({ data: { topic } });
      setCode(result.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register that note.");
    } finally {
      setBusy(false);
    }
  }

  const mailto = code
    ? `mailto:${property.email}?subject=${encodeURIComponent(`${code} · ${topic} · Robyn’s Nest`)}&body=${encodeURIComponent(`Reference: ${code}\nName: ${name}\nEmail: ${email}\n\n${note}\n`)}`
    : "";

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-5xl">Write Kevin.</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/90">
          {property.host} hosts Robyn’s Nest. Call or text{" "}
          <a className="text-sea underline decoration-brass underline-offset-4" href={property.phoneHref}>
            {property.phone}
          </a>
          , or email {property.email}. A question also shows on the host desk with a reference code. Your note goes to that inbox and is not stored on the public calendar.
        </p>
        <p className="mt-4 text-sm text-muted">
          Already holding dates? Use the email button on your confirmation so the code and the total travel together.
        </p>
      </div>
      {code ? (
        <div className="rounded-card border border-line bg-foam p-6">
          <p className="text-sm text-brass">Host desk notified</p>
          <p className="mt-2 font-display text-4xl">{code}</p>
          <p className="mt-3 leading-relaxed text-ink/90">
            Send the note now so the host can reply to {email || "you"}.
          </p>
          <a href={mailto} className="mt-6 flex h-12 items-center justify-center rounded-full bg-sea text-sm font-medium text-foam">
            Email Kevin
          </a>
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-card border border-line bg-foam p-6">
          <label className="block text-sm text-muted">
            Topic
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as (typeof topics)[number]["id"])}
              className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-3 text-ink"
            >
              {topics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm text-muted">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-3 text-ink" />
          </label>
          <label className="mt-3 block text-sm text-muted">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-3 text-ink" />
          </label>
          <label className="mt-3 block text-sm text-muted">
            Note
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-3 text-ink" />
          </label>
          {error ? <p className="mt-3 text-sm text-sea">{error}</p> : null}
          <button type="submit" disabled={busy} className="mt-5 h-12 w-full rounded-full bg-sea text-sm font-medium text-foam disabled:opacity-40">
            {busy ? "Sending…" : "Notify the host"}
          </button>
        </form>
      )}
    </main>
  );
}
