import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

// ─── Normalize helper ────────────────────────────────────────────────
// Ensures every cart item always has the fields the frontend AND backend
// expect, regardless of whether the item came from localStorage, from
// addToCart(), or from a DB round-trip (where field names differ).
const normalizeCartItem = (item) => {
    if (!item) return null;

    // quantity / qty reconciliation — frontend uses "quantity", backend uses "qty"
    const quantity = item.quantity ?? item.qty ?? 1;

    return {
        ...item,
        // Required by backend schema
        product: item.product || item._id,
        name: item.name || 'Unknown Product',
        price: item.price ?? 0,
        quantity,                                   // frontend canonical field
        qty: quantity,                              // keep in sync for safety
        cartId: item.cartId || `${item.product || item._id}-default`,
        imageUrl: item.imageUrl || item.image || '',
        gripSize: item.gripSize || item.selectedGrip || 'N/A',

        // Optional add-ons — pass through if present
        string: item.string || item.selectedString || undefined,
        cover: item.cover || item.selectedCover || undefined,
        selectedGrip: item.gripSize || item.selectedGrip || 'N/A',
        selectedString: item.string || item.selectedString || undefined,
        selectedCover: item.cover || item.selectedCover || undefined,
    };
};

// Build a clean payload suitable for POST /api/cart/sync
const buildSyncPayload = (cartItems) => {
    return cartItems.map(item => {
        const n = normalizeCartItem(item);
        return {
            product: n.product,
            name: n.name,
            imageUrl: n.imageUrl,
            price: n.price,
            qty: n.quantity,          // backend schema field
            gripSize: n.gripSize,
            string: n.string || undefined,
            cover: n.cover || undefined,
            cartId: n.cartId,
        };
    });
};

export const CartProvider = ({ children }) => {
    const { user, loading } = useAuth();
    const prevUser = useRef(user);

    // Helper to get local cart (safe parse)
    const getLocalCart = () => {
        try {
            const localData = localStorage.getItem('wilson_cart');
            const parsed = localData ? JSON.parse(localData) : [];
            if (!Array.isArray(parsed)) return [];
            return parsed.map(normalizeCartItem).filter(Boolean);
        } catch (e) {
            console.error("Failed to parse cart from local storage", e);
            return [];
        }
    };

    const [cart, setCart] = useState(getLocalCart);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Flag to skip the redundant backend sync that fires right after
    // the initial fetch sets cart state from the DB.
    const skipNextSync = useRef(false);

    // Debounce timer ref for backend persistence
    const syncTimerRef = useRef(null);

    // ─── 1. On User Change (Login / Logout): Initial Sync ───────────
    useEffect(() => {
        if (loading) return; // Wait for auth check to finish

        const doInitialSync = async () => {
            if (user) {
                // User logged in → fetch their DB cart
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    };

                    const { data: dbCartItems } = await axios.get('http://localhost:5001/api/cart', config);

                    if (dbCartItems.length === 0 && cart.length > 0) {
                        // DB is empty but local has items → push local to DB
                        const payload = buildSyncPayload(cart);
                        const { data: updatedCart } = await axios.post(
                            'http://localhost:5001/api/cart/sync',
                            { cartItems: payload },
                            config
                        );

                        const mapped = updatedCart.map(normalizeCartItem).filter(Boolean);
                        skipNextSync.current = true;   // prevent re-POST of same data
                        setCart(mapped);
                    } else {
                        // DB takes precedence (or both empty)
                        const mapped = dbCartItems.map(normalizeCartItem).filter(Boolean);
                        skipNextSync.current = true;   // prevent re-POST of same data
                        setCart(mapped);
                    }
                } catch (error) {
                    console.error("Failed to sync cart with backend", error);
                }
            } else {
                // User logged out (or guest)
                if (prevUser.current && !user) {
                    console.log("User logged out, clearing cart");
                    setCart([]);
                    try {
                        localStorage.removeItem('wilson_cart');
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            setIsInitialized(true);
            prevUser.current = user;
        };

        doInitialSync();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading]);

    // ─── 2. Persist cart to localStorage + Backend (debounced) ───────
    useEffect(() => {
        if (!isInitialized) return;

        // Always persist to localStorage as backup
        try {
            localStorage.setItem('wilson_cart', JSON.stringify(cart));
        } catch (e) {
            console.error("Failed to save cart to local storage", e);
        }

        // Skip the sync that fires right after initial DB fetch
        if (skipNextSync.current) {
            skipNextSync.current = false;
            return;
        }

        if (user) {
            // Debounce backend sync — 400ms — prevents rapid-fire POSTs
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

            syncTimerRef.current = setTimeout(async () => {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    };

                    const payload = buildSyncPayload(cart);
                    console.log('[CartContext] Syncing to backend:', payload.length, 'items');
                    await axios.post('http://localhost:5001/api/cart/sync', { cartItems: payload }, config);
                    console.log('[CartContext] Backend sync successful');
                } catch (e) {
                    console.error("Failed to save cart to DB", e);
                }
            }, 400);
        }

        return () => {
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        };
    }, [cart, user, isInitialized]);

    // ─── Cart Actions ────────────────────────────────────────────────

    const addToCart = useCallback((product, options, quantity = 1) => {
        setCart(prevCart => {
            const cartId = `${product._id}-${options.gripSize}-${options.string?.id || 'none'}-${options.cover?.id || 'none'}`;

            const basePrice = product.price;
            const stringPrice = options.string ? options.string.price : 0;
            const coverPrice = options.cover ? options.cover.price : 0;
            const itemPrice = basePrice + stringPrice + coverPrice;

            const existingItemIndex = prevCart.findIndex(item => item.cartId === cartId);

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + quantity,
                };
                return newCart;
            } else {
                const newItem = normalizeCartItem({
                    ...product,
                    product: product._id,
                    cartId,
                    selectedGrip: options.gripSize,
                    selectedString: options.string,
                    selectedCover: options.cover,
                    gripSize: options.gripSize,
                    string: options.string,
                    cover: options.cover,
                    price: itemPrice,
                    basePrice: product.price,
                    quantity,
                });
                return [...prevCart, newItem];
            }
        });
        setIsCartOpen(true);
    }, []);

    const removeFromCart = useCallback((cartId) => {
        setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    }, []);

    const updateQuantity = useCallback((cartId, newQty) => {
        if (newQty < 1) return;
        setCart(prevCart => prevCart.map(item =>
            item.cartId === cartId
                ? { ...item, quantity: newQty }
                : item
        ));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const cartTotal = cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0);

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        cartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
