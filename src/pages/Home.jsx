import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductCarousel from '../components/ProductCarousel.jsx';
import Marquee from '../components/Marquee.jsx';

const CATS = [
  { name: 'Men', blurb: 'Sharp essentials' },
  { name: 'Women', blurb: 'Timeless grace' },
  { name: 'Kids', blurb: 'Little classics' },
];

/* Generic illustrative reviews — not attributed to real customers. */
const SAMPLE_REVIEWS = [
  {
    stars: 5,
    text: 'Fabric quality is genuinely good, and the order arrived in four days.',
    who: 'Guest shopper',
  },
  {
    stars: 5,
    text: 'True-to-size fit and neat packaging. The exchange process was easy.',
    who: 'Guest shopper',
  },
  {
    stars: 4,
    text: 'Good value for the price. Cash on delivery made it hassle-free.',
    who: 'Guest shopper',
  },
  {
    stars: 5,
    text: 'Minimal designs that go with everything. Will order again.',
    who: 'Guest shopper',
  },
];

function Stars({ n }) {
  return (
    <div className="flex gap-0.5 text-amber-500" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i <= n ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });
      setProducts(data || []);
    })();
  }, []);

  const byCat = (c) => products.filter((p) => p.category === c);
  const featured = products.filter((p) => p.featured);
  const newDrop = products.filter((p) => p.is_new).slice(0, 10);
  const latest = (newDrop.length ? newDrop : products.slice(0, 10));
  const heroImg = products[0]?.images?.[0];
  const storyImg = products[2]?.images?.[0] || products[0]?.images?.[0];
  const editImg = products[4]?.images?.[0] || products[1]?.images?.[0];

  return (
    <div>
      {/* 1 — Hero campaign, edge to edge */}
      <section className="relative bg-ink text-ivory overflow-hidden">
        {heroImg && (
          <img
            src={heroImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36 animate-fade-up">
          <p className="text-[11px] tracking-[0.45em] text-ivory/70 mb-5">CHAPTER I</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-3xl">
            WINTERS 2026-27
          </h1>
          <p className="text-ivory/75 mt-5 max-w-md text-sm md:text-base leading-relaxed">
            Fewer, better pieces. Premium fabrics, clean cuts — designed for
            everyday elegance across Pakistan.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/shop"
              className="bg-ivory text-ink text-sm tracking-[0.25em] px-10 py-4 hover:bg-cream transition"
            >
              SHOP NOW
            </Link>
            <Link
              to="/shop?sort=newest"
              className="border border-ivory/60 text-ivory text-sm tracking-[0.25em] px-10 py-4 hover:bg-ivory/10 transition"
            >
              NEW ARRIVALS
            </Link>
          </div>
        </div>
      </section>

      {/* 2 — Offer marquee */}
      <Marquee
        className="bg-ink text-ivory/90 border-t border-ivory/10 py-2.5 text-[11px] tracking-[0.3em]"
        fast
        items={[
          'CASH ON DELIVERY NATIONWIDE',
          'NEW SEASON DROP — CHAPTER I',
          '7-DAY EASY EXCHANGE',
        ]}
      />

      {/* 3 — Collection heading */}
      <section className="max-w-7xl mx-auto px-4 pt-12 md:pt-16 pb-2">
        <p className="text-[11px] tracking-[0.45em] text-smoke mb-3">CHAPTER I</p>
        <h2 className="font-serif text-4xl md:text-6xl">WINTERS 2026-27</h2>
      </section>

      {/* 4 — Compact category tiles */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {CATS.map((c) => {
            const img = byCat(c.name)[0]?.images?.[0];
            return (
              <Link
                key={c.name}
                to={`/shop?cat=${c.name}`}
                className="group relative overflow-hidden bg-cream aspect-[4/5] md:aspect-[16/10]"
              >
                {img && (
                  <img
                    src={img}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-ink/35 group-hover:bg-ink/25 transition" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 text-ivory">
                  <p className="font-serif text-lg md:text-2xl tracking-wide">{c.name}</p>
                  <p className="text-[10px] md:text-xs tracking-[0.25em] text-ivory/75">
                    {c.blurb.toUpperCase()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5 — New drop carousel */}
      <ProductCarousel
        title="New Drop"
        subtitle="The latest pieces from Chapter I"
        products={latest}
        viewAllTo="/shop?sort=newest"
      />

      {/* 6 — Hot selling */}
      <ProductCarousel
        title="Hot Selling"
        subtitle="Most loved by our customers"
        products={featured.length ? featured : products.slice(0, 10)}
        viewAllTo="/shop?sort=featured"
      />

      {/* 7 — Category carousels */}
      <ProductCarousel title="Men" products={byCat('Men').slice(0, 10)} viewAllTo="/shop?cat=Men" />
      <ProductCarousel title="Women" products={byCat('Women').slice(0, 10)} viewAllTo="/shop?cat=Women" />
      <ProductCarousel title="Kids" products={byCat('Kids').slice(0, 10)} viewAllTo="/shop?cat=Kids" />

      {/* 8 — Brand story split */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-8 md:gap-14 items-center">
        <div>
          <p className="text-[11px] tracking-[0.45em] text-smoke mb-4">OUR STORY</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
            BUILT ON LESS,
            <br />
            DESIGNED TO LAST.
          </h2>
          <div className="space-y-4 text-ink/80 leading-relaxed text-[15px]">
            <p>
              Twelve Clothing started with a simple belief — a wardrobe needs
              fewer, better pieces. No noise, no fast-fashion churn. Just
              timeless essentials in premium, comfort-first fabrics.
            </p>
            <p>
              Every piece is cut cleanly and made to last beyond seasons, then
              packed with care and delivered across Pakistan with Cash on
              Delivery.
            </p>
            <p>
              Our vision is simple: become the label you reach for every day —
              one essential at a time.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-block mt-8 border border-ink text-sm tracking-[0.25em] px-10 py-3.5 hover:bg-ink hover:text-ivory transition"
          >
            ABOUT US
          </Link>
        </div>
        <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-cream">
          {storyImg ? (
            <img src={storyImg} alt="Twelve Clothing editorial" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-3xl text-smoke">
              TWELVE
            </div>
          )}
        </div>
      </section>

      {/* 9 — Trust marquee */}
      <Marquee
        className="border-y border-ink/10 py-3 text-sm tracking-[0.2em]"
        items={['Fast Shipping', 'Premium Quality', 'Exceptional Support']}
        itemClassName="text-ink"
      />

      {/* 10 — Editorial feature split */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-8 md:gap-14 items-center">
        <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-cream order-2 md:order-1">
          {editImg ? (
            <img src={editImg} alt="The Essentials Edit" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-3xl text-smoke">
              TWELVE
            </div>
          )}
        </div>
        <div className="order-1 md:order-2">
          <p className="text-[11px] tracking-[0.45em] text-smoke mb-4">SIGNATURE EDIT</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
            THE ESSENTIALS
            <br />
            EDIT
          </h2>
          <p className="text-ink/80 leading-relaxed text-[15px] max-w-md">
            Our signature selection of everyday staples — breathable cottons,
            clean silhouettes, and a palette that pairs with everything you own.
            Designed slowly, worn daily.
          </p>
          <Link
            to="/shop?sort=featured"
            className="inline-block mt-8 bg-ink text-ivory text-sm tracking-[0.25em] px-10 py-3.5 hover:opacity-90 transition"
          >
            SHOP THE EDIT
          </Link>
        </div>
      </section>

      {/* 11 — Dark category banner */}
      <section className="bg-ink text-ivory">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h2 className="font-serif text-2xl md:text-4xl mb-8">Shop Your Favorite Apparel By Category</h2>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {CATS.map((c) => (
              <Link
                key={c.name}
                to={`/shop?cat=${c.name}`}
                className="border border-ivory/20 py-6 md:py-10 text-center hover:bg-ivory hover:text-ink transition"
              >
                <p className="font-serif text-lg md:text-2xl tracking-wide">{c.name}</p>
                <p className="text-[10px] md:text-xs tracking-[0.3em] opacity-60 mt-1">SHOP NOW</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 12 — Reviews */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl mb-1">What Our Customers Are Saying</h2>
          <p className="text-xs text-smoke mb-8 tracking-wide">(Illustrative sample reviews)</p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            {SAMPLE_REVIEWS.map((r, i) => (
              <div
                key={i}
                className="snap-start shrink-0 basis-[80%] sm:basis-[45%] lg:basis-[30%] border border-ink/10 bg-white/50 p-6"
              >
                <Stars n={r.stars} />
                <p className="text-sm text-ink/80 leading-relaxed mt-4">“{r.text}”</p>
                <p className="text-xs text-smoke mt-4 tracking-[0.2em]">— {r.who.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13 — Trust icons */}
      <section className="border-t border-ink/10">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-3 gap-4 text-center">
          {[
            {
              t: 'Free shipping',
              d: 'On all orders',
              icon: (
                <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" strokeLinejoin="round" />
              ),
              wheels: true,
            },
            {
              t: 'Customer service',
              d: '7 days a week on WhatsApp',
              icon: (
                <path d="M4 6h16v9H8l-4 4z" strokeLinejoin="round" />
              ),
            },
            {
              t: 'Secure payment',
              d: 'Cash on Delivery',
              icon: (
                <path d="M6 10V7a6 6 0 0112 0v3M5 10h14v10H5z" strokeLinejoin="round" />
              ),
            },
          ].map((b) => (
            <div key={b.t} className="flex flex-col items-center">
              <span className="w-12 h-12 rounded-full bg-ink text-ivory flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {b.icon}
                  {b.wheels && (
                    <>
                      <circle cx="7" cy="17" r="1.6" />
                      <circle cx="17" cy="17" r="1.6" />
                    </>
                  )}
                </svg>
              </span>
              <p className="font-medium text-sm md:text-base">{b.t}</p>
              <p className="text-xs text-smoke mt-1">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
