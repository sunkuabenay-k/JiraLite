import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import './LoginPage.css'; // We can reuse the Login CSS for consistency

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '' // Optional, only if your DTO supports it
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Backend call
            await axiosClient.post('/auth/register', formData);
            alert("Registration successful! Please login.");
            navigate('/login');
        } catch (err) {
            // Safe error handling
            const msg = err.response?.data?.message || "Registration failed. Username or Email might be taken.";
            setError(msg);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Create Account</h2>
                {error && <div className="alert-error">{error}</div>}
                
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        required 
                        minLength={3}
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
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
                        minLength={6}
                    />
                </div>

                <button type="submit" className="btn-primary">Sign Up</button>
                
                <p style={{marginTop: '15px', textAlign: 'center'}}>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;