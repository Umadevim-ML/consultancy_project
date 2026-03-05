
import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cartItems'));
        if (storedCart) {
            setCartItems(storedCart);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, qty, size = 'Queen (78" x 60")') => {
        if (product.countInStock === 0) {
            toast.error(`${product.name} is out of stock!`);
            return;
        }

        const existItem = cartItems.find((x) => x.product === product._id && x.size === size);

        if (existItem) {
            if (existItem.qty + qty > product.countInStock) {
                toast.error(`Only ${product.countInStock} items available in stock.`);
                return;
            }
            setCartItems(
                cartItems.map((x) =>
                    x.product === product._id && x.size === size ? { ...existItem, qty: existItem.qty + qty } : x
                )
            );
        } else {
            if (qty > product.countInStock) {
                toast.error(`Only ${product.countInStock} items available in stock.`);
                return;
            }
            setCartItems([...cartItems, { ...product, product: product._id, qty, size }]);
        }
        toast.success(`${product.name} added to cart!`);
    };

    const removeFromCart = (id, size) => {
        setCartItems(cartItems.filter((x) => !(x.product === id && x.size === size)));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
