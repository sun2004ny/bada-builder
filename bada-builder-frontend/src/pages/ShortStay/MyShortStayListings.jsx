import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import { shortStayAPI } from '../../services/shortStayApi';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import ShortStayForm from '../../components/ShortStay/ShortStayForm'; // Import Modal
import './MyShortStayListings.css';

const MyShortStayListings = () => {
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingListing, setEditingListing] = useState(null); // Track listing being edited

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyListings();
    }, [user, navigate]);

    const fetchMyListings = async () => {
        try {
            const data = await shortStayAPI.getMyListings();
            setListings(data.properties);
        } catch (error) {
            console.error('Error fetching my listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
            try {
                await shortStayAPI.delete(id);
                setListings(prev => prev.filter(item => item.id !== id));
            } catch (error) {
                console.error('Error deleting listing:', error);
                alert('Failed to delete listing');
            }
        }
    };

    const handleEdit = (listing) => {
        setEditingListing(listing);
    };

    const handleCloseEdit = () => {
        setEditingListing(null);
        fetchMyListings(); // Refresh data after edit
    };

    if (loading) return <div className="my-listings-page loading">Loading...</div>;

    return (
        <div className="short-stay-page my-listings-page">
            <div className="short-stay-content-wrapper">
                <div className="my-listings-header">
                    <h1>My Listings</h1>
                    <button className="add-new-btn" onClick={() => navigate('/short-stay/list-property')}>
                        <FaPlus /> Add New Property
                    </button>
                </div>

                {listings.length === 0 ? (
                    <div className="no-listings-state">
                        <p>You haven't listed any properties yet.</p>
                        <button onClick={() => navigate('/short-stay/list-property')}>List Your First Property</button>
                    </div>
                ) : (
                    <div className="my-listings-grid">
                        {listings.map(listing => (
                            <div key={listing.id} className="my-listing-card">
                                <div className="listing-image">
                                    <img src={listing.cover_image || (listing.images && listing.images[0]) || '/placeholder-property.jpg'} alt={listing.title} />
                                    <div className="status-badge">{listing.status}</div>
                                </div>
                                <div className="listing-details">
                                    <h3>{listing.title}</h3>
                                    <p className="listing-location">{listing.location?.city}</p>
                                    <p className="listing-price">₹{listing.pricing?.perNight} / night</p>
                                    
                                    <div className="listing-actions">
                                        <button onClick={() => navigate(`/short-stay/${listing.id}`)} title="View">
                                            <FaEye /> View
                                        </button>
                                        <button onClick={() => handleEdit(listing)} title="Edit">
                                            <FaEdit /> Edit
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(listing.id)} title="Delete">
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingListing && (
                    <ShortStayForm 
                        category={editingListing.category} 
                        initialData={editingListing} 
                        onClose={handleCloseEdit} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyShortStayListings;
