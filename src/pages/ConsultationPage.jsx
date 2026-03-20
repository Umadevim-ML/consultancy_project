
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaCalendarPlus, FaHistory, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaCalendarDay, FaSpinner } from 'react-icons/fa';

const ConsultationPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [issueDescription, setIssueDescription] = useState('');
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(null);

    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
        },
    };

    const fetchConsultations = async () => {
        try {
            const { data } = await axios.get('/api/consultations/myconsultations', config);
            setConsultations(data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching consultations');
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async (selectedDate) => {
        setSlotsLoading(true);
        try {
            const { data } = await axios.get(`/api/slots/available/${selectedDate}`, config);
            setSlots(data);
        } catch (error) {
            toast.error('Failed to load slots');
        } finally {
            setSlotsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchConsultations();
        }
    }, [user]);

    useEffect(() => {
        if (date) {
            fetchSlots(date);
            setSelectedSlot(null);
        }
    }, [date]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!selectedSlot) return toast.error('Please select a time slot');

        try {
            await axios.post(
                '/api/consultations',
                {
                    date,
                    time: selectedSlot.time,
                    issueDescription,
                    slotId: selectedSlot._id
                },
                config
            );

            toast.success('Consultation booked successfully!');
            setShowForm(false);
            setDate('');
            setSelectedSlot(null);
            setIssueDescription('');
            fetchConsultations();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error booking consultation');
        }
    };

    const cancelConsultation = async (id) => {
        try {
            await axios.put(`/api/consultations/${id}/cancel`, {}, config);
            toast.success('Consultation cancelled');
            setConfirmCancel(null);
            fetchConsultations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel consultation');
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h2 className="text-2xl mb-4">Please log in to view and book consultations.</h2>
                <button onClick={() => navigate('/login?redirect=consultation')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                    Login Now
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
                    <FaHistory /> Your Consultations
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <FaCalendarPlus /> {showForm ? 'Cancel Booking' : 'Book New Consultation'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold mb-6 text-center text-blue-800 underline decoraton-blue-200">New Appointment Details</h2>
                    <form onSubmit={submitHandler}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700 font-bold">1. Select Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-blue-500 outline-none transition"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700 font-bold">2. Available Slots</label>
                                {slotsLoading ? (
                                    <div className="flex items-center gap-2 text-blue-600 p-3"><FaSpinner className="animate-spin" /> Loading slots...</div>
                                ) : !date ? (
                                    <div className="text-gray-400 p-3 text-sm italic">Please select a date first</div>
                                ) : (slots.length === 0 || slots.every(s => s.isBooked)) ? (
                                    <div className="text-red-500 p-3 text-sm font-bold bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                                        <FaTimesCircle /> No slots available for this date
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {slots.map(slot => (
                                            <button
                                                key={slot._id}
                                                type="button"
                                                disabled={slot.isBooked}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`p-2 text-xs font-bold rounded-lg border-2 transition ${slot.isBooked ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50' : selectedSlot?._id === slot._id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'border-blue-100 text-blue-600 hover:border-blue-300 bg-blue-50'}`}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-bold mb-2 text-gray-700 font-bold">3. Describe your sleep issues</label>
                            <textarea
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                className="w-full border-2 border-gray-100 p-3 rounded-lg h-32 focus:border-blue-500 outline-none transition"
                                placeholder="E.g., Difficulty falling asleep, back pain, etc."
                                required
                            ></textarea>
                        </div>
                        <button type="submit" disabled={!selectedSlot} className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 transform hover:scale-[1.01] transition-all shadow-md disabled:opacity-50 disabled:scale-100">
                            Confirm Appointment
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading your history...</p>
                </div>
            ) : consultations.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500 text-lg mb-4">No consultations found in your history.</p>
                    <button onClick={() => setShowForm(true)} className="text-blue-600 font-bold hover:underline">
                        Book your first one today!
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {consultations.map((c) => (
                        <div key={c._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-1">
                                    <FaCalendarDay className="text-blue-500" />
                                    {new Date(c.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                    <FaClock /> Scheduled at {c.time}
                                </div>
                                <p className="text-gray-700 italic border-l-4 border-blue-100 pl-4 py-1">{c.issueDescription}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {c.status === 'Pending' && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800 font-bold text-xs uppercase tracking-wider">
                                        <FaHourglassHalf /> Pending Approval
                                    </span>
                                )}
                                {c.status === 'Approved' && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 font-bold text-xs uppercase tracking-wider">
                                        <FaCheckCircle /> Confirmed
                                    </span>
                                )}
                                {(c.status === 'Rejected' || c.status === 'Cancelled') && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-800 font-bold text-xs uppercase tracking-wider">
                                        <FaTimesCircle /> {c.status}
                                    </span>
                                )}
                                {c.status === 'Completed' && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs uppercase tracking-wider">
                                        <FaCheckCircle /> Completed
                                    </span>
                                )}
                                {(c.status === 'Pending' || c.status === 'Approved') && (
                                    confirmCancel === c._id ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => cancelConsultation(c._id)} className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded-full">Confirm Cancel?</button>
                                            <button onClick={() => setConfirmCancel(null)} className="text-xs font-bold text-gray-600 bg-gray-200 px-3 py-1 rounded-full">No</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmCancel(c._id)}
                                            className="text-xs font-bold text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded-full bg-red-50 transition"
                                        >
                                            Cancel Appointment
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConsultationPage;

