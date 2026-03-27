
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const { data } = await axios.post(
                '/api/auth/login',
                { email, password },
                config
            );

            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success(`Welcome back, ${data.name}!`);
        } catch (err) {
            const message = err.response && err.response.data.message
                ? err.response.data.message
                : err.message;
            setError(message);
            toast.error(message);
        }
    };

    const register = async (name, email, password) => {
        try {
            setError(null);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const { data } = await axios.post(
                '/api/auth/register',
                { name, email, password },
                config
            );

            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success(`Account created! Welcome, ${data.name}.`);
        } catch (err) {
            const message = err.response && err.response.data.message
                ? err.response.data.message
                : err.message;
            setError(message);
            toast.error(message);
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const updateUser = (updatedUserInfo) => {
        setUser(updatedUserInfo);
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};
