import { formatPrice } from "@/lib/format";

interface PriceDisplayProps {
  price: string;
  originalPrice: string | null;
  currency: string;
  size?: "sm" | "lg";
}

export function PriceDisplay({ price, originalPrice, currency, size = "sm" }: PriceDisplayProps) {
  const priceClass = size === "lg" ? "text-2xl font-semibold" : "text-base font-semibold";
  const hasDiscount = originalPrice !== null && Number(originalPrice) > Number(price);

  return (
    <div className="flex items-baseline gap-2">
      <span className={priceClass}>{formatPrice(price, currency)}</span>
      {hasDiscount && (
        <span className="text-sm text-neutral-500 line-through dark:text-neutral-400">
          {formatPrice(originalPrice as string, currency)}
        </span>
      )}
    </div>
  );
}
