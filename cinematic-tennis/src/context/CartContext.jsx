import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const localData = localStorage.getItem('wilson_cart');
            const parsed = localData ? JSON.parse(localData) : [];
            if (!Array.isArray(parsed)) return [];

            // Validate items - filter out those without IDs or migrate if possible
            // In this case, just filter out bad ones to prevent crash
            return parsed.filter(item => item && (item.cartId || item._id));
        } catch (e) {
            console.error("Failed to parse cart from local storage", e);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('wilson_cart', JSON.stringify(cart));
        } catch (e) {
            console.error("Failed to save cart to local storage", e);
        }
    }, [cart]);

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
                    ...product,
                    cartId,
                    selectedGrip: options.gripSize,
                    selectedString: options.string,
                    selectedCover: options.cover,
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
