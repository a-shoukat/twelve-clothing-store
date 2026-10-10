import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STORE_INSTAGRAM, STORE_WHATSAPP } from '../lib/supabase.js';

export default function Footer() {
  const [email, setEmail] = useState('');

  const subscribe = (e) => {
    e.preventDefault();
    const msg = `Assalam o Alaikum! Please add me to Twelve Clothing updates.${email.trim() ? ` My email: ${email.trim()}` : ''}`;
    window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
    setEmail('');
  };

  return (
    <footer className="bg-ink text-ivory mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid gap-10 md:grid-cols-4">
        {/* Newsletter */}
        <div>
          <h4 className="font-serif text-2xl mb-2">Sign up for new stories and personal offers</h4>
          <form onSubmit={subscribe} className="mt-4 flex border border-ivory/25">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="E-mail"
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-ivory/40"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="px-5 text-ivory/80 hover:text-ivory transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          <p className="text-xs text-ivory/50 mt-2">Subscribing opens WhatsApp to confirm.</p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs tracking-[0.35em] text-ivory/60 mb-4">REACH US OUT AT</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={`https://wa.me/${STORE_WHATSAPP}`}
                target="_blank"
                rel="noreferrer"
                className="hover:opacity-70 transition"
              >
                WhatsApp: +{STORE_WHATSAPP}
              </a>
            </li>
            <li>
              <a href={STORE_INSTAGRAM} target="_blank" rel="noreferrer" className="hover:opacity-70 transition">
                Instagram: @twelveclothing
              </a>
            </li>
            <li className="text-ivory/60">Delivery: 3–5 working days, nationwide</li>
            <li className="text-ivory/60">Payment: Cash on Delivery</li>
          </ul>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-xs tracking-[0.35em] text-ivory/60 mb-4">SHOP</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:opacity-70 transition">Home</Link></li>
            <li><Link to="/shop?sort=newest" className="hover:opacity-70 transition">New Arrivals</Link></li>
            <li><Link to="/shop?cat=Men" className="hover:opacity-70 transition">Men</Link></li>
            <li><Link to="/shop?cat=Women" className="hover:opacity-70 transition">Women</Link></li>
            <li><Link to="/shop?cat=Kids" className="hover:opacity-70 transition">Kids</Link></li>
            <li><Link to="/shop" className="hover:opacity-70 transition">Shop All</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-xs tracking-[0.35em] text-ivory/60 mb-4">HELP</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/contact" className="hover:opacity-70 transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:opacity-70 transition">Contact</Link></li>
            <li><Link to="/contact#shipping" className="hover:opacity-70 transition">Shipping Policy</Link></li>
            <li><Link to="/contact#returns" className="hover:opacity-70 transition">Returns & Exchange</Link></li>
            <li><Link to="/contact#privacy" className="hover:opacity-70 transition">Privacy Policy</Link></li>
            <li><Link to="/contact#terms" className="hover:opacity-70 transition">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>

      {/* Social */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex items-center gap-5">
          <a href={STORE_INSTAGRAM} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:opacity-70 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href={`https://wa.me/${STORE_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="hover:opacity-70 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 12a9 9 0 01-13.2 8L3 21l1.1-4.4A9 9 0 1121 12z" strokeLinejoin="round" />
              <path d="M9 9.5c.5 2.5 3 5 5.5 5.5l1-1.5 2 1c-.5 1.5-1.5 2-3 1.5-3-1-6-4-7-7-.5-1.5 0-2.5 1.5-3l1 2z" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      <div className="border-t border-ivory/15">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-ivory/50 text-center tracking-[0.2em]">
          © {new Date().getFullYear()} TWELVE CLOTHING — ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
}
