
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await axios.get(`/api/products?keyword=${keyword}`);
            setProducts(data);
        };
        fetchProducts();
    }, [keyword]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Shop Mattresses</h1>

            {/* Search/Filter Bar */}
            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="border p-2 rounded w-full max-w-md"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductListPage;
