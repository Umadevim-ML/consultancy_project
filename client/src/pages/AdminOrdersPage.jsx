
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';

const AdminOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

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

    const deliverHandler = async (orderId) => {
        try {
            await axios.put(
                `http://localhost:5000/api/orders/${orderId}/deliver`,
                {},
                config
            );
            setMessage('Order marked as delivered');
            fetchOrders();
        } catch (error) {
            setMessage('Error updating delivery status');
        }
    };

    if (loading) return <div className="container mx-auto p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

            {message && (
                <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">
                    {message}
                    <button onClick={() => setMessage('')} className="float-right font-bold">&times;</button>
                </div>
            )}

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
                                <th className="px-4 py-3 text-center">Delivered</th>
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
                                        {order.isDelivered ? (
                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                <FaCheck /> {new Date(order.deliveredAt).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => deliverHandler(order._id)}
                                                className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                                            >
                                                Mark Delivered
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{order.paymentMethod}</td>
                                    <td className="px-4 py-3 text-center">
                                        {order.orderItems.length}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
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
