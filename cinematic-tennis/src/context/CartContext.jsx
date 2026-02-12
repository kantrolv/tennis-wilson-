import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const { user, loading } = useAuth();
    const prevUser = React.useRef(user);



    // Helper to get local cart (safe parse)
    const getLocalCart = () => {
        try {
            const localData = localStorage.getItem('wilson_cart');
            const parsed = localData ? JSON.parse(localData) : [];
            if (!Array.isArray(parsed)) return [];
            // Migration for old data if needed
            return parsed.map(item => ({
                ...item,
                imageUrl: item.imageUrl || item.image
            })).filter(item => item && (item.cartId || item._id));
        } catch (e) {
            console.error("Failed to parse cart from local storage", e);
            return [];
        }
    };

    const [cart, setCart] = useState(getLocalCart);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. On User Change (Login/Logout): Sync strategy
    useEffect(() => {
        if (loading) return; // Wait for auth check to finish

        const syncCart = async () => {
            if (user) {
                // User logged in. Fetch and Merge.
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    };

                    const { data: dbCartItems } = await axios.get('http://localhost:5001/api/cart', config);

                    // Logic: If Local Cart has items and DB is empty -> Push Local to DB
                    // If DB has items -> Overwrite Local
                    // Note: This merging logic only runs once on login/mount

                    if (dbCartItems.length === 0 && cart.length > 0) {
                        // Push local to DB (First time sync)
                        const cartItemsPayload = cart.map(item => {
                            const { _id, ...rest } = item;
                            return {
                                ...rest,
                                qty: item.quantity,
                                imageUrl: item.imageUrl || item.image,
                                product: item.product || _id
                            };
                        });
                        const { data: updatedCart } = await axios.post('http://localhost:5001/api/cart/sync', { cartItems: cartItemsPayload }, config);

                        // Map back for state
                        const mappedUpdatedCart = updatedCart.map(item => ({
                            ...item,
                            quantity: item.qty, // Backend uses qty
                            imageUrl: item.imageUrl
                        }));
                        setCart(mappedUpdatedCart);
                    } else {
                        // DB takes precedence
                        const mappedDbCart = dbCartItems.map(item => ({
                            ...item,
                            quantity: item.qty, // Backend uses qty
                            imageUrl: item.imageUrl
                        }));
                        setCart(mappedDbCart);
                    }
                } catch (error) {
                    console.error("Failed to sync cart with backend", error);
                }
            } else {
                // User logged out (or Guest init)
                // We check prevUser.current which holds the PREVIOUS value because we haven't updated it yet
                if (prevUser.current && !user) {
                    // This was a logout event. Clear cart.
                    console.log("User logged out, clearing cart");
                    setCart([]);
                    try {
                        localStorage.removeItem('wilson_cart');
                    } catch (e) {
                        console.error(e);
                    }
                }
                // Else: It was a refresh or guest-to-guest transition. Keep existing cart.
            }
            setIsInitialized(true); // Mark as ready to save
            prevUser.current = user; // Update ref for next run
        };

        syncCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading]); // Run when user auth state changes or loading completes

    // 2. Persist to LocalStorage (for Guest) OR Backend (for User)
    useEffect(() => {
        // Prevent saving empty state over DB data before initialization is done
        if (!isInitialized) return;

        // Any change to cart -> Persist to LocalStorage as backup
        try {
            localStorage.setItem('wilson_cart', JSON.stringify(cart));
        } catch (e) {
            console.error("Failed to save cart to local storage", e);
        }

        if (user) {
            // User: Save to Backend (Auto-save on every change)
            const saveToDb = async () => {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    };

                    // Map frontend state (quantity) to backend schema (qty)
                    const cartItemsPayload = cart.map(item => {
                        // Strip _id to avoid duplicate key errors (Mongoose will generate unique subdoc IDs)
                        const { _id, ...rest } = item;
                        return {
                            ...rest,
                            qty: item.quantity,
                            imageUrl: item.imageUrl || item.image, // Fallback
                            // Ensure required fields
                            product: item.product || _id
                        };
                    });

                    await axios.post('http://localhost:5001/api/cart/sync', { cartItems: cartItemsPayload }, config);
                } catch (e) {
                    console.error("Failed to save cart to DB", e);
                    // alert("Warning: Failed to save cart to server. Please check your connection."); 
                    // Commented out alert to be less intrusive, but logged error is key. 
                    // If severe, we can uncomment.
                }
            };
            saveToDb();
        }
    }, [cart, user, isInitialized]);

    const addToCart = (product, options, quantity = 1) => {
        setCart(prevCart => {
            // Generate a unique ID for this specific combination
            // options expected: { gripSize, string, cover }
            const cartId = `${product._id}-${options.gripSize}-${options.string?.id || 'none'}-${options.cover?.id || 'none'}`;

            // Calculate total price for this specific item configuration
            const basePrice = product.price;
            const stringPrice = options.string ? options.string.price : 0;
            const coverPrice = options.cover ? options.cover.price : 0;
            const itemPrice = basePrice + stringPrice + coverPrice;

            const existingItemIndex = prevCart.findIndex(item => item.cartId === cartId);

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                return [...prevCart, {
                    ...product, // Note: This spreads product fields. Backend schema needs to match or we need to clean this up before sending.
                    product: product._id, // Add explicit ref for backend
                    cartId,
                    selectedGrip: options.gripSize, // Maps to 'gripSize' in backend
                    selectedString: options.string, // Maps to 'string'
                    selectedCover: options.cover,   // Maps to 'cover'
                    gripSize: options.gripSize,     // Compatibility with backend schema
                    string: options.string,
                    cover: options.cover,
                    price: itemPrice, // Store the calculated price including add-ons
                    basePrice: product.price, // Keep original base price for reference
                    quantity
                }];
            }
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (cartId) => {
        setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, newQty) => {
        if (newQty < 1) return;
        setCart(prevCart => prevCart.map(item =>
            item.cartId === cartId
                ? { ...item, quantity: newQty }
                : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
