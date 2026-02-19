
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const logoutHandler = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="bg-blue-900 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">ComfyCloud</Link>
                <nav className="flex items-center space-x-6">
                    {user && user.isAdmin ? (
                        /* Admin Navigation */
                        <>
                            <Link to="/admin/products" className="hover:text-yellow-400 flex items-center gap-1">
                                <FaCog className="text-xs" /> Products
                            </Link>
                            <Link to="/admin/orders" className="hover:text-yellow-400">Orders</Link>
                            <Link to="/admin/consultations" className="hover:text-yellow-400">Consultations</Link>
                            <Link to="/dashboard" className="hover:text-yellow-400 flex items-center gap-1">
                                <FaUser className="text-xs" /> Dashboard
                            </Link>
                            <button onClick={logoutHandler} className="hover:text-red-400 flex items-center gap-1 ml-4 border-l pl-4 border-blue-700">
                                <FaSignOutAlt /> Logout
                            </button>
                        </>
                    ) : (
                        /* Customer Navigation */
                        <>
                            <Link to="/shop" className="hover:text-yellow-400">Shop</Link>
                            <Link to="/assessment" className="hover:text-yellow-400">Assessment</Link>
                            <Link to="/consultation" className="hover:text-yellow-400">Consultation</Link>

                            <Link to="/cart" className="relative hover:text-yellow-400">
                                <FaShoppingCart size={20} />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-blue-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="relative group">
                                    <button className="flex items-center hover:text-yellow-400">
                                        <FaUser className="mr-2" /> {user.name}
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg py-2 hidden group-hover:block z-50">
                                        <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Dashboard</Link>
                                        <hr className="my-1" />
                                        <button onClick={logoutHandler} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="hover:text-yellow-400">Login</Link>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
