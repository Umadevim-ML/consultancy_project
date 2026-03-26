
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
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };
    const itemsPrice = cartItems.reduce((acc, item) => {
        const finalPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
        return acc + finalPrice * item.qty;
    }, 0);
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
                    price: item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price,
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

            const { data: createdOrder } = await axios.post('/api/orders', order, config);

            if (paymentMethod === 'Razorpay') {
                const res = await loadRazorpay();
                if (!res) {
                    toast.error('Razorpay SDK failed to load. Are you online?');
                    return;
                }

                const { data: razorpayData } = await axios.post(`/api/orders/${createdOrder._id}/razorpay`, {}, config);

                const options = {
                    key: razorpayData.key,
                    amount: razorpayData.amount,
                    currency: razorpayData.currency,
                    name: "E-Commerce",
                    description: "Order Transaction",
                    order_id: razorpayData.razorpayOrderId,
                    handler: async function (response) {
                        try {
                            await axios.post(`/api/orders/${createdOrder._id}/verify-payment`, {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }, config);

                            clearCart();
                            toast.success('Payment Successful! Order Placed.');
                            navigate('/');
                        } catch (err) {
                            console.error('Payment verification failed', err);
                            toast.error('Payment verification failed.');
                            navigate('/');
                        }
                    },
                    prefill: {
                        name: user?.name,
                        email: user?.email,
                        contact: mobileNumber,
                    },
                    theme: {
                        color: "#2563EB",
                    },
                };
                const paymentObject = new window.Razorpay(options);
                paymentObject.open();

                paymentObject.on('payment.failed', function (response) {
                    toast.error(response.error.description);
                    navigate('/'); // Could also navigate to a specific order failed/pending page
                });

            } else {
                clearCart();
                toast.success('Order Placed Successfully!');
                navigate('/');
            }
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

                    {/* Payment Method */}
                    <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <label 
                            onClick={() => setPaymentMethod('Cash on Delivery')}
                            className={`cursor-pointer p-4 border rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Cash on Delivery"
                                checked={paymentMethod === 'Cash on Delivery'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="hidden"
                            />
                            <span className="text-3xl">💵</span>
                            <div>
                                <p className={`font-bold ${paymentMethod === 'Cash on Delivery' ? 'text-blue-800' : 'text-gray-800'}`}>Cash on Delivery</p>
                                <p className={`text-sm ${paymentMethod === 'Cash on Delivery' ? 'text-blue-600' : 'text-gray-500'}`}>Pay when order arrives.</p>
                            </div>
                        </label>

                        <label 
                            onClick={() => setPaymentMethod('Razorpay')}
                            className={`cursor-pointer p-4 border rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'Razorpay' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Razorpay"
                                checked={paymentMethod === 'Razorpay'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="hidden"
                            />
                            <span className="text-3xl">💳</span>
                            <div>
                                <p className={`font-bold ${paymentMethod === 'Razorpay' ? 'text-blue-800' : 'text-gray-800'}`}>Pay Online</p>
                                <p className={`text-sm ${paymentMethod === 'Razorpay' ? 'text-blue-600' : 'text-gray-500'}`}>Via Razorpay (Cards/UPI/NetBanking)</p>
                            </div>
                        </label>
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
