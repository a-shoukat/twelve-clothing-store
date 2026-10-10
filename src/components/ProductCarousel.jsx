import { useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';

/**
 * Horizontal product carousel: heading left, "View all" right,
 * snap-scrolling cards with arrow controls.
 */
export default function ProductCarousel({
  title,
  subtitle,
  products = [],
  viewAllTo = '/shop',
  dark = false,
}) {
  const trackRef = useRef(null);

  if (!products.length) return null;

  const scroll = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section className={`py-10 md:py-14 ${dark ? 'bg-ink text-ivory' : ''}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-2">
          <h2 className="font-serif text-3xl md:text-4xl tracking-wide">{title}</h2>
          <Link
            to={viewAllTo}
            className={`text-sm tracking-[0.2em] underline underline-offset-4 hover:opacity-60 transition ${
              dark ? 'text-ivory/80' : ''
            }`}
          >
            View all
          </Link>
        </div>
        {subtitle && (
          <p className={`text-sm mb-6 ${dark ? 'text-ivory/60' : 'text-smoke'}`}>{subtitle}</p>
        )}
        {!subtitle && <div className="mb-6" />}

        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
          >
            {products.map((p) => (
              <div
                key={p.id}
                className="snap-start shrink-0 basis-[68%] sm:basis-[42%] md:basis-[30%] lg:basis-[22.5%]"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition hover:opacity-70 ${
                dark ? 'border-ivory/30' : 'border-ink/25'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition hover:opacity-70 ${
                dark ? 'border-ivory/30' : 'border-ink/25'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
