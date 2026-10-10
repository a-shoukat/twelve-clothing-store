import { Link } from 'react-router-dom';
import { formatPKR } from '../utils/helpers.js';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><rect width="600" height="750" fill="#EDE6D6"/><text x="300" y="380" font-family="Georgia" font-size="40" fill="#6B675E" text-anchor="middle">TWELVE</text></svg>`
  );

/**
 * Editorial product card: image with hover zoom, discount/sold-out badges,
 * name, price + struck original price.
 */
export default function ProductCard({ product }) {
  const img = product.images?.[0] || PLACEHOLDER;
  // Defensive: schema has no compare-at field; badges render only if it ever exists.
  const original = product.original_price || product.compare_at_price;
  const hasDiscount = original && Number(original) > Number(product.price);
  const saveAmt = hasDiscount ? Number(original) - Number(product.price) : 0;
  const soldOut = product.in_stock === false;

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream dark:bg-[#1a1a1a]">
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-700 text-white text-[10px] md:text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full">
            Save Rs.{saveAmt.toLocaleString('en-PK')}
          </span>
        )}
        {soldOut && (
          <span className="absolute top-3 left-3 bg-ink/85 text-ivory text-[10px] md:text-xs font-semibold tracking-[0.2em] px-2.5 py-1 rounded-full">
            SOLD OUT
          </span>
        )}
        {product.is_new && !soldOut && (
          <span className="absolute top-3 right-3 bg-ivory/90 text-ink text-[10px] tracking-[0.2em] px-2.5 py-1 rounded-full">
            NEW
          </span>
        )}
      </div>
      <div className="pt-3">
        <h3 className="font-serif text-base md:text-lg leading-tight line-clamp-2 group-hover:opacity-70 transition">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-medium">{formatPKR(product.price)}</span>
          {hasDiscount && (
            <span className="text-smoke dark:text-ivory/50 text-sm line-through">{formatPKR(original)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
