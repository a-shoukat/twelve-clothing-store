import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useCart } from '../context/CartContext.jsx';
import { formatPKR } from '../utils/helpers.js';
import ProductCarousel from '../components/ProductCarousel.jsx';

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink/10 dark:border-ivory/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-sm tracking-[0.2em]">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? 'rotate-45' : ''}`}
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
      {open && <div className="pb-5 text-sm text-ink/75 dark:text-ivory/75 leading-relaxed">{children}</div>}
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data || null);
      setActiveImg(0);
      setSize('');
      setColor('');
      setQty(1);
      setError('');
      if (data?.sizes?.length === 1) setSize(data.sizes[0]);
      if (data?.colors?.length === 1) setColor(data.colors[0]);
      if (data) {
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(8);
        setRelated(rel || []);
      }
    })();
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) return <div className="p-10 text-center text-smoke dark:text-ivory/60">Loading…</div>;

  const images = product.images?.length ? product.images : [];
  const original = product.original_price || product.compare_at_price;
  const hasDiscount = original && Number(original) > Number(product.price);
  const saveAmt = hasDiscount ? Number(original) - Number(product.price) : 0;
  const soldOut = product.in_stock === false;

  const validate = () => {
    if ((product.sizes?.length || 0) > 0 && !size) {
      setError('Please select a size.');
      return false;
    }
    if ((product.colors?.length || 0) > 0 && !color) {
      setError('Please select a color.');
      return false;
    }
    setError('');
    return true;
  };

  const handleAdd = () => {
    if (!validate()) return;
    addItem(product, { size, color, qty });
    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (!validate()) return;
    addItem(product, { size, color, qty });
    navigate('/checkout');
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] bg-cream dark:bg-[#1a1a1a] overflow-hidden">
            {images[activeImg] ? (
              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-3xl text-smoke dark:text-ivory/40">
                TWELVE
              </div>
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-700 text-white text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full">
                Save Rs.{saveAmt.toLocaleString('en-PK')}
              </span>
            )}
            {soldOut && (
              <span className="absolute top-4 left-4 bg-ink/85 text-ivory text-xs font-semibold tracking-[0.2em] px-3 py-1.5 rounded-full">
                SOLD OUT
              </span>
            )}
            {product.is_new && !soldOut && (
              <span className="absolute top-4 right-4 bg-ivory/90 text-ink text-[11px] tracking-[0.25em] px-3 py-1.5 rounded-full">
                NEW
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`w-16 h-20 shrink-0 overflow-hidden border-2 transition ${
                    i === activeImg ? 'border-ink dark:border-ivory' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-[11px] tracking-[0.35em] text-smoke dark:text-ivory/60">{product.category?.toUpperCase()}</p>
          <h1 className="font-serif text-3xl md:text-5xl mt-2 leading-tight">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-medium">{formatPKR(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-smoke dark:text-ivory/50 line-through">{formatPKR(original)}</span>
                <span className="text-red-700 dark:text-red-400 text-sm font-medium">
                  Save {formatPKR(saveAmt)}
                </span>
              </>
            )}
          </div>

          <p className={`text-sm mt-2 ${soldOut ? 'text-red-700 dark:text-red-400' : 'text-green-800 dark:text-green-400'}`}>
            {soldOut ? 'Currently sold out' : 'In stock — ships in 3–5 working days'}
          </p>

          {(product.sizes?.length || 0) > 0 && (
            <div className="mt-7">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs tracking-[0.3em] text-smoke dark:text-ivory/60">SELECT SIZE</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-12 px-4 py-2.5 border text-sm transition ${
                      size === s
                        ? 'bg-ink text-ivory border-ink dark:bg-ivory dark:text-ink dark:border-ivory'
                        : 'border-ink/25 hover:border-ink dark:border-ivory/25 dark:hover:border-ivory'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(product.colors?.length || 0) > 0 && (
            <div className="mt-6">
              <p className="text-xs tracking-[0.3em] text-smoke dark:text-ivory/60 mb-2">SELECT COLOR</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-4 py-2.5 border text-sm transition ${
                      color === c
                        ? 'bg-ink text-ivory border-ink dark:bg-ivory dark:text-ink dark:border-ivory'
                        : 'border-ink/25 hover:border-ink dark:border-ivory/25 dark:hover:border-ivory'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center gap-3">
            <div className="flex items-center border border-ink/25 dark:border-ivory/25">
              <button className="px-4 py-3.5" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span className="px-2 text-sm w-8 text-center">{qty}</span>
              <button className="px-4 py-3.5" onClick={() => setQty(qty + 1)} aria-label="Increase quantity">
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={soldOut}
              className="flex-1 bg-ink text-ivory dark:bg-ivory dark:text-ink text-sm tracking-[0.25em] py-4 hover:opacity-90 transition disabled:opacity-40"
            >
              ADD TO CART
            </button>
          </div>
          <button
            onClick={handleBuyNow}
            disabled={soldOut}
            className="w-full mt-3 border border-ink dark:border-ivory text-sm tracking-[0.25em] py-4 hover:bg-ink hover:text-ivory dark:hover:bg-ivory dark:hover:text-ink transition disabled:opacity-40"
          >
            BUY NOW
          </button>
          {error && <p className="text-red-700 dark:text-red-400 text-sm mt-3">{error}</p>}

          <div className="mt-8 border-t border-ink/10 dark:border-ivory/10">
            <Accordion title="DESCRIPTION" defaultOpen>
              {product.description || 'A Twelve Clothing essential — minimal, timeless, made to last.'}
            </Accordion>
            <Accordion title="FABRIC & CARE">
              {product.fabric ? (
                <p>
                  Fabric: {product.fabric}
                  <br />
                  Machine wash cold with like colors. Do not bleach. Cool iron if needed.
                </p>
              ) : (
                'Premium comfort-first fabric. Machine wash cold with like colors. Do not bleach.'
              )}
            </Accordion>
            <Accordion title="SHIPPING & RETURNS">
              <p>
                Delivery in 3–5 working days across Pakistan. Cash on Delivery
                available nationwide. 7-day easy exchange on unworn items —
                message us on WhatsApp to arrange.
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related */}
      <ProductCarousel
        title="You May Also Like"
        products={related}
        viewAllTo={`/shop?cat=${product.category}`}
      />
    </div>
  );
}
