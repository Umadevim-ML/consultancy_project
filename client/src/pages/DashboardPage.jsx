
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [allOrders, setAllOrders] = useState([]); // Admin only
    const [allConsultations, setAllConsultations] = useState([]); // Admin only

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };

                // User Data
                const { data: myOrders } = await axios.get('http://localhost:5000/api/orders/myorders', config);
                setOrders(myOrders);

                const { data: myConsultations } = await axios.get('http://localhost:5000/api/consultations/myconsultations', config);
                setConsultations(myConsultations);

                // Admin Data
                if (user.isAdmin) {
                    const { data: adminOrders } = await axios.get('http://localhost:5000/api/orders', config);
                    setAllOrders(adminOrders);

                    const { data: adminConsultations } = await axios.get('http://localhost:5000/api/consultations', config);
                    setAllConsultations(adminConsultations);
                }

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [user]);

    if (!user) return <div>Please login</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <p className="mb-8">Welcome back, <strong>{user.name}</strong>!</p>

            {user.isAdmin && (
                <div className="mb-12 border-b pb-8">
                    <h2 className="text-2xl font-bold mb-4 text-blue-900">Admin Panel</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-4 rounded shadow">
                            <h3 className="text-xl font-bold mb-2">All Orders ({allOrders.length})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-left"><th>ID</th><th>User</th><th>Total</th><th>Paid</th></tr></thead>
                                    <tbody>
                                        {allOrders.slice(0, 5).map(o => (
                                            <tr key={o._id} className="border-t">
                                                <td className="py-2">{o._id.substring(0, 8)}</td>
                                                <td>{o.user?.name}</td>
                                                <td>${o.totalPrice}</td>
                                                <td>{o.isPaid ? 'Yes' : 'No'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allOrders.length > 5 && <p className="text-xs text-center mt-2">...</p>}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded shadow">
                            <h3 className="text-xl font-bold mb-2">All Consultations ({allConsultations.length})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-left"><th>Date</th><th>User</th><th>Status</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {allConsultations.slice(0, 5).map(c => (
                                            <tr key={c._id} className="border-t">
                                                <td className="py-2">{c.date.substring(0, 10)}</td>
                                                <td>{c.user?.name}</td>
                                                <td>{c.status}</td>
                                                <td>
                                                    {/* Placeholder for approve button */}
                                                    <button className="text-blue-500 text-xs">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-xl font-bold mb-4">My Orders</h2>
                    {orders.length === 0 ? <p>No orders yet.</p> : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order._id} className="border-b pb-2">
                                    <div className="flex justify-between">
                                        <span>Order #{order._id.substring(0, 8)}</span>
                                        <span className="font-bold">${order.totalPrice}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {order.createdAt.substring(0, 10)} | {order.isPaid ? 'Paid' : 'Unpaid'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-xl font-bold mb-4">My Consultations</h2>
                    {consultations.length === 0 ? <p>No consultations booked.</p> : (
                        <div className="space-y-4">
                            {consultations.map(consultation => (
                                <div key={consultation._id} className="border-b pb-2">
                                    <div className="flex justify-between">
                                        <span>{consultation.date.substring(0, 10)} at {consultation.time}</span>
                                        <span className={`font-bold ${consultation.status === 'Approved' ? 'text-green-600' : 'text-yellow-600'}`}>{consultation.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{consultation.issueDescription}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
