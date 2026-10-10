import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'twelve-cart-v1';

/**
 * Cart item shape:
 * { key, productId, name, price, image, size, color, qty }
 */
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const addItem = (product, { size, color, qty = 1 }) => {
    const key = `${product.id}|${size || ''}|${color || ''}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.images?.[0] || '',
          size: size || '',
          color: color || '',
          qty,
        },
      ];
    });
  };

  const updateQty = (key, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty } : i))
    );
  };

  const removeItem = (key) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const clearCart = () => setItems([]);

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        count: acc.count + i.qty,
        subtotal: acc.subtotal + i.qty * Number(i.price),
      }),
      { count: 0, subtotal: 0 }
    );
  }, [items]);

  const value = useMemo(
    () => ({ items, addItem, updateQty, removeItem, clearCart, count, subtotal }),
    [items, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
