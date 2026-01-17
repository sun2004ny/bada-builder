import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

import { authAPI } from '../../services/api';

const ADMIN_CREDENTIALS = {
    'sunny260604@gmail.com': '123123',
    'nakulagrawal987@gmail.com': '123123'
};

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const normalizedEmail = email.trim().toLowerCase();
        setLoading(true);
        setError('');

        try {
            // 1. Attempt backend login first to get a valid JWT token
            console.log('Attempting backend login for admin token...');
            try {
                const response = await authAPI.login(normalizedEmail, password);
                if (response && response.token) {
                    console.log('Backend login successful, token stored.');
                }
            } catch (backendError) {
                console.warn('Backend login failed:', backendError.message);
                // We continue even if backend login fails, because the admin might 
                // only need to manage local storage-based properties.
            }

            // 2. Perform the existing local credential check
            if (ADMIN_CREDENTIALS[normalizedEmail] && ADMIN_CREDENTIALS[normalizedEmail] === password) {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                sessionStorage.setItem('adminEmail', normalizedEmail);

                // Clear any legacy local storage auth (from previous implementation)
                localStorage.removeItem('isAdminLoggedIn');
                localStorage.removeItem('adminEmail');

                navigate('/admin-panel');
            } else {
                setError('Invalid email or password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-box">
                <h2>Admin Panel Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        className="login-input"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="login-input"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-btn">Login</button>
                </form>
                {error && <p className="error-msg">{error}</p>}
            </div>
        </div>
    );
};

export default AdminLogin;
