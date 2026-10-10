import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import {
  ORDER_STATUSES,
  CATEGORIES,
  formatPKR,
  toIntlPhone,
  buildWhatsAppConfirmMessage,
  buildWhatsAppLink,
  flattenOrdersForCSV,
  exportToCSV,
} from '../utils/helpers.js';

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-900 border-amber-300',
  Confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
  Packed: 'bg-purple-100 text-purple-900 border-purple-300',
  Shipped: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  Delivered: 'bg-green-100 text-green-900 border-green-300',
  Cancelled: 'bg-red-100 text-red-900 border-red-300',
};

const inputCls =
  'w-full border border-ink/20 bg-white/70 px-3 py-2.5 text-sm outline-none focus:border-ink';

function StatusBadge({ status }) {
  return (
    <span className={`inline-block text-xs px-2.5 py-1 border ${STATUS_STYLES[status] || 'border-ink/20'}`}>
      {status}
    </span>
  );
}

/* ------------------------------ ORDERS TAB ------------------------------ */

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (q && !`${o.order_id} ${o.customer_name} ${o.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [orders, search, statusFilter]);

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;

  const updateStatus = async (order, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      setSelected((s) => (s && s.id === order.id ? { ...s, status } : s));
    }
  };

  const whatsappFor = (order) =>
    buildWhatsAppLink(toIntlPhone(order.phone), buildWhatsAppConfirmMessage(order));

  const exportCSV = () =>
    exportToCSV(`twelve-orders-${new Date().toISOString().slice(0, 10)}.csv`, flattenOrdersForCSV(filtered));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="font-serif text-2xl">
          Orders{' '}
          {pendingCount > 0 && (
            <span className="ml-2 align-middle text-xs bg-ink text-ivory px-2.5 py-1">
              {pendingCount} NEW
            </span>
          )}
        </h2>
        <div className="ml-auto flex gap-2">
          <button onClick={exportCSV} className="text-xs tracking-widest border border-ink/25 px-4 py-2 hover:bg-ink hover:text-ivory transition">
            EXPORT CSV
          </button>
          <button onClick={fetchOrders} className="text-xs tracking-widest border border-ink/25 px-4 py-2 hover:bg-ink hover:text-ivory transition">
            REFRESH
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order ID, name, phone…"
          className="flex-1 min-w-52 border border-ink/20 bg-white/70 px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-ink/20 bg-white/70 px-3 py-2.5 text-sm">
          <option value="All">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-smoke py-10 text-center">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <p className="text-smoke py-10 text-center">No orders found.</p>
      ) : (
        <div className="border border-ink/15 bg-white/60 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs tracking-widest text-smoke border-b border-ink/15">
                <th className="p-3">ORDER</th>
                <th className="p-3">CUSTOMER</th>
                <th className="p-3">TOTAL</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">DATE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} onClick={() => setSelected(o)} className="border-b border-ink/10 hover:bg-cream/60 cursor-pointer">
                  <td className="p-3 font-medium">{o.order_id}</td>
                  <td className="p-3">{o.customer_name}<div className="text-xs text-smoke">{o.phone}</div></td>
                  <td className="p-3">{formatPKR(o.total)}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3 text-xs text-smoke">{new Date(o.created_at).toLocaleString('en-PK')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setSelected(null)} />
          <div className="relative bg-ivory w-full sm:max-w-lg max-h-[90vh] overflow-y-auto nice-scroll p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-2xl">{selected.order_id}</h3>
                <p className="text-xs text-smoke">{new Date(selected.created_at).toLocaleString('en-PK')}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-smoke hover:text-ink" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="text-sm space-y-1.5 border-b border-ink/10 pb-4">
              <p><span className="text-smoke">Name:</span> {selected.customer_name}</p>
              <p><span className="text-smoke">Phone:</span> {selected.phone}</p>
              <p><span className="text-smoke">City:</span> {selected.city}</p>
              <p><span className="text-smoke">Address:</span> {selected.address}</p>
              {selected.notes && <p><span className="text-smoke">Notes:</span> {selected.notes}</p>}
              <p><span className="text-smoke">Payment:</span> {selected.payment_method}</p>
            </div>

            <div className="py-4 border-b border-ink/10">
              <p className="text-xs tracking-[0.25em] text-smoke mb-3">ITEMS</p>
              <div className="space-y-2 text-sm">
                {(selected.items || []).map((it, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span>
                      {it.name}
                      <span className="text-smoke"> {it.size ? `(${it.size}` : ''}{it.color ? `, ${it.color}` : ''}{it.size ? ')' : ''} x{it.qty}</span>
                    </span>
                    <span>{formatPKR(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold mt-3">
                <span>Total</span>
                <span>{formatPKR(selected.total)}</span>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs tracking-[0.25em] text-smoke">STATUS</label>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected, e.target.value)}
                  className="border border-ink/20 bg-white/70 px-3 py-2 text-sm"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Opens WhatsApp with a pre-filled message. No WhatsApp API is used. */}
              <a
                href={whatsappFor(selected)}
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-green-700 text-white text-sm tracking-[0.2em] py-3.5 hover:bg-green-800 transition"
              >
                SEND WHATSAPP CONFIRMATION
              </a>
              <p className="text-xs text-smoke text-center">Opens WhatsApp with a pre-filled message — you press Send yourself.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- PRODUCTS TAB ----------------------------- */

const EMPTY_PRODUCT = {
  name: '', price: '', category: 'Women', sizes: '', colors: '',
  description: '', fabric: '', images: [], in_stock: true, featured: false, is_new: true,
};

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | product | 'new'
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchProducts(); }, []);

  const openNew = () => { setForm(EMPTY_PRODUCT); setEditing('new'); };
  const openEdit = (p) => {
    setForm({
      name: p.name, price: String(p.price), category: p.category,
      sizes: (p.sizes || []).join(', '), colors: (p.colors || []).join(', '),
      description: p.description || '', fabric: p.fabric || '',
      images: p.images || [], in_stock: p.in_stock, featured: !!p.featured, is_new: !!p.is_new,
    });
    setEditing(p);
  };

  const uploadImages = async (files) => {
    setUploading(true);
    const urls = [...form.images];
    for (const file of files) {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setForm((f) => ({ ...f, images: urls }));
    setUploading(false);
  };

  const save = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description.trim(),
      fabric: form.fabric.trim(),
      images: form.images,
      in_stock: form.in_stock,
      featured: form.featured,
      is_new: form.is_new,
    };
    let error;
    if (editing === 'new') {
      ({ error } = await supabase.from('products').insert(payload));
    } else {
      ({ error } = await supabase.from('products').update(payload).eq('id', editing.id));
    }
    setSaving(false);
    if (!error) { setEditing(null); fetchProducts(); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await supabase.from('products').delete().eq('id', p.id);
    fetchProducts();
  };

  const toggleStock = async (p) => {
    await supabase.from('products').update({ in_stock: !p.in_stock }).eq('id', p.id);
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-serif text-2xl">Products</h2>
        <button onClick={openNew} className="ml-auto bg-ink text-ivory text-xs tracking-widest px-5 py-2.5">
          + ADD PRODUCT
        </button>
      </div>

      {loading ? (
        <p className="text-smoke py-10 text-center">Loading products…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <div key={p.id} className={`border border-ink/15 bg-white/60 ${!p.in_stock ? 'opacity-60' : ''}`}>
              <div className="aspect-[4/5] bg-cream overflow-hidden">
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3">
                <p className="text-[10px] tracking-[0.25em] text-smoke">{p.category?.toUpperCase()}</p>
                <p className="font-serif truncate">{p.name}</p>
                <p className="text-sm font-medium">{formatPKR(p.price)}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 text-xs border border-ink/25 py-1.5 hover:bg-ink hover:text-ivory transition">EDIT</button>
                  <button onClick={() => toggleStock(p)} className="flex-1 text-xs border border-ink/25 py-1.5 hover:bg-ink hover:text-ivory transition">
                    {p.in_stock ? 'HIDE' : 'SHOW'}
                  </button>
                  <button onClick={() => remove(p)} className="text-xs border border-red-300 text-red-700 px-2.5 py-1.5 hover:bg-red-700 hover:text-white transition">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setEditing(null)} />
          <div className="relative bg-ivory w-full sm:max-w-xl max-h-[90vh] overflow-y-auto nice-scroll p-6 space-y-3">
            <h3 className="font-serif text-2xl mb-2">{editing === 'new' ? 'Add Product' : 'Edit Product'}</h3>
            <input className={inputCls} placeholder="Product name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Price (Rs.) *" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input className={inputCls} placeholder="Sizes (comma separated, e.g. S, M, L)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
            <input className={inputCls} placeholder="Colors (comma separated, e.g. Black, Beige)" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
            <textarea className={inputCls} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className={inputCls} placeholder="Fabric details (e.g. 100% premium cotton)" value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} />

            <div>
              <p className="text-xs tracking-[0.25em] text-smoke mb-2">IMAGES</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.images.map((src, i) => (
                  <div key={i} className="relative w-16 h-20 border border-ink/15">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                      className="absolute -top-2 -right-2 bg-ink text-ivory w-5 h-5 text-xs rounded-full"
                    >✕</button>
                  </div>
                ))}
              </div>
              <label className="inline-block text-xs tracking-widest border border-ink/25 px-4 py-2 cursor-pointer hover:bg-ink hover:text-ivory transition">
                {uploading ? 'UPLOADING…' : 'UPLOAD IMAGES'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadImages([...e.target.files])} />
              </label>
            </div>

            <div className="flex flex-wrap gap-4 text-sm pt-1">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="accent-black" /> In stock (visible in shop)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-black" /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="accent-black" /> New arrival</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="flex-1 border border-ink/25 text-sm tracking-widest py-3">CANCEL</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-ink text-ivory text-sm tracking-widest py-3 disabled:opacity-50">
                {saving ? 'SAVING…' : 'SAVE PRODUCT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------- DASHBOARD ------------------------------ */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <div className="font-serif text-2xl tracking-[0.18em]">TWELVE</div>
          <div className="text-[10px] tracking-[0.5em] text-smoke">ADMIN PANEL</div>
        </div>
        <button onClick={logout} className="ml-auto text-xs tracking-widest border border-ink/25 px-4 py-2 hover:bg-ink hover:text-ivory transition">
          LOG OUT
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-ink/15">
        {['orders', 'products'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm tracking-[0.2em] ${tab === t ? 'border-b-2 border-ink font-semibold -mb-px' : 'text-smoke'}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'orders' ? <OrdersTab /> : <ProductsTab />}
    </div>
  );
}
