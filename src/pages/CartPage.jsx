
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext'; // To verify if user is logged in
import { FaTrash } from 'react-icons/fa';

const CartPage = () => {
    const { cartItems, removeFromCart } = useContext(CartContext);
    const { user } = useContext(AuthContext); // Added
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);

    const checkoutHandler = () => {
        if (!user) { // Added
            navigate('/login?redirect=cart'); // Redirect to login, then back to cart
        } else {
            navigate('/checkout'); // Added
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Your Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <div className="text-center">
                    Your cart is empty <Link to="/shop" className="text-blue-600 underline">Go Back</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product} className="flex items-center justify-between bg-white p-4 rounded shadow-sm">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                                <div className="flex-grow ml-4">
                                    <Link to={`/product/${item.product}`} className="text-lg font-bold hover:underline">{item.name}</Link>
                                    <p className="text-gray-600">₹{item.price}</p>
                                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-4 font-bold">Qty: {item.qty}</span>
                                    <button
                                        onClick={() => removeFromCart(item.product, item.size)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded shadow-md">
                            <h2 className="text-xl font-bold mb-4">Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items</h2>
                            <p className="text-2xl font-bold mb-6">₹{subtotal}</p>
                            <button
                                onClick={checkoutHandler}
                                className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transaction"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
