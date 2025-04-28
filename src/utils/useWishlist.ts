// utils/useWishlist.ts
import { useEffect, useState } from 'react';
import { ProductInfo } from '../types/productTypes';

export const useWishlist = () => {
    const [wishlist, setWishlist] = useState<ProductInfo[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('wishlist');
        if (stored) {
            setWishlist(JSON.parse(stored));
        }
    }, []);

    const saveToStorage = (items: ProductInfo[]) => {
        localStorage.setItem('wishlist', JSON.stringify(items));
        setWishlist(items); // 🔁 оновлення стейту, щоб реакт rerender-нув
    };

    const addToWishlist = (product: ProductInfo) => {
        saveToStorage([...wishlist, product]);
    };

    const removeFromWishlist = (id: number) => {
        saveToStorage(wishlist.filter(p => p.id !== id));
    };

    const isInWishlist = (id: number) => wishlist.some(p => p.id === id);

    return { wishlist, addToWishlist, removeFromWishlist, isInWishlist };
};
