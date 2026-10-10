import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import ProductCard from '../components/ProductCard.jsx';
import { CATEGORIES, SIZES } from '../utils/helpers.js';

const PRICE_BANDS = [
  { label: 'All prices', min: 0, max: Infinity },
  { label: 'Under Rs. 2,000', min: 0, max: 2000 },
  { label: 'Rs. 2,000 – 4,000', min: 2000, max: 4000 },
  { label: 'Above Rs. 4,000', min: 4000, max: Infinity },
];

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cat = params.get('cat') || 'All';
  const size = params.get('size') || 'All';
  const color = params.get('color') || 'All';
  const bandIdx = Number(params.get('price') || 0);
  const sort = params.get('sort') || 'featured';
  const inStockOnly = params.get('stock') === '1';
  const q = params.get('q') || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  const set = (k, v) => {
    const next = new URLSearchParams(params);
    if (!v || v === 'All' || v === 'featured' || v === '') next.delete(k);
    else next.set(k, v);
    setParams(next);
  };

  const allColors = useMemo(() => {
    const s = new Set();
    products.forEach((p) => (p.colors || []).forEach((c) => s.add(c)));
    return [...s].sort();
  }, [products]);

  const filtered = useMemo(() => {
    const band = PRICE_BANDS[bandIdx] || PRICE_BANDS[0];
    const list = products.filter((p) => {
      if (cat !== 'All' && p.category !== cat) return false;
      if (inStockOnly && !p.in_stock) return false;
      if (size !== 'All' && !(p.sizes || []).includes(size)) return false;
      if (color !== 'All' && !(p.colors || []).includes(color)) return false;
      const price = Number(p.price);
      if (price < band.min || price >= band.max) return false;
      if (q && !`${p.name} ${p.description || ''}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-desc') sorted.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'newest') sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at));
    return sorted;
  }, [products, cat, size, color, bandIdx, sort, inStockOnly, q]);

  const selectCls =
    'w-full border border-ink/20 dark:border-ivory/20 bg-white/60 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-ink dark:focus:border-ivory dark:[color-scheme:dark]';

  const filters = (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] tracking-[0.3em] text-smoke dark:text-ivory/60 mb-2">CATEGORY</p>
        <select value={cat} onChange={(e) => set('cat', e.target.value)} className={selectCls}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[11px] tracking-[0.3em] text-smoke dark:text-ivory/60 mb-2">SIZE</p>
        <select value={size} onChange={(e) => set('size', e.target.value)} className={selectCls}>
          <option value="All">All sizes</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[11px] tracking-[0.3em] text-smoke dark:text-ivory/60 mb-2">COLOR</p>
        <select value={color} onChange={(e) => set('color', e.target.value)} className={selectCls}>
          <option value="All">All colors</option>
          {allColors.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[11px] tracking-[0.3em] text-smoke dark:text-ivory/60 mb-2">PRICE</p>
        <select value={bandIdx} onChange={(e) => set('price', e.target.value)} className={selectCls}>
          {PRICE_BANDS.map((b, i) => (
            <option key={b.label} value={i}>{b.label}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => set('stock', e.target.checked ? '1' : '')}
          className="w-4 h-4 accent-black"
        />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <p className="text-[11px] tracking-[0.45em] text-smoke dark:text-ivory/60 mb-2">TWELVE CLOTHING</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-2">
        {cat !== 'All' ? cat : 'Shop All'}
      </h1>
      <p className="text-sm text-smoke dark:text-ivory/60 mb-8">{filtered.length} product{filtered.length === 1 ? '' : 's'}</p>

      {/* Search */}
      <input
        value={q}
        onChange={(e) => set('q', e.target.value)}
        placeholder="Search products…"
        className="w-full border border-ink/20 dark:border-ivory/20 bg-white/60 dark:bg-white/5 px-4 py-3 mb-6 text-sm outline-none focus:border-ink dark:focus:border-ivory placeholder:text-smoke/70 dark:placeholder:text-ivory/40"
      />

      <div className="md:grid md:grid-cols-[240px_1fr] md:gap-10">
        {/* Desktop filters */}
        <aside className="hidden md:block">
          <div className="sticky top-36">{filters}</div>
        </aside>

        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden border border-ink/25 dark:border-ivory/25 px-4 py-2.5 text-sm tracking-[0.2em]"
            >
              FILTERS
            </button>
            <p className="hidden md:block text-sm text-smoke dark:text-ivory/60">
              Showing {filtered.length} of {products.length}
            </p>
            <select
              value={sort}
              onChange={(e) => set('sort', e.target.value)}
              className="border border-ink/20 dark:border-ivory/20 bg-white/60 dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-ink dark:focus:border-ivory dark:[color-scheme:dark]"
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-smoke dark:text-ivory/60 text-center py-16">Loading products…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-serif text-2xl mb-2">Nothing found</p>
              <p className="text-smoke dark:text-ivory/60 text-sm">Try clearing a filter or two.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-ivory dark:bg-[#141414] p-6 overflow-y-auto nice-scroll shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <p className="font-serif text-2xl">Filters</p>
              <button aria-label="Close filters" onClick={() => setDrawerOpen(false)} className="p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {filters}
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full mt-8 bg-ink text-ivory dark:bg-ivory dark:text-ink text-sm tracking-[0.25em] py-3.5"
            >
              SHOW {filtered.length} PRODUCT{filtered.length === 1 ? '' : 'S'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
