
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaCheck, FaTimes, FaCalendarPlus, FaTrash, FaSpinner } from 'react-icons/fa';

const STATUS_COLORS = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Approved: 'bg-green-100 text-green-800 border-green-300',
    Rejected: 'bg-red-100 text-red-800 border-red-300',
    Cancelled: 'bg-red-100 text-red-800 border-red-300',
    Completed: 'bg-blue-100 text-blue-800 border-blue-300',
};

const AdminConsultationsPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showBookModal, setShowBookModal] = useState(false);
    const [bookForm, setBookForm] = useState({ userId: '', date: '', time: '', issueDescription: '' });
    const [users, setUsers] = useState([]);
    const [actionLoading, setActionLoading] = useState('');

    const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
    };

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const fetchConsultations = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/consultations', config);
            setConsultations(data);
        } catch (error) {
            showMsg('Failed to load consultations', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/auth/users', config);
            setUsers(data);
        } catch (error) {
            // Users list optional for the dropdown
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }
        fetchConsultations();
        fetchUsers();
    }, [user, navigate]);

    const updateStatus = async (id, status) => {
        setActionLoading(id + status);
        try {
            await axios.put(`http://localhost:5000/api/consultations/${id}`, { status }, config);
            showMsg(`Consultation marked as ${status}`);
            fetchConsultations();
        } catch (error) {
            showMsg('Failed to update status', 'error');
        } finally {
            setActionLoading('');
        }
    };

    const deleteConsultation = async (id) => {
        if (!window.confirm('Are you sure you want to delete this consultation?')) return;
        setActionLoading(id + 'delete');
        try {
            await axios.delete(`http://localhost:5000/api/consultations/${id}`, config);
            showMsg('Consultation deleted');
            fetchConsultations();
        } catch (error) {
            showMsg('Failed to delete consultation', 'error');
        } finally {
            setActionLoading('');
        }
    };

    const handleAdminBook = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/consultations/admin/book', bookForm, config);
            showMsg('Appointment booked successfully!');
            setShowBookModal(false);
            setBookForm({ userId: '', date: '', time: '', issueDescription: '' });
            fetchConsultations();
        } catch (error) {
            showMsg(error.response?.data?.message || 'Failed to book appointment', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <FaSpinner className="animate-spin text-blue-600 text-4xl" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-blue-900">Manage Consultations</h1>
                    <p className="text-gray-500 mt-1">{consultations.length} total appointment{consultations.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setShowBookModal(true)}
                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold shadow transition"
                >
                    <FaCalendarPlus /> Book Appointment
                </button>
            </div>

            {/* Alert Message */}
            {message.text && (
                <div className={`p-3 rounded mb-4 flex justify-between items-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold text-lg leading-none">&times;</button>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {['Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'].map(status => (
                    <div key={status} className={`p-3 rounded-lg border text-center ${STATUS_COLORS[status]}`}>
                        <div className="text-2xl font-bold">
                            {consultations.filter(c => c.status === status).length}
                        </div>
                        <div className="text-xs font-medium mt-1">{status}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            {consultations.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                    <FaCalendarPlus className="text-gray-300 text-5xl mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No consultations booked yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-900 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Date & Time</th>
                                <th className="px-4 py-3 text-left">Issue</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-left">Booked On</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consultations.map((c) => (
                                <tr key={c._id} className="border-b hover:bg-gray-50 transition">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold">{c.user?.name || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{c.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{new Date(c.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        <div className="text-xs text-gray-500">{c.time}</div>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs">
                                        <p className="truncate text-gray-700" title={c.issueDescription}>{c.issueDescription}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1 flex-wrap">
                                            {c.status === 'Pending' && (
                                                <button
                                                    onClick={() => updateStatus(c._id, 'Approved')}
                                                    disabled={actionLoading === c._id + 'Approved'}
                                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                            )}
                                            {c.status === 'Approved' && (
                                                <button
                                                    onClick={() => updateStatus(c._id, 'Completed')}
                                                    disabled={actionLoading === c._id + 'Completed'}
                                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition disabled:opacity-50"
                                                    title="Mark Completed"
                                                >
                                                    <FaCheck /> Complete
                                                </button>
                                            )}
                                            {(c.status === 'Pending' || c.status === 'Approved') && (
                                                <button
                                                    onClick={() => updateStatus(c._id, 'Cancelled')}
                                                    disabled={actionLoading === c._id + 'Cancelled'}
                                                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition disabled:opacity-50"
                                                    title="Cancel"
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteConsultation(c._id)}
                                                disabled={actionLoading === c._id + 'delete'}
                                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Book Appointment Modal */}
            {showBookModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-blue-900">Book Appointment for Customer</h2>
                            <button onClick={() => setShowBookModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleAdminBook} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                {users.length > 0 ? (
                                    <select
                                        value={bookForm.userId}
                                        onChange={(e) => setBookForm({ ...bookForm, userId: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">-- Select Customer --</option>
                                        {users.filter(u => !u.isAdmin).map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Enter User ID"
                                        value={bookForm.userId}
                                        onChange={(e) => setBookForm({ ...bookForm, userId: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={bookForm.date}
                                        onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={bookForm.time}
                                        onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue / Notes</label>
                                <textarea
                                    value={bookForm.issueDescription}
                                    onChange={(e) => setBookForm({ ...bookForm, issueDescription: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 h-28 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Describe the customer's sleep issue..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBookModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-semibold transition"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminConsultationsPage;
