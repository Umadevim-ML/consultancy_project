
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaBox, FaCalendarDay, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaArrowLeft } from 'react-icons/fa';

const MyOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get('/api/orders/myorders', config);
                setOrders(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    if (!user) return <div className="text-center py-20">Please login to view your orders.</div>;

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                        <FaShoppingBag className="text-blue-600" /> My Orders History
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Manage and track your mattress orders</p>
                </div>
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-xl transition">
                    <FaArrowLeft /> Back to Dashboard
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 font-bold">Loading your orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <FaShoppingBag size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders found</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        It looks like you haven't placed any orders yet. Check out our mattress collection!
                    </p>
                    <Link to="/shop" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition transform hover:scale-[1.02]">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                                            Order Confirmed
                                        </span>
                                        <span className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                                            <FaCalendarDay className="opacity-50" />
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-3xl font-black text-gray-900">₹{order.totalPrice.toLocaleString()}</span>
                                        <span className="text-gray-400 text-sm font-medium">({order.orderItems?.length || 0} items)</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {order.isPaid ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-green-700 font-bold text-[10px] uppercase tracking-wider border border-green-100">
                                                <FaCheckCircle /> Paid
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-700 font-bold text-[10px] uppercase tracking-wider border border-orange-100">
                                                <FaClock /> Unpaid
                                            </span>
                                        )}

                                        {order.isCancelled ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 text-red-700 font-bold text-[10px] uppercase tracking-wider border border-red-100">
                                                <FaTimesCircle /> Cancelled
                                            </span>
                                        ) : order.isDelivered ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-green-700 font-bold text-[10px] uppercase tracking-wider border border-green-100">
                                                <FaCheckCircle /> Delivered
                                            </span>
                                        ) : order.isShipped ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider border border-blue-100">
                                                <FaBox /> Shipped
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-50 text-yellow-700 font-bold text-[10px] uppercase tracking-wider border border-yellow-100">
                                                <FaHourglassHalf /> Processing
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => navigate(`/order/${order._id}`)}
                                        className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition text-center shadow-lg shadow-gray-200"
                                    >
                                        View Details
                                    </button>
                                    {!order.isPaid && !order.isCancelled && (
                                        <button
                                            className="text-blue-600 font-bold text-sm hover:underline"
                                        >
                                            Complete Payment
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Simple Items Preview */}
                            <div className="bg-gray-50/50 border-t border-gray-100 px-8 py-4 flex items-center gap-4 overflow-x-auto">
                                {order.orderItems?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 pr-4 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                                        <div className="text-[10px] font-bold text-gray-800 line-clamp-1 max-w-[120px]">
                                            {item.name}
                                            <span className="block text-gray-400 font-medium">Qty: {item.qty}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
