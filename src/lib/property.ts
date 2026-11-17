export const property = {
  name: "Robyn's Nest",
  tagline: "A few steps to the beach, with a pool of your own.",
  address: "1045 Corolla Drive",
  city: "Corolla",
  region: "NC",
  postal: "27927",
  neighborhood: "Whalehead Beach",
  host: "Kevin Bupp",
  email: "kobupp@gmail.com",
  phone: "(717) 756-0200",
  phoneHref: "tel:+17177560200",
  site: "https://www.robynsnestobx.com",
  vrbo: "https://www.vrbo.com/505759",
  lat: 36.3616082,
  lng: -75.8237489,
  sleeps: 12,
  bedrooms: 5,
  bathrooms: 3,
  sqft: 2200,
  score: "9.8",
  reviews: 71,
  checkIn: "4:00 pm",
  checkOut: "10:00 am",
  taxRate: 0.1275,
  cleaningCents: 32500,
  turnoverStart: "June 5",
  turnoverEnd: "August 13",
  offSeasonMinNights: 3,
} as const;

export type SeasonId = "low" | "shoulder" | "high" | "peak";

export const seasons: {
  id: SeasonId;
  label: string;
  when: string;
  nightly: number;
  minNights: number;
}[] = [
  { id: "low", label: "Low", when: "Nov 1 – Feb 28", nightly: 365, minNights: 3 },
  { id: "shoulder", label: "Shoulder", when: "Mar 1 – May 15 · Sep 7 – Oct 31", nightly: 545, minNights: 3 },
  { id: "high", label: "High", when: "May 16 – Jun 12 · Aug 16 – Sep 6", nightly: 795, minNights: 3 },
  { id: "peak", label: "Peak", when: "Jun 13 – Aug 15", nightly: 1095, minNights: 3 },
];

export const photos = [
  { src: "/photos/front.jpg", alt: "Front of the house, with the deck, flags, and the walkway underneath", caption: "The front" },
  { src: "/photos/exterior.jpg", alt: "Back of the house, with stacked decks, stairs, the pool, and the hot tub", caption: "The house" },
  { src: "/photos/pool.jpg", alt: "Private pool and hot tub inside a wood fence", caption: "Private pool & hot tub" },
  { src: "/photos/view.jpg", alt: "View from the upper deck over the pines toward the ocean", caption: "From the upper deck" },
  { src: "/photos/porch.jpg", alt: "Screened porch with a picnic table and a door to the deck", caption: "Screened porch" },
  { src: "/photos/living.jpg", alt: "Living room with a fireplace and a sectional sofa", caption: "Living room" },
  { src: "/photos/kitchen.jpg", alt: "Kitchen, breakfast bar, and dining table", caption: "Kitchen & dining" },
  { src: "/photos/primary.jpg", alt: "Top-floor primary bedroom with a jetted tub", caption: "Primary bedroom" },
  { src: "/photos/bedroom.jpg", alt: "Bedroom with a wooden bed and a wing chair", caption: "Bedroom" },
  { src: "/photos/bedroom-two.jpg", alt: "Bedroom with a slatted headboard and a dresser", caption: "Bedroom" },
  { src: "/photos/bedroom-crib.jpg", alt: "Bedroom with a bed and a crib", caption: "Bedroom with a crib" },
  { src: "/photos/bunks.jpg", alt: "Bunk room with a metal bunk and a wooden bunk", caption: "Bunk room" },
  { src: "/photos/nook.jpg", alt: "Sitting nook with a wicker chair by the window", caption: "Sitting nook" },
  { src: "/photos/sign.jpg", alt: "Stained-glass Robyns Nest panel hanging in the window", caption: "Robyn’s Nest" },
] as const;

export const levels = [
  {
    name: "Ground",
    detail:
      "Gated private pool and hot tub, basketball, outside shower, grill, and five beach chairs. Park on site and rinse off before you come upstairs.",
  },
  {
    name: "Middle",
    detail:
      "Three king bedrooms, each with a TV and deck access, plus a bunk room with two bunk sets. Washer and dryer are on this floor.",
  },
  {
    name: "Top",
    detail:
      "King primary with a jetted tub and TV, the family living room and fireplace, kitchen, dining plus seats at the bar, a small desk, and the screened porch.",
  },
] as const;

export const amenities = [
  "Private heated-season pool",
  "Hot tub",
  "Ocean view from the crow’s nest",
  "Screened porch",
  "Linens on, beds made",
  "Bath towels included",
  "Five beach chairs",
  "Gas grill",
  "Outdoor shower",
  "Full kitchen & ice maker",
  "Washer and dryer",
  "Free Wi-Fi",
  "Smart TVs",
  "Desk for remote work",
  "On-site parking",
  "Smoke-free",
] as const;

export const attractions = [
  { name: "Corolla beach access", note: "Second lot from the corner — a short walk through the dunes." },
  { name: "Wild horses", note: "4WD beach ramp about 3 miles north. Drive toward the Virginia line." },
  { name: "Currituck Beach Lighthouse", note: "A few minutes by car, brick tower and the keeper’s grounds." },
  { name: "Historic Corolla Park", note: "Whalehead, the wildlife center, and a walkable village green." },
  { name: "Groceries", note: "Food Lion and Harris Teeter are a short drive south in Corolla." },
  { name: "On the water", note: "Kayaks, jet skis, and surf shops along the NC-12 corridor." },
] as const;
