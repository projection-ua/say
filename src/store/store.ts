// src/store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['cart', 'wishlist', 'products'], // що зберігати
};

const rootReducer = combineReducers({
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productsReducer,
    categories: categoriesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'persist/FLUSH',
                    'persist/PAUSE',
                    'persist/PURGE',
                    'persist/REGISTER',
                ],
            },
        }),
});


export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
