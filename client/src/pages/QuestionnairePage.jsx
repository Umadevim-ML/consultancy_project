
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const QuestionnairePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        age: '',
        weight: '',
        height: '',
        sleepPosition: 'Back',
        backPain: false,
        shoulderPain: false,
        firmnessPreference: 'Medium',
        budgetRange: 'Medium',
        mattressSize: 'Queen',
        hasPartner: false,
        temperaturePreference: 'Neutral',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                'http://localhost:5000/api/recommendations',
                {
                    ...formData,
                    age: Number(formData.age),
                    weight: Number(formData.weight),
                    height: Number(formData.height),
                },
                config
            );

            // Navigate to results page with data or store it
            // For now, let's navigate to a new Rec page or handle it
            // Assuming we display results on a separate page or modal
            // But user requirement says "View recommended products"
            // We can navigate to /recommendations?id=... or just show them here
            // Let's create a Results Page or navigate to Profile/Recommendations
            // Or just store in local state and show?
            // The requirement says "Recommended products page".

            // Let's navigate to a dedicated page
            navigate('/recommendations'); // We need to create this route
        } catch (error) {
            console.error(error);
            toast.error('Error submitting questionnaire');
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h2 className="text-2xl mb-4">Please log in to take the sleep assessment.</h2>
                <button
                    onClick={() => navigate('/login?redirect=assessment')}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Sleep Assessment Questionnaire</h1>
            <div className="bg-white p-6 rounded shadow-md">
                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Step 1: Basic Information</h2>
                            <div className="mb-4">
                                <label className="block mb-2">Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Weight (kg)</label>
                                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Height (cm)</label>
                                <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full border p-2 rounded" required />
                            </div>
                            <button type="button" onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Step 2: Sleep Habits</h2>
                            <div className="mb-4">
                                <label className="block mb-2">Sleep Position</label>
                                <select name="sleepPosition" value={formData.sleepPosition} onChange={handleChange} className="w-full border p-2 rounded">
                                    <option value="Back">Back</option>
                                    <option value="Side">Side</option>
                                    <option value="Stomach">Stomach</option>
                                    <option value="Combination">Combination</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input type="checkbox" name="backPain" checked={formData.backPain} onChange={handleChange} className="mr-2" />
                                    Do you experience back pain?
                                </label>
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input type="checkbox" name="shoulderPain" checked={formData.shoulderPain} onChange={handleChange} className="mr-2" />
                                    Do you experience shoulder pain?
                                </label>
                            </div>
                            <div className="flex justify-between">
                                <button type="button" onClick={prevStep} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Back</button>
                                <button type="button" onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Step 3: Preferences</h2>
                            <div className="mb-4">
                                <label className="block mb-2">Firmness Preference</label>
                                <select name="firmnessPreference" value={formData.firmnessPreference} onChange={handleChange} className="w-full border p-2 rounded">
                                    <option value="Soft">Soft</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Firm">Firm</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Budget Range</label>
                                <select name="budgetRange" value={formData.budgetRange} onChange={handleChange} className="w-full border p-2 rounded">
                                    <option value="Economy">Economy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Temperature Preference</label>
                                <select name="temperaturePreference" value={formData.temperaturePreference} onChange={handleChange} className="w-full border p-2 rounded">
                                    <option value="Cool">Cool</option>
                                    <option value="Neutral">Neutral</option>
                                    <option value="Warm">Warm</option>
                                </select>
                            </div>
                            <div className="flex justify-between">
                                <button type="button" onClick={prevStep} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Back</button>
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Get Recommendation</button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default QuestionnairePage;
