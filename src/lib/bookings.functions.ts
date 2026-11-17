import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { quoteStay, todayInCorolla } from "@/lib/pricing";

export type StayRow = {
  code: string;
  arrive: string;
  depart: string;
  guests: number;
  nights: number;
  total_cents: number;
  created_at: string;
};

export type BlockRow = {
  id: number;
  arrive: string;
  depart: string;
  note: string | null;
  created_at: string;
};

export type InquiryRow = {
  code: string;
  topic: string;
  arrive: string | null;
  depart: string | null;
  guests: number | null;
  created_at: string;
};

const dayRe = /^\d{4}-\d{2}-\d{2}$/;
const topics = ["dates", "the-house", "payment", "something-else"] as const;

function code(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = prefix;
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export const listReservations = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<StayRow>`
    select code,
           arrive::text as arrive,
           depart::text as depart,
           guests,
           nights,
           total_cents,
           to_char(created_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') as created_at
    from reservations
    order by arrive asc
  `;
});

export const listBlocks = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<BlockRow>`
    select id,
           arrive::text as arrive,
           depart::text as depart,
           note,
           to_char(created_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') as created_at
    from blocks
    order by arrive asc
  `;
});

export const listInquiries = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<InquiryRow>`
    select code,
           topic,
           arrive::text as arrive,
           depart::text as depart,
           guests,
           to_char(created_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') as created_at
    from inquiries
    order by id desc
    limit 40
  `;
});

export const reserveStay = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = input as { arrive?: string; depart?: string; guests?: number };
    if (!data || !dayRe.test(data.arrive ?? "") || !dayRe.test(data.depart ?? "")) {
      throw new Error("Choose both dates.");
    }
    const guests = Number(data.guests);
    if (!Number.isInteger(guests)) throw new Error("Choose how many guests.");
    return { arrive: data.arrive as string, depart: data.depart as string, guests };
  })
  .handler(async ({ data }) => {
    const quote = quoteStay(data.arrive, data.depart, data.guests);
    if (!quote.ok) throw new Error(quote.reason);

    const sql = await getSql();
    const confirmation = code("RN-");
    const rows = await sql<StayRow>`
      insert into reservations (code, arrive, depart, guests, nights, total_cents)
      select ${confirmation}, ${data.arrive}::date, ${data.depart}::date, ${data.guests}, ${quote.nights}, ${quote.total}
      where not exists (
        select 1 from reservations
        where arrive < ${data.depart}::date and depart > ${data.arrive}::date
      )
      and not exists (
        select 1 from blocks
        where arrive < ${data.depart}::date and depart > ${data.arrive}::date
      )
      returning code,
                arrive::text as arrive,
                depart::text as depart,
                guests,
                nights,
                total_cents,
                to_char(created_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') as created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("Those nights are closed or were just reserved. Pick another set of dates.");
    return { ...row, lodging: quote.lodging, cleaning: quote.cleaning, tax: quote.tax };
  });

export const releaseStay = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const codeValue = (input as { code?: string })?.code?.trim().toUpperCase() ?? "";
    if (!/^RN-[A-Z0-9]{6}$/.test(codeValue)) throw new Error("That confirmation code is not valid.");
    return { code: codeValue };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ code: string }>`
      delete from reservations where code = ${data.code} returning code
    `;
    if (!rows[0]) throw new Error("No hold matches that code.");
    return { released: rows[0].code };
  });

export const blockNights = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = input as { arrive?: string; depart?: string; note?: string };
    if (!dayRe.test(data?.arrive ?? "") || !dayRe.test(data?.depart ?? "")) {
      throw new Error("Choose the first night closed and the morning it opens again.");
    }
    if ((data.arrive as string) >= (data.depart as string)) {
      throw new Error("The open-again date has to be after the first closed night.");
    }
    if ((data.arrive as string) < todayInCorolla()) {
      throw new Error("Closed nights start today or later.");
    }
    const note = (data.note ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
    return { arrive: data.arrive as string, depart: data.depart as string, note };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const clash = await sql<{ kind: string }>`
      select 'reserved' as kind from reservations
      where arrive < ${data.depart}::date and depart > ${data.arrive}::date
      union all
      select 'closed' as kind from blocks
      where arrive < ${data.depart}::date and depart > ${data.arrive}::date
      limit 1
    `;
    if (clash[0]?.kind === "reserved") {
      throw new Error("A guest hold already covers some of those nights. Release it first.");
    }
    if (clash[0]) throw new Error("Those nights are already closed.");
    const rows = await sql<BlockRow>`
      insert into blocks (arrive, depart, note)
      values (${data.arrive}::date, ${data.depart}::date, ${data.note || null})
      returning id,
                arrive::text as arrive,
                depart::text as depart,
                note,
                to_char(created_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') as created_at
    `;
    return rows[0];
  });

export const openBlock = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = Number((input as { id?: number })?.id);
    if (!Number.isInteger(id) || id < 1) throw new Error("That closure is not valid.");
    return { id };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      delete from blocks where id = ${data.id} returning id
    `;
    if (!rows[0]) throw new Error("Those nights are already open.");
    return { opened: rows[0].id };
  });

export const registerInquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = input as {
      topic?: string;
      arrive?: string;
      depart?: string;
      guests?: number;
    };
    if (!topics.includes(data?.topic as (typeof topics)[number])) {
      throw new Error("Choose what this is about.");
    }
    const arrive = data.arrive && dayRe.test(data.arrive) ? data.arrive : null;
    const depart = data.depart && dayRe.test(data.depart) ? data.depart : null;
    const guests =
      typeof data.guests === "number" && data.guests >= 1 && data.guests <= 12
        ? data.guests
        : null;
    return { topic: data.topic as (typeof topics)[number], arrive, depart, guests };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const inquiry = code("Q-");
    await sql`
      insert into inquiries (code, topic, arrive, depart, guests)
      values (
        ${inquiry},
        ${data.topic},
        ${data.arrive}::date,
        ${data.depart}::date,
        ${data.guests}
      )
    `;
    return { code: inquiry };
  });
