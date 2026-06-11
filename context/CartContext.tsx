"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem, Lanche, ItemSimples, CartItemAddon, CartItemMolho } from "@/lib/menu";

type CartContextType = {
  cart: CartItem[];
  addItem: (item: Lanche | ItemSimples, quantity: number, isLanche?: boolean, adicionais?: CartItemAddon[], molhos?: CartItemMolho[], observation?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isUpsellOpen: boolean;
  setIsUpsellOpen: (isOpen: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Hydration safe local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ingarandi-cart");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("ingarandi-cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addItem = (
    item: Lanche | ItemSimples,
    quantity: number,
    isLanche: boolean = false,
    adicionais: CartItemAddon[] = [],
    molhos: CartItemMolho[] = [],
    observation: string = ""
  ) => {
    setCart((prev) => {
      // Create a unique ID based on the item config so identical configs stack
      const addonStr = adicionais.sort((a, b) => a.item.id.localeCompare(b.item.id)).map(a => `${a.item.id}x${a.quantidade}`).join(",");
      const molhoStr = molhos.sort((a, b) => a.item.id.localeCompare(b.item.id)).map(a => `${a.item.id}x${a.quantidade}`).join(",");
      const cartItemId = `${item.id}-${addonStr}-${molhoStr}-${observation.toLowerCase().trim()}`;
      
      const existing = prev.find(c => c.cartItemId === cartItemId);
      if (existing) {
        return prev.map(c => c.cartItemId === cartItemId ? { ...c, quantidade: c.quantidade + quantity } : c);
      }
      return [...prev, { cartItemId, item, isLanche, adicionais, molhos, quantidade: quantity, observacao: observation }];
    });
  };

  const removeItem = (cartItemId: string) => {
    setCart(prev => prev.filter(c => c.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.cartItemId === cartItemId) {
        const newQ = c.quantidade + delta;
        return { ...c, quantidade: Math.max(1, newQ) };
      }
      return c;
    }));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, curr) => {
    const itemTotal = curr.item.preco 
      + curr.adicionais.reduce((a, ad) => a + (ad.item.preco * ad.quantidade), 0)
      + curr.molhos.reduce((a, m) => a + (m.item.preco * m.quantidade), 0);
    return acc + (itemTotal * curr.quantidade);
  }, 0);

  const itemCount = cart.reduce((acc, curr) => acc + curr.quantidade, 0);

  return (
    <CartContext.Provider value={{
      cart, addItem, removeItem, updateQuantity, clearCart, total, itemCount,
      isCartOpen, setIsCartOpen,
      isUpsellOpen, setIsUpsellOpen,
      isCheckoutOpen, setIsCheckoutOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
