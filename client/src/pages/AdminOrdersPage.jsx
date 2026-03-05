
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AdminOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/orders', config);
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const shipHandler = async (orderId) => {
        if (!window.confirm('Mark this order as shipped?')) return;
        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}/ship`, {}, config);
            toast.success('Order marked as shipped');
            fetchOrders();
        } catch (error) {
            toast.error('Error updating shipping status');
        }
    };

    const cancelHandler = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, config);
            toast.success('Order cancelled');
            fetchOrders();
        } catch (error) {
            toast.error('Error cancelling order');
        }
    };

    const deliverHandler = async (orderId) => {
        try {
            await axios.put(
                `http://localhost:5000/api/orders/${orderId}/deliver`,
                {},
                config
            );
            toast.success('Order marked as delivered');
            fetchOrders();
        } catch (error) {
            toast.error('Error updating delivery status');
        }
    };

    if (loading) return <div className="container mx-auto p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>



            {orders.length === 0 ? (
                <div className="bg-white p-8 rounded shadow text-center">
                    <p className="text-gray-500 text-lg">No orders yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-900 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">Order ID</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3 text-center">Paid</th>
                                <th className="px-4 py-3 text-center">Shipped</th>
                                <th className="px-4 py-3 text-center">Delivered</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-left">Payment Method</th>
                                <th className="px-4 py-3 text-center">Items</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {order._id.substring(0, 10)}...
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>{order.user?.name || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{order.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        ₹{order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {order.isPaid ? (
                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                <FaCheck /> {new Date(order.paidAt).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-red-500"><FaTimes /></span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {order.isShipped ? (
                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                <FaCheck /> {new Date(order.shippedAt).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-red-500"><FaTimes /></span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {order.isDelivered ? (
                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                <FaCheck /> {new Date(order.deliveredAt).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-red-500"><FaTimes /></span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {order.isCancelled ? (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">CANCELLED</span>
                                        ) : order.isDelivered ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">DELIVERED</span>
                                        ) : order.isShipped ? (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">SHIPPED</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">PENDING</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{order.paymentMethod}</td>
                                    <td className="px-4 py-3 text-center">
                                        {order.orderItems.length}
                                    </td>
                                    <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
                                        {!order.isCancelled && !order.isDelivered && (
                                            <>
                                                {!order.isShipped && (
                                                    <button
                                                        onClick={() => shipHandler(order._id)}
                                                        className="text-orange-500 hover:text-orange-700 p-1"
                                                        title="Mark Shipped"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}
                                                {order.isShipped && !order.isDelivered && (
                                                    <button
                                                        onClick={() => deliverHandler(order._id)}
                                                        className="text-green-600 hover:text-green-800 p-1"
                                                        title="Mark Delivered"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => cancelHandler(order._id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title="Cancel Order"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
