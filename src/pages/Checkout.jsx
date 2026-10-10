import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useCart } from '../context/CartContext.jsx';
import { formatPKR, isValidPakPhone } from '../utils/helpers.js';

const inputCls =
  'w-full border border-ink/20 bg-white/60 px-4 py-3.5 text-sm outline-none focus:border-ink placeholder:text-smoke/70';
const labelCls = 'block text-[11px] tracking-[0.3em] text-smoke mb-1.5';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-4xl mb-4">Nothing to check out</h1>
        <p className="text-smoke text-sm mb-8">Your bag is empty.</p>
        <Link to="/shop" className="inline-block bg-ink text-ivory text-sm tracking-[0.25em] px-10 py-4">
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 3) errs.name = 'Please enter your full name.';
    if (!isValidPakPhone(form.phone))
      errs.phone = 'Enter a valid 11-digit mobile number (e.g. 03001234567).';
    if (form.city.trim().length < 2) errs.city = 'Please enter your city.';
    if (form.address.trim().length < 10) errs.address = 'Please enter your complete delivery address.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setPlacing(true);
    try {
      // Orders go through the secure place_order RPC (see supabase/schema.sql):
      // it inserts with status forced to 'Pending' and returns the new order_id.
      // The public never gets SELECT rights on the orders table.
      const { data: orderId, error } = await supabase.rpc('place_order', {
        p_customer_name: form.name.trim(),
        p_phone: form.phone.trim(),
        p_city: form.city.trim(),
        p_address: form.address.trim(),
        p_notes: form.notes.trim(),
        p_items: items.map((i) => ({
          product_id: i.productId,
          name: i.name,
          size: i.size,
          color: i.color,
          qty: i.qty,
          price: Number(i.price),
        })),
        p_total: subtotal,
        p_payment_method: 'Cash on Delivery',
      });
      if (error) throw error;
      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      setErrors({ submit: 'Could not place your order. Please try again.' });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <p className="text-[11px] tracking-[0.45em] text-smoke mb-2">SECURE CHECKOUT</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-8">Checkout</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={placeOrder} className="space-y-5" noValidate>
          <div>
            <label className={labelCls}>CONTACT DETAILS</label>
            <div className="space-y-4">
              <div>
                <input className={inputCls} placeholder="Full name *" value={form.name} onChange={set('name')} />
                {errors.name && <p className="text-red-700 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <input
                  className={inputCls}
                  placeholder="WhatsApp / phone number *  (e.g. 03001234567)"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={set('phone')}
                />
                {errors.phone && <p className="text-red-700 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>DELIVERY ADDRESS</label>
            <div className="space-y-4">
              <div>
                <input className={inputCls} placeholder="City *" value={form.city} onChange={set('city')} />
                {errors.city && <p className="text-red-700 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <textarea
                  className={inputCls + ' min-h-24'}
                  placeholder="Full delivery address * (house, street, area)"
                  value={form.address}
                  onChange={set('address')}
                />
                {errors.address && <p className="text-red-700 text-xs mt-1">{errors.address}</p>}
              </div>
              <textarea
                className={inputCls}
                placeholder="Order notes (optional)"
                value={form.notes}
                onChange={set('notes')}
              />
            </div>
          </div>

          <div className="border border-ink/15 bg-white/50 p-5">
            <p className="text-[11px] tracking-[0.3em] text-smoke mb-3">PAYMENT METHOD</p>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="radio" checked readOnly className="accent-black" />
              <span>
                Cash on Delivery <span className="text-xs text-smoke">(pay when your order arrives)</span>
              </span>
            </label>
          </div>

          {errors.submit && <p className="text-red-700 text-sm">{errors.submit}</p>}

          <button
            type="submit"
            disabled={placing}
            className="w-full bg-ink text-ivory text-sm tracking-[0.25em] py-4 hover:opacity-90 transition disabled:opacity-50"
          >
            {placing ? 'PLACING ORDER…' : `PLACE ORDER — ${formatPKR(subtotal)}`}
          </button>
          <p className="text-xs text-smoke text-center">
            By placing this order you agree to our exchange policy on the Contact page.
          </p>
        </form>

        <aside className="border border-ink/15 bg-white/50 p-6 h-fit lg:sticky lg:top-36">
          <h2 className="font-serif text-2xl mb-5">Order Summary</h2>
          <div className="space-y-4 text-sm max-h-80 overflow-y-auto nice-scroll pr-1">
            {items.map((i) => (
              <div key={i.key} className="flex gap-3">
                <div className="w-14 h-16 shrink-0 bg-cream overflow-hidden">
                  {i.image ? <img src={i.image} alt={i.name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{i.name}</p>
                  <p className="text-xs text-smoke">
                    {[i.size && `Size: ${i.size}`, i.color && `Color: ${i.color}`, `Qty: ${i.qty}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <span className="shrink-0">{formatPKR(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-ink/15 mt-5 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-smoke">Subtotal</span>
              <span>{formatPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-smoke">Delivery</span>
              <span>On confirmation</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2">
              <span>Total</span>
              <span>{formatPKR(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
