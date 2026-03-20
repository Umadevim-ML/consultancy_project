
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const isCreate = !id || id === 'create';

    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        image: 'https://placehold.co/600x400?text=New+Product',
        brand: '',
        category: '',
        description: '',
        firmness: 'Medium',
        size: 'Queen',
        features: '',
        countInStock: 0,
        discount: 0,
    });
    const [loading, setLoading] = useState(!isCreate);

    const config = {
        headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
        },
    };

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }

        if (!isCreate) {
            const fetchProduct = async () => {
                try {
                    const { data } = await axios.get(`/api/products/${id}`);
                    setFormData({
                        name: data.name,
                        price: data.price,
                        image: data.image,
                        brand: data.brand,
                        category: data.category,
                        description: data.description,
                        firmness: data.firmness,
                        size: data.size,
                        features: data.features ? data.features.join(', ') : '',
                        countInStock: data.countInStock,
                        discount: data.discount || 0,
                    });
                } catch (err) {
                    toast.error('Product not found');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isCreate, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = {
            ...formData,
            price: Number(formData.price),
            countInStock: Number(formData.countInStock),
            discount: Number(formData.discount),
            features: formData.features
                .split(',')
                .map((f) => f.trim())
                .filter((f) => f !== ''),
        };

        try {
            if (isCreate) {
                await axios.post('/api/products', productData, config);
                toast.success('Product created successfully!');
                setTimeout(() => navigate('/admin/products'), 1500);
            } else {
                await axios.put(`/api/products/${id}`, productData, config);
                toast.success('Product updated successfully!');
                setTimeout(() => navigate('/admin/products'), 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving product');
        }
    };

    if (loading) return <div className="container mx-auto p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">
                {isCreate ? 'Add New Product' : 'Edit Product'}
            </h1>



            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4">
                <div>
                    <label className="block font-medium mb-1">Product Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1">Price ($) *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Discount (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-medium mb-1">Image URL</label>
                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                    {formData.image && (
                        <img src={formData.image} alt="Preview" className="mt-2 h-32 object-cover rounded" />
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1">Brand *</label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Orthopedic">Orthopedic</option>
                            <option value="Cooling">Cooling</option>
                            <option value="Latex">Latex</option>
                            <option value="Memory Foam">Memory Foam</option>
                            <option value="Luxury">Luxury</option>
                            <option value="Budget">Budget</option>
                            <option value="Medical">Medical</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block font-medium mb-1">Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        rows="3"
                        required
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block font-medium mb-1">Firmness *</label>
                        <select
                            name="firmness"
                            value={formData.firmness}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="Soft">Soft</option>
                            <option value="Medium-Soft">Medium-Soft</option>
                            <option value="Medium">Medium</option>
                            <option value="Medium-Firm">Medium-Firm</option>
                            <option value="Firm">Firm</option>
                            <option value="Extra Firm">Extra Firm</option>
                            <option value="Adjustable">Adjustable</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Size *</label>
                        <select
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="Twin">Twin</option>
                            <option value="Twin XL">Twin XL</option>
                            <option value="Full">Full</option>
                            <option value="Queen">Queen</option>
                            <option value="King">King</option>
                            <option value="California King">California King</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Stock Count *</label>
                        <input
                            type="number"
                            name="countInStock"
                            value={formData.countInStock}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-medium mb-1">Features (comma-separated)</label>
                    <input
                        type="text"
                        name="features"
                        value={formData.features}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        placeholder="e.g. Cooling Gel, Motion Isolation, Durable"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        {isCreate ? 'Create Product' : 'Update Product'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductEditPage;
