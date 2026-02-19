
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
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
                    <div className="text-xl font-bold text-blue-900">₹{product.price}</div>
                    <button
                        onClick={() => addToCart(product, 1)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
