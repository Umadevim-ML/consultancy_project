
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaHome, FaPlus, FaCheckCircle, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user, updateUser } = useContext(AuthContext); 
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [useDefault, setUseDefault] = useState(false);
    const [shouldUpdateDefault, setShouldUpdateDefault] = useState(false);

    // If user has a default address, offer to use it
    useEffect(() => {
        if (user?.defaultAddress && Object.keys(user.defaultAddress).length > 0) {
            setUseDefault(true);
            fillWithDefault();
        }
    }, [user]);

    const fillWithDefault = () => {
        if (user?.defaultAddress) {
            setAddress(user.defaultAddress.address || '');
            setCity(user.defaultAddress.city || '');
            setPostalCode(user.defaultAddress.postalCode || '');
            setCountry(user.defaultAddress.country || '');
            setMobileNumber(user.defaultAddress.mobileNumber || '');
        }
    };

    const handleAddressChoice = (choice) => {
        if (choice === 'saved') {
            setUseDefault(true);
            fillWithDefault();
        } else {
            setUseDefault(false);
            setAddress('');
            setCity('');
            setPostalCode('');
            setCountry('');
            setMobileNumber('');
        }
    };

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
                    product: item.product,
                })),
                shippingAddress: { address, city, postalCode, country },
                paymentMethod,
                mobileNumber,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
                updateDefaultAddress: !useDefault && shouldUpdateDefault, // Trigger backend to save if user said so
            };

            const { data: createdOrder } = await axios.post('/api/orders', order, config);

            // Update local user state if default address was changed
            if (!useDefault && shouldUpdateDefault) {
                const updatedUser = { 
                    ...user, 
                    defaultAddress: { address, city, postalCode, country, mobileNumber } 
                };
                updateUser(updatedUser); 
            }

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
                    navigate('/');
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
        <div className="container mx-auto p-4 max-w-4xl py-12">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Side: Address Selection & Form */}
                <div className="flex-1">
                    <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">Checkout</h1>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
                        {/* Address Choice */}
                        {user?.defaultAddress && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <button 
                                    onClick={() => handleAddressChoice('saved')}
                                    className={`p-6 rounded-2xl border-2 text-left transition ${useDefault ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaHome className={useDefault ? 'text-blue-600' : 'text-gray-400'} />
                                        <span className={`font-bold text-sm uppercase tracking-widest ${useDefault ? 'text-blue-600' : 'text-gray-500'}`}>Saved Address</span>
                                    </div>
                                    <p className="text-gray-900 font-bold leading-tight line-clamp-2">{user.defaultAddress.address}</p>
                                    <p className="text-gray-500 text-xs mt-1 font-medium">{user.defaultAddress.city}, {user.defaultAddress.postalCode}</p>
                                </button>
                                
                                <button 
                                    onClick={() => handleAddressChoice('new')}
                                    className={`p-6 rounded-2xl border-2 text-left transition ${!useDefault ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaPlus className={!useDefault ? 'text-blue-600' : 'text-gray-400'} />
                                        <span className={`font-bold text-sm uppercase tracking-widest ${!useDefault ? 'text-blue-600' : 'text-gray-500'}`}>New Address</span>
                                    </div>
                                    <p className="text-gray-900 font-bold leading-tight">Enter another location</p>
                                    <p className="text-gray-500 text-xs mt-1 font-medium">Deliver to a different place</p>
                                </button>
                            </div>
                        )}

                        <form onSubmit={submitHandler}>
                            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-blue-600" /> Shipping Details
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Street Address</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full street address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        readOnly={useDefault}
                                        className={`w-full p-4 rounded-xl border font-bold transition ${useDefault ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none'}`}
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">City</label>
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            readOnly={useDefault}
                                            className={`w-full p-4 rounded-xl border font-bold transition ${useDefault ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none'}`}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Postal Code</label>
                                        <input
                                            type="text"
                                            placeholder="Zip/Postal"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            readOnly={useDefault}
                                            className={`w-full p-4 rounded-xl border font-bold transition ${useDefault ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Country</label>
                                        <input
                                            type="text"
                                            placeholder="Country"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            readOnly={useDefault}
                                            className={`w-full p-4 rounded-xl border font-bold transition ${useDefault ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none'}`}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Mobile</label>
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value)}
                                            readOnly={useDefault}
                                            className={`w-full p-4 rounded-xl border font-bold transition ${useDefault ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none'}`}
                                            pattern="[0-9+\s\-]{7,15}"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Update Default Flag */}
                            {!useDefault && (
                                <div className="mt-6 flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <input 
                                        type="checkbox" 
                                        id="updateDefault" 
                                        className="w-5 h-5 rounded accent-blue-600"
                                        checked={shouldUpdateDefault}
                                        onChange={(e) => setShouldUpdateDefault(e.target.checked)}
                                    />
                                    <label htmlFor="updateDefault" className="text-sm font-bold text-blue-900 cursor-pointer">
                                        Update my default address permanently for future orders
                                    </label>
                                </div>
                            )}

                            <h2 className="text-xl font-black text-gray-800 mt-10 mb-6 flex items-center gap-2">
                                <FaCheckCircle className="text-blue-600" /> Payment
                            </h2>
                            <div className="space-y-3">
                                <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition cursor-pointer ${paymentMethod === 'Cash on Delivery' ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' : 'border-gray-100'}`} onClick={() => setPaymentMethod('Cash on Delivery')}>
                                    <span className="font-bold text-gray-900">💵 Cash on Delivery</span>
                                    <input type="radio" checked={paymentMethod === 'Cash on Delivery'} readOnly />
                                </label>
                                <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition cursor-pointer ${paymentMethod === 'Razorpay' ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' : 'border-gray-100'}`} onClick={() => setPaymentMethod('Razorpay')}>
                                    <span className="font-bold text-gray-900">💳 Pay Online (Razorpay)</span>
                                    <input type="radio" checked={paymentMethod === 'Razorpay'} readOnly />
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-5 rounded-2xl mt-10 hover:bg-blue-700 font-black text-lg transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-blue-200"
                            >
                                Confirm Order & Play
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side: Order Summary */}
                <div className="lg:w-80">
                    <div className="sticky top-8 space-y-6">
                        <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl">
                            <h2 className="text-xl font-black mb-6 border-b border-gray-800 pb-4 tracking-tighter uppercase text-gray-400">Summary</h2>
                            <div className="space-y-4 font-bold text-sm">
                                <div className="flex justify-between opacity-60">
                                    <span>Subtotal</span>
                                    <span>₹{itemsPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between opacity-60">
                                    <span>Shipping</span>
                                    <span>₹{shippingPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between opacity-60">
                                    <span>Tax (15%)</span>
                                    <span>₹{taxPrice.toFixed(2)}</span>
                                </div>
                                <div className="pt-6 border-t border-gray-800 flex justify-between items-end">
                                    <span className="text-xs uppercase tracking-widest opacity-40">Grand Total</span>
                                    <span className="text-3xl font-black text-blue-400">₹{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
