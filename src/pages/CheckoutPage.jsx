
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const paymentMethod = 'Cash on Delivery';

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 1000 ? 0 : 50;
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const order = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    size: item.size,
                    product: item.product,   // ObjectId string
                })),
                shippingAddress: { address, city, postalCode, country },
                paymentMethod,
                mobileNumber,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            };

            const { data } = await axios.post('/api/orders', order, config);

            clearCart();
            toast.success('Order Placed Successfully!');
            navigate('/');
        } catch (error) {
            console.error('Order error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Error placing order');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
            <div className="bg-white p-8 rounded shadow-md">
                <form onSubmit={submitHandler}>

                    {/* Shipping Address */}
                    <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Postal Code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Mobile Number (e.g. +91 9876543210)"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="border p-2 rounded"
                            pattern="[0-9+\s\-]{7,15}"
                            title="Please enter a valid mobile number"
                            required
                        />
                    </div>

                    {/* Payment Method — Cash on Delivery only */}
                    <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <span className="text-2xl">💵</span>
                        <div>
                            <p className="font-bold text-green-800">Cash on Delivery</p>
                            <p className="text-sm text-green-600">Pay when your order arrives at your door.</p>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between mb-2"><span>Items</span><span>₹{itemsPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between mb-2"><span>Shipping</span><span>₹{shippingPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between mb-2"><span>Tax</span><span>₹{taxPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-xl mt-4"><span>Total</span><span>₹{totalPrice.toFixed(2)}</span></div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded mt-6 hover:bg-blue-700 font-bold"
                    >
                        Place Order
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
