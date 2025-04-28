import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types/cartTypes';

const STORAGE_KEY = 'cart';

const loadFromStorage = (): CartItem[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveToStorage = (items: CartItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

interface CartState {
    items: CartItem[];
    isCartOpen: boolean;
}

const initialState: CartState = {
    items: loadFromStorage(),
    isCartOpen: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action: PayloadAction<CartItem>) {
            const existing = state.items.find(item =>
                item.id === action.payload.id &&
                item.variationId === action.payload.variationId &&
                JSON.stringify(item.attributes) === JSON.stringify(action.payload.attributes)
            );

            if (existing) {
                existing.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }

            saveToStorage(state.items);
        },

        updateQuantity(state, action: PayloadAction<{ id: number; variationId?: number; quantity: number }>) {
            const item = state.items.find(i =>
                i.id === action.payload.id &&
                i.variationId === action.payload.variationId
            );
            if (item) item.quantity = action.payload.quantity;

            saveToStorage(state.items);
        },

        removeFromCart(state, action: PayloadAction<{ id: number; variationId?: number }>) {
            state.items = state.items.filter(
                i => !(i.id === action.payload.id && i.variationId === action.payload.variationId)
            );

            saveToStorage(state.items);
        },

        clearCart(state) {
            state.items = [];
            saveToStorage([]);
        },

        setCartOpen(state, action: PayloadAction<boolean>) {
            state.isCartOpen = action.payload;
        },
    },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;
