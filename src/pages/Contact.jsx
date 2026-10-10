import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { STORE_INSTAGRAM, STORE_WHATSAPP } from '../lib/supabase.js';

function PolicyBlock({ id, title, children }) {
  return (
    <div id={id} className="scroll-mt-32 border-t border-ink/10 pt-8">
      <h2 className="font-serif text-2xl mb-3">{title}</h2>
      <div className="text-sm text-ink/75 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function Contact() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="text-[11px] tracking-[0.45em] text-smoke text-center mb-2">TWELVE CLOTHING</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-2 text-center">About Us</h1>
      <p className="text-center text-smoke text-sm mb-10 tracking-[0.3em]">MINIMAL · TIMELESS · YOU</p>

      <div className="space-y-5 text-ink/85 leading-relaxed">
        <p>
          Twelve Clothing is a minimal fashion label built on a simple belief —
          a wardrobe needs fewer, better pieces. We design timeless essentials
          in premium, comfort-first fabrics, cut cleanly and made to last beyond
          seasons.
        </p>
        <p>
          Every order is packed with care and delivered across Pakistan with
          Cash on Delivery. If you need help with sizing, an order, or an
          exchange, message us — we reply fast.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-10">
        <a
          href={`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent('Assalam o Alaikum! I have a question about Twelve Clothing.')}`}
          target="_blank"
          rel="noreferrer"
          className="border border-ink/15 bg-white/60 p-6 text-center hover:border-ink transition"
        >
          <p className="text-xs tracking-[0.3em] text-smoke mb-2">WHATSAPP</p>
          <p className="font-medium">+{STORE_WHATSAPP}</p>
          <p className="text-sm text-smoke mt-1">Chat with us anytime</p>
        </a>
        <a
          href={STORE_INSTAGRAM}
          target="_blank"
          rel="noreferrer"
          className="border border-ink/15 bg-white/60 p-6 text-center hover:border-ink transition"
        >
          <p className="text-xs tracking-[0.3em] text-smoke mb-2">INSTAGRAM</p>
          <p className="font-medium">@twelveclothing</p>
          <p className="text-sm text-smoke mt-1">Follow for new drops</p>
        </a>
      </div>

      <div className="mt-12 space-y-10">
        <PolicyBlock id="shipping" title="Shipping Policy">
          <p>We deliver all over Pakistan in 3–5 working days.</p>
          <p>
            Delivery charges are confirmed with you on WhatsApp before dispatch.
            Payment is Cash on Delivery — you pay when your order arrives.
          </p>
        </PolicyBlock>

        <PolicyBlock id="returns" title="Returns & Exchange">
          <p>
            We offer a 7-day easy exchange on all unworn items in their original
            condition with tags attached.
          </p>
          <p>
            To arrange an exchange, message us on WhatsApp with your order
            details and we will guide you through it.
          </p>
        </PolicyBlock>

        <PolicyBlock id="privacy" title="Privacy Policy">
          <p>
            We collect only what we need to deliver your order: your name,
            phone number, city, and address.
          </p>
          <p>
            Your information is never sold or shared with third parties. It is
            used solely to process, deliver, and support your order.
          </p>
        </PolicyBlock>

        <PolicyBlock id="terms" title="Terms & Conditions">
          <p>
            By placing an order with Twelve Clothing, you agree to provide
            accurate contact and delivery details.
          </p>
          <p>
            Orders are confirmed via WhatsApp before dispatch. We reserve the
            right to cancel orders with unverifiable details. Product colors may
            vary slightly due to screen settings.
          </p>
        </PolicyBlock>
      </div>
    </div>
  );
}
