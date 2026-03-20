
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-hot-toast';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const config = {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    };

    const fetchWishlist = async () => {
        if (!user) {
            setWishlist([]);
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.get('/api/wishlist', config);
            setWishlist(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const addToWishlist = async (productId) => {
        if (!user) {
            toast.error('Please login to add to wishlist');
            return;
        }
        try {
            const { data } = await axios.post(`/api/wishlist/${productId}`, {}, config);
            setWishlist(data.wishlist);
            toast.success('Added to wishlist');
            // Refresh to get populated list
            fetchWishlist();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding to wishlist');
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user) return;
        try {
            const { data } = await axios.delete(`/api/wishlist/${productId}`, config);
            setWishlist(data.wishlist);
            toast.success('Removed from wishlist');
            // Refresh to get populated list
            fetchWishlist();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error removing from wishlist');
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => (item._id || item) === productId);
    };

    const toggleWishlist = async (productId) => {
        if (isInWishlist(productId)) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
