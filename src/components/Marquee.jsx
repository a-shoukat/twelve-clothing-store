/**
 * Infinite scrolling text strip.
 * `items` are joined with a separator; the row is duplicated for a seamless loop.
 */
export default function Marquee({
  items,
  separator = '|',
  className = '',
  fast = false,
  itemClassName = '',
}) {
  const row = items.join(` ${separator} `);
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <div className={`inline-flex ${fast ? 'animate-marquee-fast' : 'animate-marquee'}`}>
        {[0, 1].map((n) => (
          <span key={n} className={`pr-8 ${itemClassName}`}>
            {row}&nbsp;&nbsp;{separator}&nbsp;&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}
