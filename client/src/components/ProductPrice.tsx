import {
  getDiscountPercent,
  getEffectivePrice,
  hasDiscount,
  type PricedProduct,
} from '@/utils/productPricing';

type PriceSize = 'sm' | 'md' | 'lg' | 'xl';

interface ProductPriceProps {
  product: PricedProduct;
  size?: PriceSize;
  /** Stack the struck-out original under the sale price instead of beside it. */
  layout?: 'inline' | 'stacked';
  showPercent?: boolean;
  className?: string;
  /** Multiplies both prices — used for cart line totals. */
  quantity?: number;
}

const SIZE_CLASSES: Record<PriceSize, { current: string; original: string; badge: string }> = {
  sm: { current: 'text-[13px]', original: 'text-[11px]', badge: 'text-[9px] px-1.5 py-0.5' },
  md: { current: 'text-[15px]', original: 'text-[12px]', badge: 'text-[10px] px-2 py-0.5' },
  lg: { current: 'text-xl', original: 'text-sm', badge: 'text-[10px] px-2 py-0.5' },
  xl: { current: 'text-3xl', original: 'text-lg', badge: 'text-[11px] px-2.5 py-1' },
};

export default function ProductPrice({
  product,
  size = 'md',
  layout = 'inline',
  showPercent = true,
  className = '',
  quantity = 1,
}: ProductPriceProps) {
  const classes = SIZE_CLASSES[size];
  const discounted = hasDiscount(product);
  const current = getEffectivePrice(product) * quantity;
  const original = Number(product.price ?? 0) * quantity;
  const percent = getDiscountPercent(product);

  if (!discounted) {
    return (
      <span className={`${classes.current} font-black text-[#1a2f1a] whitespace-nowrap ${className}`}>
        Rs. {current}
      </span>
    );
  }

  return (
    <span
      className={`flex ${
        layout === 'stacked' ? 'flex-col items-end gap-0.5' : 'flex-wrap items-baseline gap-x-2 gap-y-0.5'
      } ${className}`}
    >
      <span className={`${classes.current} font-black text-[#ff6b35] whitespace-nowrap`}>
        Rs. {current}
      </span>
      <span className={`${classes.original} font-bold text-[#1a2f1a]/40 line-through whitespace-nowrap`}>
        Rs. {original}
      </span>
      {showPercent && percent > 0 && (
        <span
          className={`${classes.badge} font-black uppercase tracking-widest rounded-full bg-[#ff6b35]/10 text-[#ff6b35] whitespace-nowrap`}
        >
          {percent}% off
        </span>
      )}
    </span>
  );
}
