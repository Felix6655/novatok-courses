export function formatPrice(price: string | number, currency = "USD"): string {
  const amount = typeof price === "string" ? Number(price) : price;
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatLevel(level: string): string {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

const CARD_ACCENTS = [
  "from-violet-500 to-indigo-500",
  "from-sky-500 to-cyan-500",
  "from-rose-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-yellow-500",
  "from-fuchsia-500 to-pink-500",
] as const;

export function accentForSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return CARD_ACCENTS[hash % CARD_ACCENTS.length];
}
