import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ShortStayForm from '../../components/ShortStay/ShortStayForm';
import './ListShortStay.css';

const ListShortStay = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { state: { from: '/short-stay/list-property' } });
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="list-short-stay-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="list-short-stay-page">
            <div className="list-short-stay-container">
                <ShortStayForm onClose={() => navigate('/short-stay')} />
            </div>
        </div>
    );
};

export default ListShortStay;
