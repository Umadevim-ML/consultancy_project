
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { FaStar, FaHeart } from 'react-icons/fa';
import { WishlistContext } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    const isLiked = isInWishlist(id);

    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await axios.get(`/api/products/${id}`);
            setProduct(data);
        };
        fetchProduct();
    }, [id]);

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post(
                `/api/products/${id}/reviews`,
                { rating, comment },
                config
            );
            toast.success('Review Submitted!');
            // Reload product to show new review
            const { data } = await axios.get(`/api/products/${id}`);
            setProduct(data);
            setComment('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting review');
        }
    };

    const [size, setSize] = useState('Queen (78" x 60")');

    const sizes = [
        'Single (72" x 36")',
        'Diwan (72" x 48")',
        'Queen (78" x 60")',
        'King (78" x 72")',
        'California King (84" x 72")',
    ];

    if (!product) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <Link to="/shop" className="text-blue-600 hover:underline mb-4 inline-block">Back to Shop</Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img src={product.image} alt={product.name} className="w-full rounded shadow-lg" />
                </div>
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <button
                            onClick={() => toggleWishlist(product._id)}
                            className={`p-3 rounded-full shadow-sm transition transform active:scale-90 ${isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400 hover:text-red-400'}`}
                            title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            <FaHeart size={20} />
                        </button>
                    </div>
                    <div className="flex items-center mb-4">
                        <span className="text-yellow-500 mr-2 flex items-center text-xl">
                            {product.rating} <FaStar className="ml-1" />
                        </span>
                        <span>({product.numReviews} reviews)</span>
                    </div>
                    <div className="mb-4">
                        {product.discount > 0 ? (
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 line-through text-lg">₹{product.price}</span>
                                <span className="text-3xl font-bold text-red-600">
                                    ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                                </span>
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-bold">
                                    {product.discount}% OFF
                                </span>
                            </div>
                        ) : (
                            <p className="text-3xl font-bold">₹{product.price}</p>
                        )}
                    </div>
                    <p className="mb-6">{product.description}</p>

                    <div className="mb-4">
                        <strong>Firmness:</strong> {product.firmness}
                    </div>

                    <div className="mb-4">
                        <label className="block font-bold mb-2">Select Size:</label>
                        <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="border p-2 rounded w-full md:w-64"
                        >
                            {sizes.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                        <div className="flex flex-col">
                            <label className="text-xs font-bold mb-1">Quantity:</label>
                            <select
                                value={qty}
                                onChange={(e) => setQty(Number(e.target.value))}
                                className="border p-2 rounded"
                            >
                                {[...Array(product.countInStock > 0 ? product.countInStock : 0).keys()].map((x) => (
                                    <option key={x + 1} value={x + 1}>
                                        {x + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => addToCart(product, qty, size)}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mt-5"
                            disabled={product.countInStock === 0}
                        >
                            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                {product.reviews.length === 0 && <div className="text-gray-600">No reviews yet</div>}
                <div className="space-y-4">
                    {product.reviews.map((review) => (
                        <div key={review._id} className="bg-gray-100 p-4 rounded">
                            <div className="flex items-center justify-between mb-2">
                                <strong>{review.name}</strong>
                                <span className="text-yellow-500 flex items-center">{review.rating} <FaStar /></span>
                            </div>
                            <p>{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">{review.createdAt.substring(0, 10)}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-gray-50 p-6 rounded">
                    <h3 className="text-xl font-bold mb-4">Write a Customer Review</h3>
                    {user ? (
                        <form onSubmit={submitReviewHandler}>
                            <div className="mb-4">
                                <label className="block mb-2">Rating</label>
                                <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full border p-2 rounded">
                                    <option value="1">1 - Poor</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="3">3 - Good</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="5">5 - Excellent</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Comment</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full border p-2 rounded h-24"
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                                Submit Review
                            </button>
                        </form>
                    ) : (
                        <div className="text-red-500">Please <Link to="/login" className="underline">sign in</Link> to write a review.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
