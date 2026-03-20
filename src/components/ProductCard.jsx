import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { FaStar, FaHeart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    const isLiked = isInWishlist(product._id);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group relative">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product._id);
                }}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transform transition active:scale-95 ${isLiked ? 'bg-red-50 text-red-500' : 'bg-white text-gray-300 hover:text-red-400'}`}
            >
                <FaHeart />
            </button>
            <Link to={`/product/${product._id}`}>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
            </Link>
            <div className="p-4 flex flex-col flex-grow">
                <Link to={`/product/${product._id}`}>
                    <h3 className="text-lg font-bold mb-2 hover:text-blue-600">{product.name}</h3>
                </Link>
                <div className="flex items-center mb-2">
                    <span className="text-yellow-500 mr-1 flex items-center">
                        {product.rating} <FaStar className="ml-1" />
                    </span>
                    <span className="text-gray-500 text-sm">({product.numReviews} reviews)</span>
                </div>
                <div className="text-gray-600 text-sm mb-4 flex-grow">
                    <p>{product.description.substring(0, 60)}...</p>
                </div>
                <div className="mt-auto flex justify-between items-center">
                    <div className="flex flex-col">
                        {product.discount > 0 ? (
                            <>
                                <span className="text-gray-400 line-through text-sm">₹{product.price}</span>
                                <span className="text-xl font-bold text-red-600">
                                    ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <div className="text-xl font-bold text-blue-900">₹{product.price}</div>
                        )}
                    </div>
                    <button
                        onClick={() => addToCart(product, 1)}
                        className={`px-3 py-1 rounded transition ${product.countInStock === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        disabled={product.countInStock === 0}
                    >
                        {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
