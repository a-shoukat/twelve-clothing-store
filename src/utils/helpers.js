export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const CATEGORIES = ['Men', 'Women', 'Kids'];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Format a number as Pakistani rupees: Rs. 2,499 */
export function formatPKR(n) {
  const num = Number(n) || 0;
  return 'Rs. ' + num.toLocaleString('en-PK', { maximumFractionDigits: 0 });
}

/** Pakistani mobile validation: 03XXXXXXXXX (11 digits) */
export function isValidPakPhone(phone) {
  return /^03\d{9}$/.test((phone || '').trim());
}

/** Convert 03XXXXXXXXX -> 92XXXXXXXXXX for wa.me links */
export function toIntlPhone(phone) {
  const p = (phone || '').trim();
  if (/^92\d{10}$/.test(p)) return p;
  if (/^03\d{9}$/.test(p)) return '92' + p.slice(1);
  return p.replace(/\D/g, '');
}

/**
 * Build the WhatsApp confirmation message exactly per spec.
 * No WhatsApp API is used anywhere — this only builds a wa.me link.
 */
export function buildWhatsAppConfirmMessage(order) {
  const itemLines = (order.items || [])
    .map(
      (it) =>
        `- ${it.name}${it.size ? ` (${it.size}` : ''}${
          it.color ? `, ${it.color}` : ''
        }${it.size ? ')' : ''} x${it.qty}`
    )
    .join('\n');
  return (
    `Assalam o Alaikum ${order.customer_name}! Aap ka order ${order.order_id} receive ho gaya hai.\n` +
    `Items:\n${itemLines}\n` +
    `Total: ${formatPKR(order.total)} (${order.payment_method || 'Cash on Delivery'})\n` +
    `Address: ${order.address}, ${order.city}\n` +
    `Kya aap order confirm karti/karte hain? Shukriya!`
  );
}

export function buildWhatsAppLink(phoneIntl, message) {
  return `https://wa.me/${phoneIntl}?text=${encodeURIComponent(message)}`;
}

/** Export an array of flat objects to CSV and trigger a download. */
export function exportToCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.map(escape).join(',')]
    .concat(rows.map((r) => headers.map((h) => escape(r[h])).join(',')))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Flatten an order for CSV export (one row per ordered item). */
export function flattenOrdersForCSV(orders) {
  const rows = [];
  for (const o of orders) {
    const items = o.items || [];
    if (!items.length) {
      rows.push(orderRow(o, {}));
    } else {
      for (const it of items) rows.push(orderRow(o, it));
    }
  }
  return rows;
}

function orderRow(o, it) {
  return {
    order_id: o.order_id,
    status: o.status,
    created_at: o.created_at,
    customer_name: o.customer_name,
    phone: o.phone,
    city: o.city,
    address: o.address,
    notes: o.notes || '',
    item_name: it.name || '',
    item_size: it.size || '',
    item_color: it.color || '',
    item_qty: it.qty || '',
    item_price: it.price || '',
    order_total: o.total,
    payment_method: o.payment_method,
  };
}
