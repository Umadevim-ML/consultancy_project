
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_BADGE = {
    Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    Approved: 'bg-green-100 text-green-800 border border-green-300',
    Rejected: 'bg-red-100 text-red-800 border border-red-300',
    Cancelled: 'bg-red-100 text-red-800 border border-red-300',
    Completed: 'bg-blue-100 text-blue-800 border border-blue-300',
};

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [allConsultations, setAllConsultations] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };

                const { data: myOrders } = await axios.get('http://localhost:5000/api/orders/myorders', config);
                setOrders(myOrders);

                const { data: myConsultations } = await axios.get('http://localhost:5000/api/consultations/myconsultations', config);
                setConsultations(myConsultations);

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
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="mb-8 text-gray-600">Welcome back, <strong>{user.name}</strong>!</p>

            {/* ── Admin Panel ── */}
            {user.isAdmin && (
                <div className="mb-12 border-b pb-8">
                    <h2 className="text-2xl font-bold mb-4 text-blue-900">Admin Panel</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Admin Orders Preview */}
                        <div className="bg-white p-4 rounded shadow">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xl font-bold">All Orders ({allOrders.length})</h3>
                                <Link to="/admin/orders" className="text-blue-600 text-sm hover:underline">View All →</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-left text-gray-500 text-xs uppercase"><th className="pb-2">ID</th><th>User</th><th>Total</th><th>Paid</th></tr></thead>
                                    <tbody>
                                        {allOrders.slice(0, 5).map(o => (
                                            <tr key={o._id} className="border-t">
                                                <td className="py-2 font-mono text-xs">{o._id.substring(0, 8)}</td>
                                                <td>{o.user?.name}</td>
                                                <td>${o.totalPrice}</td>
                                                <td>{o.isPaid ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-red-500">No</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allOrders.length > 5 && <p className="text-xs text-center mt-2 text-gray-400">+{allOrders.length - 5} more</p>}
                            </div>
                        </div>

                        {/* Admin Consultations Preview */}
                        <div className="bg-white p-4 rounded shadow">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xl font-bold">All Consultations ({allConsultations.length})</h3>
                                <Link to="/admin/consultations" className="text-blue-600 text-sm hover:underline">Manage →</Link>
                            </div>
                            {/* Mini stats */}
                            <div className="flex gap-2 mb-3 flex-wrap">
                                {['Pending', 'Approved', 'Completed'].map(s => (
                                    <span key={s} className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_BADGE[s]}`}>
                                        {allConsultations.filter(c => c.status === s).length} {s}
                                    </span>
                                ))}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-left text-gray-500 text-xs uppercase"><th className="pb-2">Date</th><th>Customer</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {allConsultations.slice(0, 5).map(c => (
                                            <tr key={c._id} className="border-t">
                                                <td className="py-2">{c.date.substring(0, 10)}</td>
                                                <td>{c.user?.name}</td>
                                                <td>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[c.status] || 'bg-gray-100 text-gray-700'}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allConsultations.length > 5 && <p className="text-xs text-center mt-2 text-gray-400">+{allConsultations.length - 5} more</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── User Section ── */}
            {!user.isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* My Orders */}
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-xl font-bold mb-4">My Orders</h2>
                        {orders.length === 0 ? (
                            <p className="text-gray-500">No orders yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <div key={order._id} className="border-b pb-3">
                                        <div className="flex justify-between">
                                            <span className="font-mono text-sm">#{order._id.substring(0, 8)}</span>
                                            <span className="font-bold">${order.totalPrice}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {order.createdAt.substring(0, 10)} &nbsp;|&nbsp;
                                            <span className={order.isPaid ? 'text-green-600 font-medium' : 'text-red-500'}>
                                                {order.isPaid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Consultations */}
                    <div className="bg-white p-6 rounded shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">My Consultations</h2>
                            <Link
                                to="/consultation"
                                className="text-sm bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg font-medium transition"
                            >
                                + Book New
                            </Link>
                        </div>

                        {consultations.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-gray-500 mb-3">No consultations booked yet.</p>
                                <Link to="/consultation" className="text-blue-600 hover:underline text-sm">Book your first consultation →</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {consultations.map(c => (
                                    <div key={c._id} className="border rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <span className="font-semibold text-gray-800">
                                                    {new Date(c.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-gray-500 text-sm ml-2">at {c.time}</span>
                                            </div>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_BADGE[c.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.issueDescription}</p>
                                        {c.status === 'Pending' && (
                                            <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 px-2 py-1 rounded">
                                                ⏳ Awaiting admin approval
                                            </p>
                                        )}
                                        {c.status === 'Approved' && (
                                            <p className="text-xs text-green-700 mt-2 bg-green-50 px-2 py-1 rounded">
                                                ✅ Your appointment is confirmed!
                                            </p>
                                        )}
                                        {(c.status === 'Cancelled' || c.status === 'Rejected') && (
                                            <p className="text-xs text-red-700 mt-2 bg-red-50 px-2 py-1 rounded">
                                                ❌ This appointment was {c.status.toLowerCase()}. <Link to="/consultation" className="underline">Book a new one</Link>
                                            </p>
                                        )}
                                        {c.status === 'Completed' && (
                                            <p className="text-xs text-blue-700 mt-2 bg-blue-50 px-2 py-1 rounded">
                                                🎉 Consultation completed. Thank you!
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
