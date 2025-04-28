// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '../types/cartTypes';

const STORAGE_KEY = 'cart-items';

interface CartContextValue {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (item: CartItem) => void;
    updateQuantity: (item: CartItem, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setItems(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = (item: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) =>
                i.id === item.id &&
                (i.variationId ?? null) === (item.variationId ?? null) &&
                JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
            );
            if (existing) {
                return prev.map((i) =>
                    i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            } else {
                return [...prev, item];
            }
        });
    };

    const removeItem = (item: CartItem) => {
        setItems((prev) =>
            prev.filter(
                (i) =>
                    !(
                        i.id === item.id &&
                        (i.variationId ?? null) === (item.variationId ?? null) &&
                        JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
                    )
            )
        );
    };

    const updateQuantity = (item: CartItem, quantity: number) => {
        setItems((prev) =>
            prev.map((i) =>
                i.id === item.id &&
                (i.variationId ?? null) === (item.variationId ?? null) &&
                JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
                    ? { ...i, quantity }
                    : i
            )
        );
    };

    const clearCart = () => setItems([]);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
