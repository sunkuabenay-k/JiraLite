import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.post('/auth/login', formData);
            const { token, user } = response.data;

            // 1. Save Token
            localStorage.setItem('token', token);
            
            // 2. Save User Info (Critical for Permission Logic)
            localStorage.setItem('currentUser', JSON.stringify(user));

            // 3. Update Axios headers (optional if you reload, but good practice)
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            navigate('/issues');
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login to JiraLite</h2>
                {error && <div className="alert-error">{error}</div>}
                
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        name="usernameOrEmail" 
                        value={formData.usernameOrEmail} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <button type="submit" className="btn-primary">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;