import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import type { CartItem, Product } from "../types";

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ghaleb_mall_cart";

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.product.discount_price || item.product.price) * item.quantity, 0);
    return {
      items,
      totalItems,
      totalAmount,
      addToCart(product, quantity = 1) {
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          if (existing) {
            return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
          }
          return [...current, { product, quantity }];
        });
      },
      removeFromCart(productId) {
        setItems((current) => current.filter((item) => item.product.id !== productId));
      },
      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          setItems((current) => current.filter((item) => item.product.id !== productId));
          return;
        }
        setItems((current) => current.map((item) => item.product.id === productId ? { ...item, quantity } : item));
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

