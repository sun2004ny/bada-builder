import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const ManageProperties = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('live'); // 'live' or 'bada'
    const [liveProperties, setLiveProperties] = useState([]);
    const [badaProperties, setBadaProperties] = useState([]);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = () => {
        const live = JSON.parse(localStorage.getItem('liveGroupingProperties') || '[]');
        const bada = JSON.parse(localStorage.getItem('badaBuilderProperties') || '[]');
        setLiveProperties(live);
        setBadaProperties(bada);
    };

    const handleDelete = (id, type) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            if (type === 'live') {
                const updated = liveProperties.filter(p => p.id !== id);
                localStorage.setItem('liveGroupingProperties', JSON.stringify(updated));
                setLiveProperties(updated);
            } else {
                const updated = badaProperties.filter(p => p.id !== id);
                localStorage.setItem('badaBuilderProperties', JSON.stringify(updated));
                setBadaProperties(updated);
            }
        }
    };

    const currentProperties = activeTab === 'live' ? liveProperties : badaProperties;

    return (
        <div className="admin-content-wrapper">
            <div className="admin-header">
                <h1>Manage Properties</h1>
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
                        onClick={() => setActiveTab('live')}
                    >
                        🔴 Live Grouping ({liveProperties.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'bada' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bada')}
                    >
                        🔵 By Bada Builder ({badaProperties.length})
                    </button>
                </div>
            </div>

            <div className="property-list">
                {currentProperties.length === 0 ? (
                    <div className="no-properties">
                        <p>No properties found in this group.</p>
                    </div>
                ) : (
                    currentProperties.map(property => (
                        <div key={property.id} className="property-card">
                            <img
                                src={(property.images && property.images.length > 0) ? property.images[0] : (property.imageUrl || 'https://via.placeholder.com/300')}
                                alt={property.title}
                                className="property-image"
                            />
                            <div className="property-details">
                                <div className="property-meta">
                                    <span>{property.category}</span>
                                    <span>{property.city}</span>
                                </div>
                                <h3>{property.title}</h3>
                                <p className="property-price">{property.price}</p>
                                <div className="card-actions">
                                    {/* Edit functionality */}
                                    <button
                                        className="edit-btn"
                                        onClick={() => navigate('/admin-panel/post-property', { state: { editProperty: property, type: activeTab } })}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(property.id, activeTab)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .admin-tabs {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                }
                .tab-btn {
                    padding: 10px 20px;
                    border: none;
                    background: #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    color: #64748b;
                    transition: all 0.2s;
                }
                .tab-btn.active {
                    background: #fbbf24;
                    color: #1a202c;
                    transform: translateY(-2px);
                }
                .admin-content-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .admin-header {
                    margin-bottom: 30px;
                }
                .no-properties {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px;
                    background: white;
                    border-radius: 12px;
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default ManageProperties;
