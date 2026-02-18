
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ConsultationPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [issueDescription, setIssueDescription] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.post(
                'http://localhost:5000/api/consultations',
                { date, time, issueDescription },
                config
            );

            alert('Consultation booked successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Error booking consultation');
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h2 className="text-2xl mb-4">Please log in to book a consultation.</h2>
                <button onClick={() => navigate('/login?redirect=consultation')} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">Book Sleep Consultation</h1>
            <div className="bg-white p-8 rounded shadow-md">
                <form onSubmit={submitHandler}>
                    <div className="mb-4">
                        <label className="block mb-2">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border p-2 rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Time</label>
                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border p-2 rounded" required />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2">Describe your sleep issues</label>
                        <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} className="w-full border p-2 rounded h-32" required></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700">
                        Book Appointment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConsultationPage;
