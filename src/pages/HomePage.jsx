
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="font-sans">
            {/* Hero Section */}
            <div className="bg-blue-900 text-white py-20 px-4 text-center">
                <h1 className="text-4xlmd:text-6xl font-bold mb-4">Discover Your Perfect Sleep</h1>
                <p className="text-xl mb-8">AI-Powered personalized mattress recommendations tailored just for you.</p>
                <div className="space-x-4">
                    <Link to="/assessment" className="bg-yellow-500 text-blue-900 px-6 py-3 rounded font-bold hover:bg-yellow-400 transition">
                        Start Sleep Assessment
                    </Link>
                    <Link to="/shop" className="bg-transparent border border-white text-white px-6 py-3 rounded font-bold hover:bg-white hover:text-blue-900 transition">
                        Browse All Mattresses
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-white shadow-lg rounded-lg">
                    <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
                    <p>Our intelligent system analyzes your sleep patterns and body type to find the best match.</p>
                </div>
                <div className="p-6 bg-white shadow-lg rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Expert Consultation</h3>
                    <p>Book a session with our sleep experts for personalized advice and support.</p>
                </div>
                <div className="p-6 bg-white shadow-lg rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                    <p>Choose from a wide range of high-quality mattresses designed for comfort and durability.</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
