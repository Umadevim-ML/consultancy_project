
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaBox } from 'react-icons/fa';

const AdminProductsPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const config = {
        headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
        },
    };

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/products');
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, [user, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${id}`, config);
                setMessage('Product deleted');
                fetchProducts();
            } catch (error) {
                setMessage('Error deleting product');
            }
        }
    };

    const toggleStockHandler = async (product) => {
        try {
            const newStock = product.countInStock > 0 ? 0 : 10;
            await axios.patch(
                `http://localhost:5000/api/products/${product._id}/stock`,
                { countInStock: newStock },
                config
            );
            setMessage(newStock === 0 ? 'Marked out of stock' : 'Stock refilled to 10');
            fetchProducts();
        } catch (error) {
            setMessage('Error updating stock');
        }
    };

    const updateStockHandler = async (id, newStock) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/products/${id}/stock`,
                { countInStock: Number(newStock) },
                config
            );
            fetchProducts();
        } catch (error) {
            setMessage('Error updating stock');
        }
    };

    const updateDiscountHandler = async (id, discount) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/products/${id}/discount`,
                { discount: Number(discount) },
                config
            );
            setMessage('Discount updated');
            fetchProducts();
        } catch (error) {
            setMessage('Error updating discount');
        }
    };

    if (loading) return <div className="container mx-auto p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Products</h1>
                <button
                    onClick={() => navigate('/admin/products/create')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <FaPlus /> Add New Product
                </button>
            </div>

            {message && (
                <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">
                    {message}
                    <button onClick={() => setMessage('')} className="float-right font-bold">&times;</button>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-blue-900 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">Product</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">Firmness</th>
                            <th className="px-4 py-3 text-left">Size</th>
                            <th className="px-4 py-3 text-right">Price</th>
                            <th className="px-4 py-3 text-right">Discount %</th>
                            <th className="px-4 py-3 text-right">Final Price</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const finalPrice = product.discount > 0
                                ? (product.price * (1 - product.discount / 100)).toFixed(2)
                                : product.price.toFixed(2);

                            return (
                                <tr key={product._id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{product.category}</td>
                                    <td className="px-4 py-3">{product.firmness}</td>
                                    <td className="px-4 py-3">{product.size}</td>
                                    <td className="px-4 py-3 text-right">₹{product.price.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            defaultValue={product.discount || 0}
                                            className="w-16 border rounded px-2 py-1 text-right"
                                            onBlur={(e) => updateDiscountHandler(product._id, e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        {product.discount > 0 ? (
                                            <span className="text-green-600">₹{finalPrice}</span>
                                        ) : (
                                            `₹${finalPrice}`
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            min="0"
                                            defaultValue={product.countInStock}
                                            className="w-16 border rounded px-2 py-1 text-right"
                                            onBlur={(e) => updateStockHandler(product._id, e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => toggleStockHandler(product)}
                                                className={`p-1 ${product.countInStock > 0 ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                                                title={product.countInStock > 0 ? 'Mark Out of Stock' : 'Refill Stock'}
                                            >
                                                {product.countInStock > 0 ? <FaBoxOpen /> : <FaBox />}
                                            </button>
                                            <button
                                                onClick={() => deleteHandler(product._id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {products.length === 0 && (
                <p className="text-center text-gray-500 mt-8">No products found.</p>
            )}
        </div>
    );
};

export default AdminProductsPage;
