
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const RecommendationsPage = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/recommendations', config);
                // The API returns a list of recommendation objects.
                // Each object has a `recommendedProducts` array with `{ product: {...}, score, reason }`.
                // We want the latest recommendation set.
                if (data && data.length > 0) {
                    // Filter out any items where product is null (failed population)
                    const validProducts = data[0].recommendedProducts.filter(
                        (item) => item.product !== null && item.product !== undefined
                    );
                    setRecommendations(validProducts);
                } else {
                    setRecommendations([]);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load recommendations.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRecommendations();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-3xl font-bold mb-6">Your Personalized Recommendations</h1>
                <p>Loading recommendations...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Your Personalized Recommendations</h1>
            {error && <p className="text-center text-red-500 mb-4">{error}</p>}
            {recommendations.length === 0 ? (
                <p className="text-center">No recommendations found. Please take the sleep assessment.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.map((item) => (
                        <div key={item.product._id} className="relative">
                            <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 rounded-bl-lg z-10 text-sm">
                                Match Score: {item.score}
                            </div>
                            <ProductCard product={item.product} />
                            <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                                <strong>Why:</strong> {item.reason}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecommendationsPage;
