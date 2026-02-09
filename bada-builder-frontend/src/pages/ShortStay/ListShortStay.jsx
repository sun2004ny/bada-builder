import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ShortStayForm from '../../components/ShortStay/ShortStayForm';
import './ListShortStay.css';
import ShortStayLoader from '../../components/ShortStay/ShortStayLoader';

const ListShortStay = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { state: { from: '/short-stay/list-property' } });
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return <ShortStayLoader />;
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
