import React, { useState, useEffect } from 'react';
import { shortStayAPI } from '../../services/shortStayApi';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import './HostingCalendar.css';

const HostingCalendar = ({ properties }) => {
    console.log("HostingCalendar Properties:", properties);
    const [selectedProperty, setSelectedProperty] = useState(properties[0]?.id || '');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editPrice, setEditPrice] = useState('');
    const [editStatus, setEditStatus] = useState('available');
    
    // Custom Dropdown State
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.property-selector')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    const fetchCalendarData = React.useCallback(async () => {
        if (!selectedProperty) return;
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            
            // Get first and last day of month
            const start = `${year}-${String(month).padStart(2, '0')}-01`;
            const end = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`; // Last day

            const response = await shortStayAPI.getCalendar(selectedProperty, start, end);
            setCalendarData(response.calendarData || []);
        } catch (err) {
            console.error("Failed to fetch calendar", err);
        } finally {
            setLoading(false);
        }
    }, [selectedProperty, currentDate]);

    // Sync selectedProperty when properties are loaded
    useEffect(() => {
        if (properties.length > 0 && !selectedProperty) {
            setSelectedProperty(properties[0].id);
        }
    }, [properties, selectedProperty]);

    useEffect(() => {
        if (selectedProperty) {
            fetchCalendarData();
        }
    }, [selectedProperty, currentDate, fetchCalendarData]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getPropertyDisplayPrice = (property, dateStr) => {
        if (!property) return { min: 0, max: 0, isRange: false };
        
        if (property.category !== 'hotel') {
            const price = property.pricing?.perNight || 0;
            return { min: price, max: price, isRange: false };
        }

        const roomTypes = property.specific_details?.roomTypes || [];
        if (roomTypes.length === 0) return { min: 0, max: 0, isRange: false };

        const day = new Date(dateStr).getDay();
        const isWeekend = day === 0 || day === 6;

        let prices = roomTypes.map(room => {
            const base = Number(room.price) || 0;
            const weekend = Number(room.weeklyPrice) || 0;
            return (isWeekend && weekend > 0) ? weekend : base;
        }).filter(p => p > 0);

        if (prices.length === 0) return { min: 0, max: 0, isRange: false };

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        return { min, max, isRange: min !== max };
    };

    const handleDateClick = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Find existing data
        const existing = calendarData.find(d => {
            const dDate = typeof d.date === 'string' ? d.date.split('T')[0] : '';
            return dDate === dateStr;
        });
        
        // Get base price from property
        const property = properties.find(p => String(p.id) === String(selectedProperty));
        const { min: basePrice } = getPropertyDisplayPrice(property, dateStr);

        setSelectedDate(dateStr);
        setEditPrice(existing?.price ? existing.price : basePrice);
        setEditStatus(existing?.status || 'available');
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            await shortStayAPI.updateCalendar({
                propertyId: selectedProperty,
                date: selectedDate,
                price: editPrice,
                status: editStatus
            });
            setModalOpen(false);
            fetchCalendarData(); // Refresh
        } catch {
            alert('Failed to update calendar');
        }
    };

    const renderCalendarGrid = () => {
        const totalDays = getDaysInMonth(currentDate);
        const startDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for offset
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
        }

        const property = properties.find(p => String(p.id) === String(selectedProperty));

        // Date cells
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const data = calendarData.find(d => {
                const dDate = typeof d.date === 'string' ? d.date.split('T')[0] : '';
                return dDate === dateStr;
            });
            
            const isBlocked = data?.status === 'blocked';
            
            // Calculate display price / range
            const { min, max, isRange } = getPropertyDisplayPrice(property, dateStr);
            const price = data?.price || min;

            // Check if past
            const today = new Date();
            today.setHours(0,0,0,0);
            const thisDate = new Date(dateStr);
            const isPast = thisDate < today;

            const formatPrice = (val) => Math.round(val).toLocaleString();
            const displayPrice = (data?.price || !isRange) 
                ? `₹${formatPrice(price)}`
                : `₹${formatPrice(min)}-${formatPrice(max)}`;

            days.push(
                <div 
                    key={day} 
                    className={`calendar-cell ${isBlocked ? 'blocked' : ''} ${isPast ? 'past' : ''}`}
                    onClick={() => !isPast && handleDateClick(day)}
                >
                    <span className="cell-date">{day}</span>
                    <span className="cell-price">{displayPrice}</span>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="hosting-calendar-container">
            <div className="calendar-header">
                <div className="property-selector" style={{position: 'relative'}}>
                    <div 
                        className="custom-select-trigger" 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        {properties.find(p => String(p.id) === String(selectedProperty))?.title || 'Select Property'}
                        <FaChevronLeft style={{transform: 'rotate(-90deg)', fontSize: '12px'}} />
                    </div>
                    
                    {dropdownOpen && (
                        <div className="custom-select-options">
                            {properties.length > 0 ? (
                                properties.map(p => (
                                    <div 
                                        key={p.id} 
                                        className={`custom-option ${String(p.id) === String(selectedProperty) ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedProperty(p.id);
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        {p.title}
                                    </div>
                                ))
                            ) : (
                                <div className="custom-option" style={{cursor: 'default', color: '#999'}}>
                                    No properties found
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="calendar-controls">
                    <button className="calendar-nav-btn" onClick={handlePrevMonth}><FaChevronLeft /></button>
                    <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <button className="calendar-nav-btn" onClick={handleNextMonth}><FaChevronRight /></button>
                </div>
            </div>

            {loading ? <div style={{padding:'40px', textAlign:'center'}}>Loading...</div> : (
                <div className="calendar-grid-header">
                    <div className="calendar-grid">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="calendar-day-header">{d}</div>
                        ))}
                        {renderCalendarGrid()}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {modalOpen && (
                <div className="hosting-calendar-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="hosting-calendar-modal" onClick={e => e.stopPropagation()}>
                        <div className="hosting-modal-header">
                            <h3>Edit Rate & availability</h3>
                            <button onClick={() => setModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes /></button>
                        </div>
                        
                        <div className="form-group">
                            <label>Status</label>
                            <div className="status-toggle">
                                <div 
                                    className={`status-option available ${editStatus === 'available' ? 'active' : ''}`}
                                    onClick={() => setEditStatus('available')}
                                >
                                    Available
                                </div>
                                <div 
                                    className={`status-option blocked ${editStatus === 'blocked' ? 'active' : ''}`}
                                    onClick={() => setEditStatus('blocked')}
                                >
                                    Blocked
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Price per night (₹)</label>
                            <input 
                                type="number" 
                                className="form-input" 
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                            />
                        </div>

                        <button className="save-btn" onClick={handleSave}>Save Changes</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HostingCalendar;
