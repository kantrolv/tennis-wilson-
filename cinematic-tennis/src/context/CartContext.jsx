import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const localData = localStorage.getItem('wilson_cart');
            return localData ? JSON.parse(localData) : [];
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

    const addToCart = (product, gripSize, quantity = 1) => {
        setCart(prevCart => {
            // Check if item with same ID AND grip size exists
            const existingItemIndex = prevCart.findIndex(
                item => item._id === product._id && item.selectedGrip === gripSize
            );

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                return [...prevCart, { ...product, selectedGrip: gripSize, quantity }];
            }
        });
        setIsCartOpen(true); // Auto open cart on add
    };

    const removeFromCart = (productId, gripSize) => {
        setCart(prevCart => prevCart.filter(item => !(item._id === productId && item.selectedGrip === gripSize)));
    };

    const updateQuantity = (productId, gripSize, newQty) => {
        if (newQty < 1) return;
        setCart(prevCart => prevCart.map(item =>
            (item._id === productId && item.selectedGrip === gripSize)
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
