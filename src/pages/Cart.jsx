import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPKR } from '../utils/helpers.js';

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 md:py-28 text-center">
        <p className="text-[11px] tracking-[0.45em] text-smoke dark:text-ivory/60 mb-4">SHOPPING BAG</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Your bag is empty</h1>
        <p className="text-smoke dark:text-ivory/60 text-sm mb-8">Beautiful things await.</p>
        <Link
          to="/shop"
          className="inline-block bg-ink text-ivory dark:bg-ivory dark:text-ink text-sm tracking-[0.25em] px-10 py-4 hover:opacity-90 transition"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <p className="text-[11px] tracking-[0.45em] text-smoke dark:text-ivory/60 mb-2">TWELVE CLOTHING</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-8">
        Shopping Bag <span className="text-2xl text-smoke dark:text-ivory/60">({items.length})</span>
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.key} className="flex gap-4 border-b border-ink/10 dark:border-ivory/10 pb-4">
              <div className="w-24 shrink-0 bg-cream dark:bg-[#1a1a1a] overflow-hidden aspect-[4/5]">
                {i.image ? (
                  <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg md:text-xl leading-tight">{i.name}</h3>
                <p className="text-xs text-smoke dark:text-ivory/60 mt-1 tracking-wide">
                  {[i.size && `Size: ${i.size}`, i.color && `Color: ${i.color}`]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-ink/25 dark:border-ivory/25">
                    <button className="px-3 py-1.5" onClick={() => updateQty(i.key, i.qty - 1)} aria-label="Decrease quantity">
                      −
                    </button>
                    <span className="px-1 text-sm w-7 text-center">{i.qty}</span>
                    <button className="px-3 py-1.5" onClick={() => updateQty(i.key, i.qty + 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <span className="font-medium">{formatPKR(i.price * i.qty)}</span>
                </div>
              </div>
              <button
                onClick={() => removeItem(i.key)}
                aria-label="Remove item"
                className="self-start p-1 text-smoke dark:text-ivory/60 hover:text-ink dark:hover:text-ivory transition text-xs tracking-[0.2em] underline underline-offset-4"
              >
                REMOVE
              </button>
            </div>
          ))}
        </div>

        <aside className="border border-ink/15 dark:border-ivory/15 bg-white/50 dark:bg-white/5 p-6 h-fit lg:sticky lg:top-36">
          <h2 className="font-serif text-2xl mb-5">Summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-smoke dark:text-ivory/60">Subtotal</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-smoke dark:text-ivory/60">Delivery</span>
            <span>Calculated on confirmation</span>
          </div>
          <div className="border-t border-ink/15 dark:border-ivory/15 pt-4 flex justify-between text-lg font-semibold mb-6">
            <span>Total</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-ink text-ivory dark:bg-ivory dark:text-ink text-sm tracking-[0.25em] py-4 hover:opacity-90 transition"
          >
            PROCEED TO CHECKOUT
          </button>
          <Link
            to="/shop"
            className="block text-center text-sm tracking-[0.2em] underline underline-offset-4 mt-4 hover:opacity-60"
          >
            CONTINUE SHOPPING
          </Link>
          <div className="mt-6 pt-4 border-t border-ink/10 dark:border-ivory/10 text-xs text-smoke dark:text-ivory/60 space-y-1">
            <p>✓ Cash on Delivery available</p>
            <p>✓ 7-day easy exchange</p>
            <p>✓ Delivery in 3–5 working days</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
