
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaArrowLeft, FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt, FaCreditCard, FaShoppingBag, FaCalendarDay } from 'react-icons/fa';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const config = {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, config);
                setOrder(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (!user) {
            navigate('/login');
        } else {
            fetchOrder();
        }
    }, [id, user, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading order details...</p>
        </div>
    );

    if (!order) return (
        <div className="container mx-auto p-4 text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
            <Link to="/dashboard" className="text-blue-600 font-bold hover:underline">Back to Dashboard</Link>
        </div>
    );

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-bold"
            >
                <FaArrowLeft /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FaBox className="text-blue-600" /> Order Details
                    </h1>
                    <p className="text-gray-500 font-mono mt-1">ID: {order._id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {order.isCancelled ? (
                        <span className="px-4 py-2 rounded-full bg-red-100 text-red-700 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <FaTimesCircle /> Cancelled
                        </span>
                    ) : order.isDelivered ? (
                        <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <FaCheckCircle /> Delivered
                        </span>
                    ) : order.isShipped ? (
                        <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <FaTruck /> Shipped
                        </span>
                    ) : (
                        <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <FaClock /> Processing
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-600" />
                            <h2 className="font-bold text-gray-800">Shipping Information</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 font-medium">{user.name}</p>
                            <p className="text-gray-600 mt-2">{order.shippingAddress.address}</p>
                            <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p className="text-gray-600">{order.shippingAddress.country}</p>

                            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                <p className="text-sm">
                                    <span className="font-bold text-blue-800">Delivery Status: </span>
                                    {order.isDelivered ? (
                                        <span className="text-green-700 font-bold underline">Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
                                    ) : order.isShipped ? (
                                        <span className="text-blue-700 font-bold">In Transit - Shipped on {new Date(order.shippedAt).toLocaleDateString()}</span>
                                    ) : (
                                        <span className="text-blue-600">Your order is being prepared for shipment.</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <FaShoppingBag className="text-blue-600" />
                            <h2 className="font-bold text-gray-800">Order Items</h2>
                        </div>
                        <div className="p-6 divide-y divide-gray-100">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-xl shadow-sm border border-gray-100"
                                    />
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Size: {item.size}</span>
                                            {item.product && (
                                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">{item.product.category}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-500">{item.qty} × ₹{item.price.toFixed(2)}</p>
                                        <p className="font-black text-gray-900 mt-1">₹{(item.qty * item.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-6">
                    {/* Payment Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-left">
                            <FaCreditCard className="text-blue-600" />
                            <h2 className="font-bold text-gray-800 text-left">Payment</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500 font-medium">Method:</span>
                                <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg uppercase tracking-wider">{order.paymentMethod}</span>
                            </div>

                            {order.isPaid ? (
                                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                                    <p className="text-xs font-black text-green-700 uppercase tracking-widest flex items-center gap-1">
                                        <FaCheckCircle /> Payment Success
                                    </p>
                                    <p className="text-[10px] text-green-600 mt-1">Paid on {new Date(order.paidAt).toLocaleDateString()}</p>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                                    <p className="text-xs font-black text-orange-700 uppercase tracking-widest flex items-center gap-1">
                                        <FaClock /> Awaiting Payment
                                    </p>
                                    <p className="text-[10px] text-orange-600 mt-1 italic">Please complete payment at delivery/pickup</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="bg-blue-600 rounded-2xl shadow-xl p-8 text-white">
                        <h2 className="text-xl font-black mb-6 border-b border-blue-500 pb-4 tracking-tighter">Price Summary</h2>
                        <div className="space-y-3 font-medium opacity-90 text-sm">
                            <div className="flex justify-between">
                                <span>Items:</span>
                                <span>₹{order.itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>₹{order.shippingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>₹{order.taxPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-blue-500 flex justify-between items-end">
                            <span className="font-bold uppercase tracking-widest text-xs opacity-75">Grand Total</span>
                            <span className="text-3xl font-black tracking-tighter">₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
