import { Link, useParams } from 'react-router-dom';

export default function OrderSuccess() {
  const { orderId } = useParams();
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-ink text-ivory dark:bg-ivory dark:text-ink flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="font-serif text-4xl mb-4">Thank you!</h1>
      <p className="text-ink/80 dark:text-ivory/80">
        Your order has been received. We will confirm it on WhatsApp shortly.
      </p>
      <div className="inline-block mt-6 border border-ink/20 dark:border-ivory/20 bg-white/60 dark:bg-white/5 px-8 py-4">
        <p className="text-[11px] tracking-[0.3em] text-smoke dark:text-ivory/60">ORDER ID</p>
        <p className="font-serif text-2xl tracking-wider mt-1">{orderId}</p>
      </div>
      <div className="mt-10">
        <Link to="/shop" className="inline-block bg-ink text-ivory dark:bg-ivory dark:text-ink text-sm tracking-[0.25em] px-10 py-3.5">
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  );
}
