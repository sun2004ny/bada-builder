import { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './Admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/admin-panel/login');
        }
    }, [isLoggedIn, navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        sessionStorage.removeItem('adminEmail');
        // Clean up legacy local storage if present
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminEmail');
        navigate('/admin-panel/login');
    };

    if (!isLoggedIn) return null;

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h2>Admin Panel</h2>
                <nav className="admin-nav">
                    <Link
                        to="/admin-panel/post-property"
                        className={`admin-nav-item ${location.pathname.includes('post-property') ? 'active' : ''}`}
                    >
                        Post Property
                    </Link>
                    <Link
                        to="/admin-panel/manage-properties"
                        className={`admin-nav-item ${location.pathname.includes('manage-properties') ? 'active' : ''}`}
                    >
                        Manage Properties
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </nav>
            </div>
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
