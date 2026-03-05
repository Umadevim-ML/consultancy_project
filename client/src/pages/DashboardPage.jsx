
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaBox, FaCalendarDay, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUsers, FaChartLine, FaWallet, FaTruck } from 'react-icons/fa';

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
    const [allOrders, setAllOrders] = useState([]);
    const [allConsultations, setAllConsultations] = useState([]);
    const [myConsultations, setMyConsultations] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };

                const { data: myOrders } = await axios.get('http://localhost:5000/api/orders/myorders', config);
                setOrders(myOrders);

                const { data: userConsulls } = await axios.get('http://localhost:5000/api/consultations/myconsultations', config);
                setMyConsultations(userConsulls);

                if (user.isAdmin) {
                    const { data: adminOrders } = await axios.get('http://localhost:5000/api/orders', config);
                    setAllOrders(adminOrders);

                    const { data: adminConsultations } = await axios.get('http://localhost:5000/api/consultations', config);
                    setAllConsultations(adminConsultations);

                    const { data: adminStats } = await axios.get('http://localhost:5000/api/admin/stats', config);
                    setStats(adminStats);
                }

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [user]);

    if (!user) return <div className="text-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>Please login...</div>;

    return (
        <div className="container mx-auto p-4 text-center">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="mb-8 text-gray-600">Welcome back, <strong>{user.name}</strong>!</p>

            {/* ── Admin Panel ── */}
            {user.isAdmin && (
                <div className="mb-12 border-b pb-8">
                    <h2 className="text-2xl font-bold mb-6 text-blue-900 flex items-center justify-center gap-2">
                        <FaChartLine /> Business Analytics
                    </h2>

                    {/* Stats Grid */}
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                            {/* Total Sales */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-2xl shadow-lg text-white text-left">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-white/20 p-2 rounded-lg"><FaWallet size={20} /></div>
                                    {stats.monthlySales?.length > 0 && (
                                        <span className="text-[10px] bg-green-500/80 px-2 py-0.5 rounded-full font-bold">LIVE</span>
                                    )}
                                </div>
                                <div className="text-sm font-medium opacity-80">Total Revenue</div>
                                <div className="text-2xl font-black mt-1 tracking-tighter">₹{stats.totalSales.toLocaleString()}</div>
                                <div className="mt-3 pt-3 border-t border-white/20">
                                    <div className="text-[10px] opacity-70 font-bold uppercase tracking-widest mb-1">This Month</div>
                                    <div className="text-lg font-bold">
                                        ₹{(stats.monthlySales.find(m => m.month === [
                                            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                                        ][new Date().getMonth()])?.total || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Total Orders */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-left">
                                <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                                    <FaShoppingBag size={20} />
                                </div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Orders</div>
                                <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalOrders}</div>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold flex items-center gap-1">
                                        <FaTruck className="text-[8px]" /> {stats.totalShipped} Shipped
                                    </span>
                                    <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 font-bold flex items-center gap-1">
                                        <FaCheckCircle className="text-[8px]" /> {stats.totalDelivered} Delivered
                                    </span>
                                </div>
                            </div>

                            {/* Total Users */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-left">
                                <div className="bg-purple-50 text-purple-600 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                                    <FaUsers size={20} />
                                </div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customers</div>
                                <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalUsers}</div>
                                <div className="text-[10px] mt-2 text-gray-400 font-medium">Registered Active Users</div>
                            </div>

                            {/* Total Consultations */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-left">
                                <div className="bg-orange-50 text-orange-600 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                                    <FaCalendarDay size={20} />
                                </div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Consultations</div>
                                <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalConsultations}</div>
                                <div className="text-[10px] mt-2 text-gray-400 font-medium">Booked Appointments</div>
                            </div>

                            {/* Total Products */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-left">
                                <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                                    <FaBox size={20} />
                                </div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory</div>
                                <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalProducts}</div>
                                <div className="text-[10px] mt-2 text-gray-400 font-medium">Total Products Listed</div>
                            </div>
                        </div>
                    )}

                    {/* Monthly Performance Chart (Simple CSS) */}
                    {stats && stats.monthlySales?.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 text-left">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaChartLine className="text-blue-500" /> Monthly Revenue Performance ({new Date().getFullYear()})
                            </h3>
                            <div className="flex items-end gap-2 md:gap-4 h-48 overflow-x-auto pb-4">
                                {stats.monthlySales.map((m, i) => {
                                    const maxVal = Math.max(...stats.monthlySales.map(x => x.total));
                                    const height = (m.total / maxVal) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group min-w-[40px]">
                                            <div className="relative w-full flex flex-col items-center h-full justify-end">
                                                <div
                                                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600 relative"
                                                    style={{ height: `${height}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 font-bold">
                                                        ₹{m.total.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 mt-3 rotate-[-45deg] md:rotate-0">{m.month}</span>
                                        </div>
                                    )
                                })}
                                {/* Fill remaining months if any */}
                                {stats.monthlySales.length < 12 && Array(12 - stats.monthlySales.length).fill(0).map((_, i) => (
                                    <div key={`empty-${i}`} className="flex-1 flex flex-col items-center min-w-[40px]">
                                        <div className="h-full flex items-end w-full">
                                            <div className="w-full bg-gray-50 h-2 rounded-t-lg"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-300 mt-3">...</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Admin Orders Preview */}
                        <div className="bg-white p-4 rounded shadow text-left">
                            <div className="flex justify-between items-center mb-3 text-left">
                                <h3 className="text-xl font-bold">All Orders ({allOrders.length})</h3>
                                <Link to="/admin/orders" className="text-blue-600 text-sm hover:underline">View All →</Link>
                            </div>
                            <div className="overflow-x-auto text-left">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-left text-gray-500 text-xs uppercase"><th className="pb-2">ID</th><th>User</th><th>Total</th><th>Paid</th></tr></thead>
                                    <tbody>
                                        {allOrders.slice(0, 5).map(o => (
                                            <tr key={o._id} className="border-t">
                                                <td className="py-2 font-mono text-xs text-left">{o._id.substring(0, 8)}</td>
                                                <td>{o.user?.name}</td>
                                                <td>₹{o.totalPrice}</td>
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
                            <div className="flex justify-between items-center mb-3 text-left">
                                <h3 className="text-xl font-bold">All Consultations ({allConsultations.length})</h3>
                                <Link to="/admin/consultations" className="text-blue-600 text-sm hover:underline">Manage →</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── User Section ── */}
            {!user.isAdmin && (
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* My Orders History */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left">
                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                                    <FaShoppingBag className="text-blue-500" /> Recent Orders
                                </h2>
                                <Link to="/myorders" className="text-blue-600 text-sm font-bold hover:underline">
                                    View All →
                                </Link>
                            </div>

                            {orders.length === 0 ? (
                                <p className="text-gray-500 py-10 text-center">No orders found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {orders.slice(0, 3).map(order => (
                                        <div key={order._id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-gray-800">Order ID: #{order._id.substring(order._id.length - 8)}</div>
                                                <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalPrice}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mb-2 inline-block ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {order.isDelivered ? 'Delivered' : 'Processing'}
                                                </div>
                                                <Link to={`/order/${order._id}`} className="block text-xs font-bold text-blue-600 hover:underline">Details</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* My Consultations */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left">
                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                                    <FaCalendarDay className="text-blue-500" /> Consultations
                                </h2>
                                <Link to="/consultation" className="text-blue-600 text-sm font-bold hover:underline">
                                    Book New +
                                </Link>
                            </div>

                            {myConsultations.length === 0 ? (
                                <p className="text-gray-500 py-10 text-center">No bookings found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {myConsultations.slice(0, 3).map(c => (
                                        <div key={c._id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-gray-800 tracking-tight">{new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1"><FaClock className="text-[10px]" /> {c.time}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${STATUS_BADGE[c.status] || 'bg-gray-100'}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
