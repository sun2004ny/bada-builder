import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBuilding, FaHome, FaBed, FaHotel, FaTree, FaCampground, FaLeaf, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ShortStayForm from '../../components/ShortStay/ShortStayForm';
import './ShortStayLanding.css'; // Reuse existing styles or create new ones

const ListShortStay = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { state: { from: '/short-stay/list-property' } });
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="short-stay-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const categories = [
        { id: 'apartment', name: 'Flats / Apartments', icon: <FaBuilding />, desc: 'Rent out your flat' },
        { id: 'house', name: 'Villa / Bunglow', icon: <FaHome />, desc: 'List your house' },
        { id: 'dormitory', name: 'Dormitory', icon: <FaBed />, desc: 'Shared sleeping space' },
        { id: 'hotel', name: 'Hotels', icon: <FaHotel />, desc: 'List hotel rooms' },
        { id: 'cottage', name: 'Cottages', icon: <FaHome />, desc: 'Cozy retreats' },
        { id: 'tree_house', name: 'Tree House', icon: <FaTree />, desc: 'Unique experience' },
        { id: 'tent', name: 'Tents', icon: <FaCampground />, desc: 'Camping spots' },
        { id: 'farmhouse', name: 'Farmhouse', icon: <FaLeaf />, desc: 'Event or stay space' },
        { id: 'hostel', name: 'Hostel', icon: <FaUserGraduate />, desc: 'Student accommodation' }
    ];

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        setShowForm(true);
    };

    if (showForm && selectedCategory) {
        return (
            <ShortStayForm 
                category={selectedCategory} 
                onClose={() => setShowForm(false)} 
            />
        );
    }

    return (
        <div className="short-stay-page list-property-page">
            <div className="short-stay-content-wrapper">
                <div className="short-stay-section-header">
                    <h2>List Your Property</h2>
                    <p>Select the type of property you want to list</p>
                </div>

                <div className="short-stay-categories-grid">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            className="short-stay-category-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            onClick={() => handleCategorySelect(category.id)}
                            whileHover={{ y: -8, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        >
                            <div className="short-stay-category-icon" style={{ color: '#FF385C' }}>
                                {category.icon}
                            </div>
                            <h3>{category.name}</h3>
                            <p>{category.desc}</p>
                        </motion.div>
                    ))}
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button 
                        className="short-stay-btn short-stay-btn-outline" 
                        onClick={() => navigate('/short-stay')}
                        style={{ color: '#0F172A', borderColor: '#ddd' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListShortStay;
