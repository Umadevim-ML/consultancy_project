
import React, { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
    const { wishlist, loading } = useContext(WishlistContext);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
    );

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-red-100 p-3 rounded-2xl text-red-600">
                    <FaHeart size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">My Wishlist</h1>
                    <p className="text-gray-500 font-medium">{wishlist.length} saved products</p>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <FaHeart size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Save items you love to your wishlist and they'll show up here so you can easily find them later.
                    </p>
                    <Link to="/shop" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition transform hover:scale-[1.02]">
                        <FaShoppingBag /> Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
