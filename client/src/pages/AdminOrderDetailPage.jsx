
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AdminOrderDetailPage = () => {
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

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }
        fetchOrder();
    }, [id, user, navigate]);

    const shipHandler = async () => {
        if (!window.confirm('Mark as shipped?')) return;
        try {
            await axios.put(`http://localhost:5000/api/orders/${id}/ship`, {}, config);
            toast.success('Order marked as shipped');
            fetchOrder();
        } catch (error) {
            toast.error('Error updating shipping status');
        }
    };

    const cancelHandler = async () => {
        if (!window.confirm('Cancel this order?')) return;
        try {
            await axios.put(`http://localhost:5000/api/orders/${id}/cancel`, {}, config);
            toast.success('Order cancelled');
            fetchOrder();
        } catch (error) {
            toast.error('Error cancelling order');
        }
    };

    const deliverHandler = async () => {
        try {
            await axios.put(`http://localhost:5000/api/orders/${id}/deliver`, {}, config);
            toast.success('Order marked as delivered');
            fetchOrder();
        } catch (error) {
            toast.error('Error updating delivery status');
        }
    };

    if (loading) return <div className="container mx-auto p-4">Loading...</div>;
    if (!order) return <div className="container mx-auto p-4">Order not found.</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <button
                onClick={() => navigate('/admin/orders')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
            >
                <FaArrowLeft /> Back to Orders
            </button>

            <h1 className="text-3xl font-bold mb-6">Order Details</h1>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Order Info */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 text-blue-900">Order Info</h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>Order ID:</strong> <span className="font-mono">{order._id}</span></p>
                        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                        <p>
                            <strong>Status:</strong>{' '}
                            {order.isPaid ? (
                                <span className="text-green-600 font-medium">Paid on {new Date(order.paidAt).toLocaleDateString()}</span>
                            ) : (
                                <span className="text-red-500 font-medium">Not Paid</span>
                            )}
                        </p>
                        <p>
                            <strong>Shipping:</strong>{' '}
                            {order.isShipped ? (
                                <span className="text-green-600 font-medium">Shipped on {new Date(order.shippedAt).toLocaleDateString()}</span>
                            ) : (
                                <span className="text-yellow-600 font-medium">Not Shipped</span>
                            )}
                        </p>
                        <p>
                            <strong>Delivery:</strong>{' '}
                            {order.isDelivered ? (
                                <span className="text-green-600 font-medium">Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
                            ) : (
                                <span className="text-yellow-600 font-medium">Pending</span>
                            )}
                        </p>
                        {order.isCancelled && (
                            <p>
                                <strong className="text-red-600">CANCELLED on {new Date(order.cancelledAt).toLocaleDateString()}</strong>
                            </p>
                        )}
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 text-blue-900">Customer Info</h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {order.user?.name || 'N/A'}</p>
                        <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 text-blue-900">Shipping Address</h2>
                    <div className="space-y-2 text-sm">
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 text-blue-900">Payment Details</h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>Method:</strong> {order.paymentMethod}</p>
                        {order.paymentResult && (
                            <>
                                <p><strong>Transaction ID:</strong> {order.paymentResult.id || 'N/A'}</p>
                                <p><strong>Status:</strong> {order.paymentResult.status || 'N/A'}</p>
                                <p><strong>Email:</strong> {order.paymentResult.email_address || 'N/A'}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-blue-900">Order Items</h2>
                <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 border-b pb-4">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-grow">
                                <h3 className="font-medium">{item.name}</h3>
                                {item.product && (
                                    <p className="text-xs text-gray-500">
                                        Category: {item.product?.category} | Firmness: {item.product?.firmness} | Size: {item.size}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm">{item.qty} x ₹{item.price.toFixed(2)}</p>
                                <p className="font-semibold">₹{(item.qty * item.price).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-blue-900">Price Summary</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Items Price:</span>
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
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{order.totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            {!order.isCancelled && !order.isDelivered && (
                <div className="flex flex-wrap justify-center gap-4">
                    {!order.isShipped && (
                        <button
                            onClick={shipHandler}
                            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 text-lg font-medium"
                        >
                            Mark as Shipped
                        </button>
                    )}
                    {order.isShipped && !order.isDelivered && (
                        <button
                            onClick={deliverHandler}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-lg font-medium"
                        >
                            <FaCheck className="inline mr-2" /> Mark as Delivered
                        </button>
                    )}
                    <button
                        onClick={cancelHandler}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 text-lg font-medium"
                    >
                        <FaTimes className="inline mr-2" /> Cancel Order
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrderDetailPage;
