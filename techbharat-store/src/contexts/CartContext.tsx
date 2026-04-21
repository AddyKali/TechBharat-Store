import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { Product } from '@/data/mockData';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Debounced save to backend
function useDebouncedSync(items: CartItem[], userId: string | undefined, skip: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!userId || skip) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      fetch(`${API_URL}/api/cart/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      }).catch(() => {}); // Silent fail — localStorage is backup
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, userId, skip]);
}

// Storage key per user
function cartKey(userId?: string) {
  return userId ? `cart_${userId}` : 'cart_guest';
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loadingFromDB, setLoadingFromDB] = useState(false);
  const prevUserIdRef = useRef<string | undefined>(undefined);

  // Sync to DB (skip while loading from DB to avoid overwriting)
  useDebouncedSync(items, user?.id, loadingFromDB);

  // Load correct cart when user changes
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const currentUserId = user?.id;

    // Same user — do nothing
    if (prevUserId === currentUserId) return;
    prevUserIdRef.current = currentUserId;

    if (!currentUserId) {
      // User logged out — show guest cart
      const guestItems = JSON.parse(localStorage.getItem('cart_guest') || '[]');
      setItems(guestItems);
      return;
    }

    // User logged in — fetch their cart from DB
    setLoadingFromDB(true);
    fetch(`${API_URL}/api/cart/${currentUserId}`)
      .then((r) => r.json())
      .then((data) => {
        const dbItems: CartItem[] = (data.items && data.items.length > 0) ? data.items : [];

        // Merge guest cart into user cart (guest items added if not already present)
        const guestItems: CartItem[] = JSON.parse(localStorage.getItem('cart_guest') || '[]');
        const merged = [...dbItems];

        guestItems.forEach((guestItem: CartItem) => {
          const exists = merged.find((m: CartItem) => m.product.id === guestItem.product.id);
          if (!exists) merged.push(guestItem);
        });

        setItems(merged);
        saveToStorage(merged, currentUserId);

        // Clear guest cart after merge
        localStorage.removeItem('cart_guest');

        setLoadingFromDB(false);
      })
      .catch(() => {
        // Fallback: load from localStorage
        const stored = localStorage.getItem(cartKey(currentUserId));
        setItems(stored ? JSON.parse(stored) : []);
        setLoadingFromDB(false);
      });
  }, [user?.id]);

  const saveToStorage = (newItems: CartItem[], userId?: string) => {
    localStorage.setItem(cartKey(userId || user?.id), JSON.stringify(newItems));
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      let newItems;
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prevItems, { product, quantity }];
      }
      
      saveToStorage(newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.product.id !== productId);
      saveToStorage(newItems);
      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      saveToStorage(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(cartKey(user?.id));
    // Also clear from DB
    if (user?.id) {
      fetch(`${API_URL}/api/cart/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [] }),
      }).catch(() => {});
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
