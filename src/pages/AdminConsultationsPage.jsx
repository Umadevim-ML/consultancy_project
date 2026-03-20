
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaCheck, FaTimes, FaCalendarPlus, FaTrash, FaSpinner, FaCalendarAlt, FaClock, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Approved: 'bg-green-100 text-green-800 border-green-300',
    Rejected: 'bg-red-100 text-red-800 border-red-300',
    Cancelled: 'bg-red-100 text-red-800 border-red-300',
    Completed: 'bg-blue-100 text-blue-800 border-blue-300',
};

const AdminConsultationsPage = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Slot Management State
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [showSlotManager, setShowSlotManager] = useState(false);
    const [slotDate, setSlotDate] = useState('');
    const [slotTime, setSlotTime] = useState('');
    const [slotActionLoading, setSlotActionLoading] = useState(false);

    const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
    };



    const fetchConsultations = async () => {
        try {
            const { data } = await axios.get('/api/consultations', config);
            setConsultations(data);
        } catch (error) {
            toast.error('Failed to load consultations');
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
            const { data } = await axios.get('/api/slots', config);
            setSlots(data);
        } catch (error) {
            toast.error('Failed to load slots');
        } finally {
            setSlotsLoading(false);
        }
    };

    const fetchUsers = async () => {
        // Obsolete
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }
        fetchConsultations();
        fetchSlots();
    }, [user, navigate, authLoading]);

    const addSlotHandler = async (e) => {
        e.preventDefault();
        if (!slotDate || !slotTime) return toast.error('Please fill all fields');

        setSlotActionLoading(true);
        try {
            await axios.post('/api/slots', { date: slotDate, time: slotTime }, config);
            toast.success('Slot added successfully');
            setSlotTime('');
            fetchSlots();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add slot');
        } finally {
            setSlotActionLoading(false);
        }
    };

    const deleteSlotHandler = async (id) => {
        if (!window.confirm('Are you sure you want to delete this slot?')) return;

        try {
            await axios.delete(`/api/slots/${id}`, config);
            toast.success('Slot deleted');
            fetchSlots();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete slot');
        }
    };

    const updateStatus = async (id, status) => {
        setActionLoading(id + status);
        try {
            await axios.put(`/api/consultations/${id}`, { status }, config);
            toast.success(`Consultation marked as ${status}`);
            fetchConsultations();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setActionLoading('');
        }
    };

    const deleteConsultation = async (id) => {
        setActionLoading(id + 'delete');
        try {
            await axios.delete(`/api/consultations/${id}`, config);
            toast.success('Consultation deleted');
            setConfirmDelete(null);
            fetchConsultations();
        } catch (error) {
            toast.error('Failed to delete consultation');
        } finally {
            setActionLoading('');
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
                    onClick={() => setShowSlotManager(!showSlotManager)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
                >
                    <FaCalendarAlt /> {showSlotManager ? 'View Consultations' : 'Manage Availability Slots'}
                </button>
            </div>

            {showSlotManager ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaPlus className="text-blue-600" /> Add Available Slot
                        </h2>
                        <form onSubmit={addSlotHandler} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={slotDate}
                                    onChange={(e) => setSlotDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={slotTime}
                                    onChange={(e) => setSlotTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={slotActionLoading}
                                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {slotActionLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />} Add Slot
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Time</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {slotsLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center"><FaSpinner className="animate-spin text-blue-600 mx-auto text-2xl" /></td>
                                    </tr>
                                ) : slots.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No slots created yet.</td>
                                    </tr>
                                ) : (
                                    slots.map((slot) => (
                                        <tr key={slot._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                {new Date(slot.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                                                <FaClock className="text-blue-500" /> {slot.time}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${slot.isBooked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {slot.isBooked ? 'Booked' : 'Available'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {!slot.isBooked && (
                                                    <button
                                                        onClick={() => deleteSlotHandler(slot._id)}
                                                        className="text-red-500 hover:text-red-700 p-2 transition"
                                                        title="Delete Slot"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <>



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
                                                    {confirmDelete === c._id ? (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => deleteConsultation(c._id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Confirm</button>
                                                            <button onClick={() => setConfirmDelete(null)} className="bg-gray-400 text-white px-2 py-1 rounded text-xs">No</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmDelete(c._id)}
                                                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}


        </div>
    );
};

export default AdminConsultationsPage;
