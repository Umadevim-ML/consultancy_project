
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaCog, FaSignOutAlt, FaHeart } from 'react-icons/fa';
import { WishlistContext } from '../context/WishlistContext';
import NotificationBell from './NotificationBell';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const { wishlist } = useContext(WishlistContext);
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

                            <NotificationBell />

                            <button onClick={logoutHandler} className="hover:text-red-400 flex items-center gap-1 ml-4 border-l pl-4 border-blue-700">
                                <FaSignOutAlt /> Logout
                            </button>
                        </>
                    ) : (
                        /* Customer Navigation */
                        <>
                            <Link to="/shop" className="hover:text-yellow-400">Shop</Link>
                            <Link to="/assessment" className="hover:text-yellow-400">Assessment</Link>
                            <Link to="/consultation" className="hover:text-yellow-400">Consultations</Link>
                            <Link to="/myorders" className="hover:text-yellow-400">My Orders</Link>

                            <Link to="/wishlist" className="relative hover:text-red-400 transition-colors">
                                <FaHeart size={20} />
                                {wishlist.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {wishlist.length}
                                    </span>
                                )}
                            </Link>

                            <Link to="/cart" className="relative hover:text-yellow-400 transition-colors">
                                <FaShoppingCart size={20} />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-blue-900 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="flex items-center space-x-6">
                                    <NotificationBell />
                                    <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center hover:text-yellow-400 focus:outline-none"
                                    >
                                        <FaUser className="mr-2" /> {user.name}
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setDropdownOpen(false)}
                                                className="block px-4 py-2 hover:bg-gray-100"
                                            >
                                                Dashboard
                                            </Link>
                                            <hr className="my-1" />
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    logoutHandler();
                                                }}
                                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
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
