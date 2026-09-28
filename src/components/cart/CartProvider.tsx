'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartItem } from '@/lib/cart/types';
import {
  CART_STORAGE_KEY,
  clearStoredCart,
  readCart,
  writeCart,
} from '@/lib/cart/storage';

type AddInput = Omit<CartItem, 'quantity' | 'addedAt'> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  /** True until the cart has been read from localStorage on the client. */
  hydrated: boolean;
  /** Total number of physical items in the cart. */
  count: number;
  /** Sum of price × quantity across all items. */
  subtotal: number;
  addItem: (input: AddInput) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
  }, []);

  // Persist on change (skipping the initial hydration tick)
  useEffect(() => {
    if (!hydrated) return;
    writeCart(items);
  }, [items, hydrated]);

  // Sync across tabs — one tab changes the cart, all tabs update
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== CART_STORAGE_KEY) return;
      setItems(readCart());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((input: AddInput) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === input.productId);
      if (existing) {
        // Bump quantity — same product added again
        return prev.map((i) =>
          i.productId === input.productId
            ? { ...i, quantity: i.quantity + (input.quantity ?? 1) }
            : i
        );
      }
      const fresh: CartItem = {
        ...input,
        quantity: input.quantity ?? 1,
        addedAt: new Date().toISOString(),
      };
      return [fresh, ...prev];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.productId !== productId);
      }
      return prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, 99) }
          : i
      );
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    clearStoredCart();
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      hydrated,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clear,
    };
  }, [items, hydrated, addItem, removeItem, updateQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}