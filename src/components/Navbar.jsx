import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { STORE_WHATSAPP } from '../lib/supabase.js';

const ANNOUNCEMENTS = [
  'CASH ON DELIVERY — ALL OVER PAKISTAN',
  'CHAPTER I · WINTERS 2026-27 — LIVE NOW',
  '7-DAY EASY EXCHANGE ON ALL ORDERS',
];

const NAV_ROW_1 = [
  { to: '/', label: 'Home' },
  { to: '/shop?sort=newest', label: 'New Arrivals' },
  { to: '/shop?cat=Men', label: 'Men' },
  { to: '/shop?cat=Women', label: 'Women' },
];

const NAV_ROW_2 = [
  { to: '/shop?cat=Kids', label: 'Kids' },
  { to: '/shop', label: 'Shop All' },
  { to: '/contact', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

function Wordmark({ compact = false }) {
  return (
    <Link to="/" className="flex flex-col items-start leading-none select-none">
      <span className={`font-serif font-semibold tracking-[0.18em] ${compact ? 'text-xl' : 'text-2xl'}`}>
        TWELVE
      </span>
      <span className="text-[9px] tracking-[0.5em] text-smoke mt-0.5">CLOTHING</span>
    </Link>
  );
}

function SearchOverlay({ onClose }) {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    onClose();
    navigate(`/shop?q=${encodeURIComponent(term.trim())}`);
  };
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="absolute top-0 left-0 right-0 bg-ivory border-b border-ink/10 p-6 md:p-10">
        <form onSubmit={submit} className="max-w-3xl mx-auto flex items-center gap-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent font-serif text-2xl md:text-4xl outline-none placeholder:text-smoke/50"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="p-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { count } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [annIdx, setAnnIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setAnnIdx((i) => (i + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const go = (to) => {
    setDrawerOpen(false);
    navigate(to);
  };

  const navCls = ({ isActive }) =>
    `hover:opacity-60 transition tracking-[0.14em] text-[12px] ${isActive ? 'underline underline-offset-4' : ''}`;

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement bar */}
      <div className="bg-ink text-ivory text-center text-[10px] md:text-[11px] tracking-[0.25em] py-2 px-4">
        <span key={annIdx} className="animate-fade-swap inline-block">
          {ANNOUNCEMENTS[annIdx]}
        </span>
      </div>

      <nav className="bg-ivory/95 backdrop-blur border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center py-3">
            {/* Left: hamburger (mobile) + logo */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 -ml-2"
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
                </svg>
              </button>
              <Wordmark />
            </div>

            {/* Center: two-row nav (desktop) */}
            <div className="hidden lg:flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-8">
                {NAV_ROW_1.map((l) => (
                  <NavLink key={l.label} to={l.to} className={navCls} end={l.to === '/'}>
                    {l.label}
                  </NavLink>
                ))}
              </div>
              <div className="flex items-center gap-8">
                {NAV_ROW_2.map((l) => (
                  <NavLink key={l.label} to={l.to} className={navCls}>
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right: icons */}
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => setSearchOpen(true)} className="p-2" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
              </button>

              <div className="relative">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="p-2"
                  aria-label="Account"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M4.5 20c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" strokeLinecap="round" />
                  </svg>
                </button>
                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                    <div className="absolute right-0 top-11 z-50 w-64 bg-ivory border border-ink/15 shadow-xl p-5">
                      <p className="text-xs tracking-[0.25em] text-smoke mb-2">GUEST CHECKOUT</p>
                      <p className="text-sm mb-4">No account needed — order in under a minute.</p>
                      <a
                        href={`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(
                          'Assalam o Alaikum! I need help with my order.'
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm underline underline-offset-4 mb-2"
                        onClick={() => setAccountOpen(false)}
                      >
                        Track order on WhatsApp
                      </a>
                      <Link
                        to="/contact"
                        className="block text-sm underline underline-offset-4"
                        onClick={() => setAccountOpen(false)}
                      >
                        Contact us
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <button onClick={() => navigate('/cart')} className="relative p-2" aria-label="Open cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 8h15l-1.5 9h-12z" strokeLinejoin="round" />
                  <path d="M6 8l-1-4H2" strokeLinecap="round" />
                  <circle cx="9" cy="20" r="1.4" />
                  <circle cx="17" cy="20" r="1.4" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-ink text-ivory text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-ivory p-6 flex flex-col gap-1 shadow-xl overflow-y-auto nice-scroll">
            <div className="flex items-center justify-between mb-6">
              <Wordmark compact />
              <button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none">
                  <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {[...NAV_ROW_1, ...NAV_ROW_2].map((l) => (
              <button
                key={l.label}
                onClick={() => go(l.to)}
                className="text-left py-3 border-b border-ink/10 font-serif text-xl tracking-wide"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
