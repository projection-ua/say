import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types/cartTypes';
import { gtagEvent } from '../../gtag';


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

            gtagEvent('add_to_cart', {
                currency: 'UAH',
                value: +action.payload.price * action.payload.quantity,
                items: [{
                    item_id: action.payload.id,
                    item_name: action.payload.name,
                    quantity: action.payload.quantity,
                    price: +action.payload.price,
                }],
            });
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
            const removed = state.items.filter(i =>
                i.id === action.payload.id &&
                i.variationId === action.payload.variationId
            );

            state.items = state.items.filter(
                i => !(i.id === action.payload.id && i.variationId === action.payload.variationId)
            );

            saveToStorage(state.items);

            if (removed.length) {
                gtagEvent('remove_from_cart', {
                    currency: 'UAH',
                    items: removed.map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        quantity: item.quantity,
                        price: +item.price,
                    })),
                });
            }
        },

        clearCart(state) {
            if (state.items.length) {
                gtagEvent('remove_from_cart', {
                    currency: 'UAH',
                    items: state.items.map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        quantity: item.quantity,
                        price: +item.price,
                    })),
                });
            }

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