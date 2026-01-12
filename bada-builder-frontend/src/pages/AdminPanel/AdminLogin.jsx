import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const ADMIN_CREDENTIALS = {
    'sunny260604@gmail.com': '123123',
    'nakulagrawal987@gmail.com': '123123'
};

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const normalizedEmail = email.trim().toLowerCase();

        if (ADMIN_CREDENTIALS[normalizedEmail] && ADMIN_CREDENTIALS[normalizedEmail] === password) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            sessionStorage.setItem('adminEmail', normalizedEmail);
            // Clear any lingering localStorage auth
            localStorage.removeItem('isAdminLoggedIn');
            localStorage.removeItem('adminEmail');
            navigate('/admin-panel');
        } else {
            setError('Invalid email or password.');
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
