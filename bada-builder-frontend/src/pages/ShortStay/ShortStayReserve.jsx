import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaChevronLeft, FaStar, FaGooglePay, FaCreditCard, FaChevronRight, FaKeyboard } from 'react-icons/fa';
import { SiRazorpay } from "react-icons/si";
import { FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './ShortStayReserve.css';

// --- Reused CalendarModal (from details page) ---
const CalendarModal = ({ isOpen, onClose, checkIn, checkOut, onSelectDates }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedStart, setSelectedStart] = useState(checkIn ? new Date(checkIn) : null);
    const [selectedEnd, setSelectedEnd] = useState(checkOut ? new Date(checkOut) : null);
    const [selecting, setSelecting] = useState('checkIn');

    useEffect(() => {
        if (checkIn) setSelectedStart(new Date(checkIn));
        if (checkOut) setSelectedEnd(new Date(checkOut));
    }, [checkIn, checkOut]);

    const handleDateClick = (date) => {
        if (selecting === 'checkIn') {
            setSelectedStart(date);
            setSelectedEnd(null);
            setSelecting('checkOut');
        } else {
            if (selectedStart && date < selectedStart) {
                setSelectedStart(date);
                setSelectedEnd(null);
            } else {
                setSelectedEnd(date);
                setSelecting('checkIn');
                
                const formatLocalYYYYMMDD = (d) => {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                setTimeout(() => {
                    onSelectDates(
                        formatLocalYYYYMMDD(selectedStart), 
                        formatLocalYYYYMMDD(date)
                    );
                    onClose();
                }, 200);
            }
        }
    };

    const isSelected = (date) => {
        return (selectedStart && date.toDateString() === selectedStart.toDateString()) ||
               (selectedEnd && date.toDateString() === selectedEnd.toDateString());
    };

    const isInRange = (date) => {
        return selectedStart && selectedEnd && date > selectedStart && date < selectedEnd;
    };

    const renderMonth = (month) => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const firstDay = new Date(year, monthIndex, 1).getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="empty-cell" />);
        
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, monthIndex, d);
            const isDisabled = date < new Date().setHours(0,0,0,0);
            
            days.push(
                <div 
                    key={d} 
                    className={`day-cell ${isSelected(date) ? 'selected' : ''} ${isInRange(date) ? 'in-range' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && handleDateClick(date)}
                >
                    {d}
                </div>
            );
        }

        return (
            <div className="calendar-month">
                <div className="month-header">
                    {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="calendar-days-grid">
                    {['S','M','T','W','T','F','S'].map(d => <div key={d} className="day-name">{d}</div>)}
                    {days}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    const formatLocalYYYYMMDD = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="calendar-modal-overlay" onClick={onClose}>
            <div className="calendar-modal" onClick={e => e.stopPropagation()}>
                <div className="calendar-modal-header">
                    <div className="calendar-title-area">
                        <h2>Select dates</h2>
                        <p>Add your travel dates for exact pricing</p>
                    </div>
                    <div className="calendar-inputs-row">
                        <div className={`calendar-input-box ${selecting === 'checkIn' ? 'active' : ''}`} onClick={() => setSelecting('checkIn')}>
                            <span className="field-label-small">CHECK-IN</span>
                            <div className="input-placeholder-text">
                                {selectedStart ? selectedStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : (selecting === 'checkIn' ? 'DD/MM/YYYY' : 'Add date')}
                            </div>
                        </div>
                        <div className="calendar-input-divider" />
                        <div className={`calendar-input-box ${selecting === 'checkOut' ? 'active' : ''}`} onClick={() => setSelecting('checkOut')}>
                            <span className="field-label-small">CHECKOUT</span>
                            <div className="input-placeholder-text">
                                {selectedEnd ? selectedEnd.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : (selecting === 'checkOut' ? 'DD/MM/YYYY' : 'Add date')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="calendar-grid-container">
                    <div className="calendar-nav-row">
                        <button className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                            <FaChevronLeft />
                        </button>
                        <button className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                            <FaChevronRight />
                        </button>
                    </div>
                    <div className="calendar-months-row">
                        {renderMonth(currentMonth)}
                        {renderMonth(nextMonth)}
                    </div>
                </div>

                <div className="calendar-footer">
                    <FaKeyboard className="keyboard-icon" />
                    <div className="footer-actions">
                        <button className="clear-dates-btn" onClick={() => { setSelectedStart(null); setSelectedEnd(null); setSelecting('checkIn'); }}>Clear dates</button>
                        <button className="close-btn-black" onClick={() => {
                            if (selectedStart && selectedEnd) {
                                onSelectDates(
                                    formatLocalYYYYMMDD(selectedStart), 
                                    formatLocalYYYYMMDD(selectedEnd)
                                );
                            }
                            onClose();
                        }}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Guest Edit Modal ---
const GuestModal = ({ isOpen, onClose, adults, setAdults, children, setChildren, infants, setInfants, pets, setPets }) => {
    if (!isOpen) return null;
    
    // Limits
    const MAX_GUESTS = 16; 
    
    const updateGuests = (type, action) => {
        if (type === 'adults') {
            if (action === 'increment' && adults + children < MAX_GUESTS) setAdults(prev => prev + 1);
            if (action === 'decrement' && adults > 1) setAdults(prev => prev - 1);
        }
        if (type === 'children') {
            if (action === 'increment' && adults + children < MAX_GUESTS) setChildren(prev => prev + 1);
            if (action === 'decrement' && children > 0) setChildren(prev => prev - 1);
        }
        if (type === 'infants') {
            if (action === 'increment' && infants < 5) setInfants(prev => prev + 1);
            if (action === 'decrement' && infants > 0) setInfants(prev => prev - 1);
        }
        if (type === 'pets') {
            if (action === 'increment' && pets < 5) setPets(prev => prev + 1);
            if (action === 'decrement' && pets > 0) setPets(prev => prev - 1);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex: 2001}}>
            <div className="guest-modal-content" onClick={e => e.stopPropagation()}>
                <div className="guest-modal-header">
                    <h3>Guests</h3>
                    <button className="close-btn-small" onClick={onClose}><FiX size={20}/></button>
                </div>
                <div className="guest-modal-body">
                    {/* Adults */}
                    <div className="guest-row">
                        <div className="guest-label">
                            <span className="font-bold">Adults</span>
                            <span className="text-gray-500 text-sm">Age 13+</span>
                        </div>
                        <div className="guest-controls">
                            <button 
                                className={`control-btn ${adults <= 1 ? 'disabled' : ''}`}
                                onClick={() => updateGuests('adults', 'decrement')}
                                disabled={adults <= 1}
                            ><FiMinus /></button>
                            <span>{adults}</span>
                            <button 
                                className={`control-btn ${adults + children >= MAX_GUESTS ? 'disabled' : ''}`}
                                onClick={() => updateGuests('adults', 'increment')}
                                disabled={adults + children >= MAX_GUESTS}
                            ><FiPlus /></button>
                        </div>
                    </div>
                    {/* Children */}
                    <div className="guest-row">
                        <div className="guest-label">
                            <span className="font-bold">Children</span>
                            <span className="text-gray-500 text-sm">Ages 2–12</span>
                        </div>
                        <div className="guest-controls">
                            <button 
                                className={`control-btn ${children <= 0 ? 'disabled' : ''}`}
                                onClick={() => updateGuests('children', 'decrement')}
                                disabled={children <= 0}
                            ><FiMinus /></button>
                            <span>{children}</span>
                            <button 
                                className={`control-btn ${adults + children >= MAX_GUESTS ? 'disabled' : ''}`}
                                onClick={() => updateGuests('children', 'increment')}
                                disabled={adults + children >= MAX_GUESTS}
                            ><FiPlus /></button>
                        </div>
                    </div>
                    {/* Infants */}
                    <div className="guest-row">
                        <div className="guest-label">
                            <span className="font-bold">Infants</span>
                            <span className="text-gray-500 text-sm">Under 2</span>
                        </div>
                        <div className="guest-controls">
                            <button 
                                className={`control-btn ${infants <= 0 ? 'disabled' : ''}`}
                                onClick={() => updateGuests('infants', 'decrement')}
                                disabled={infants <= 0}
                            ><FiMinus /></button>
                            <span>{infants}</span>
                            <button 
                                className={`control-btn ${infants >= 5 ? 'disabled' : ''}`}
                                onClick={() => updateGuests('infants', 'increment')}
                                disabled={infants >= 5}
                            ><FiPlus /></button>
                        </div>
                    </div>
                     {/* Pets */}
                     <div className="guest-row">
                        <div className="guest-label">
                            <span className="font-bold">Pets</span>
                            <span className="text-gray-500 text-sm">Bringing a service animal?</span>
                        </div>
                        <div className="guest-controls">
                            <button 
                                className={`control-btn ${pets <= 0 ? 'disabled' : ''}`}
                                onClick={() => updateGuests('pets', 'decrement')}
                                disabled={pets <= 0}
                            ><FiMinus /></button>
                            <span>{pets}</span>
                            <button 
                                className={`control-btn ${pets >= 5 ? 'disabled' : ''}`}
                                onClick={() => updateGuests('pets', 'increment')}
                                disabled={pets >= 5}
                            ><FiPlus /></button>
                        </div>
                    </div>
                </div>
                <div className="guest-modal-footer">
                     <button className="confirm-pay-btn" onClick={onClose}>Save</button>
                </div>
            </div>
        </div>
    );
};
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const ShortStayReserve = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('razorpay'); // Default to card/razorpay

    const [rCheckIn, setRCheckIn] = useState(location.state?.checkIn || null);
    const [rCheckOut, setRCheckOut] = useState(location.state?.checkOut || null);
    
    // Guest State
    const [rAdults, setRAdults] = useState(location.state?.adults || 1);
    const [rChildren, setRChildren] = useState(location.state?.children || 0);
    const [rInfants, setRInfants] = useState(location.state?.infants || 0);
    const [rPets, setRPets] = useState(location.state?.pets || 0);

    const { 
        pricing, hostPricing, policies,
        propertyTitle, propertyImage, propertyRating 
    } = location.state || {};
    
    // Derived total guests
    const rGuests = rAdults + rChildren;

    // Modal Visibility
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);

    // Mobile Step Sate (1 = Review, 2 = Payment)
    const [mobileStep, setMobileStep] = useState(1);

    useEffect(() => {
        if (!location.state) {
            navigate(`/short-stay/${id}`);
        }
        loadRazorpay();
    }, [location, navigate, id]);

    // Dates
    const checkInDate = rCheckIn ? new Date(rCheckIn) : null;
    const checkOutDate = rCheckOut ? new Date(rCheckOut) : null;
    
    // Nights
    const nights = (checkInDate && checkOutDate) 
        ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) 
        : 0;

    // Pricing Calculations
    // User wants Row 1 to be Host Price.
    // If we have hostPricing, use it. Otherwise fall back to pricing (which might be guest_pricing but handling fallback)
    const basePriceObj = hostPricing || pricing;
    const pricePerNight = Number(basePriceObj?.perNight);
    
    // 5% Commission (Calculated based on Host Price)
    // 5% Commission REMOVED per user request
    const baseAmount = (nights > 0 && pricePerNight) ? (pricePerNight * nights) : 0;
    // 18% Tax on Base only
    const gstAmount = Math.round(baseAmount * 0.18);
    
    // Total
    const totalAmount = baseAmount + gstAmount;

    // Modal State
    const [showPriceModal, setShowPriceModal] = useState(false);

    const handlePayment = async () => {
        setLoading(true);

        if (selectedPayment === 'razorpay') {
            const res = await loadRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
                amount: totalAmount * 100,
                currency: 'INR',
                name: 'Bada Builder',
                description: `Payment for ${propertyTitle}`,
                image: '/logo.png',
                handler: function (response) {
                    navigate('/short-stay/success', { state: { paymentId: response.razorpay_payment_id } });
                },
                prefill: {
                    name: currentUser?.name || 'Guest User',
                    email: currentUser?.email || 'guest@example.com',
                    contact: currentUser?.phone || '',
                },
                theme: { color: '#FF385C' },
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            setLoading(false); 
        } else {
            // Mock GPAY
            setTimeout(() => {
                setLoading(false);
                navigate('/short-stay/success', { state: { paymentId: `GPAY_${Date.now()}` } });
            }, 2000);
        }
    };

    return (
        <div className="reserve-page">
            {/* Header */}
            <header className="reserve-header">
                <div className="reserve-container-nav">
                    <button className="back-circle" onClick={() => {
                        if (mobileStep === 2) {
                            setMobileStep(1);
                        } else {
                            navigate(-1);
                        }
                    }}>
                        <FaChevronLeft />
                    </button>
                    <h1 className="header-title">
                        {mobileStep === 1 ? 'Review and continue' : 'Add a payment method'}
                    </h1>
                </div>
            </header>

            <main className="reserve-main-grid">
                {/* Left Column - Payment (Visible on Desktop OR Mobile Step 2) */}
                <div className={`reserve-left ${mobileStep === 1 ? 'mobile-hidden-step' : ''}`}>
                    <div className="desktop-title-area">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button className="back-circle" onClick={() => navigate(-1)} style={{ marginLeft: '-12px' }}>
                                <FaChevronLeft />
                            </button>
                            <h1>Confirm and pay</h1>
                        </div>
                    </div>

                    <div className="reserve-section">
                        <h2>Pay with</h2>
                        <div className="payment-methods">
                            {/* Razorpay (All in one) */}
                            <div 
                                className={`payment-option-card ${selectedPayment === 'razorpay' ? 'selected' : ''}`}
                                onClick={() => setSelectedPayment('razorpay')}
                            >
                                <div className="payment-icon-label">
                                    <SiRazorpay size={24} color="#3395ff" />
                                    <span>Razorpay (Cards, UPI, Netbanking)</span>
                                </div>
                                <div className="custom-radio"></div>
                            </div>
                        </div>
                    </div>

                    <div className="section-divider" />

                    {/* Desktop Button */}
                    <button className="confirm-pay-btn mobile-hidden" onClick={handlePayment} disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm and pay'}
                    </button>
                    
                    {/* Mobile Pay Button (Step 2) */}
                    <div className="mobile-fixed-footer desktop-hidden">
                        <button className="confirm-pay-btn-mobile" onClick={handlePayment} disabled={loading}>
                             {loading ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
                        </button>
                    </div>
                </div>

                {/* Right Column (Price Card / Trip Details) - Visible on Desktop OR Mobile Step 1 */}
                <div className={`reserve-right ${mobileStep === 2 ? 'mobile-hidden-step' : ''}`}>
                    <div className="price-card">
                        <div className="price-card-header">
                            <img src={propertyImage || '/placeholder-property.jpg'} alt="Property" className="price-card-img" />
                            <div className="price-card-info">
                                <div className="price-card-title">
                                    {propertyTitle}
                                </div>
                                <div className="mini-rating">
                                    <FaStar size={12} />
                                    {propertyRating || 'New'}
                                </div>
                            </div>
                        </div>

                        {/* Cancellation Policy */}
                        {(() => {
                            if (!rCheckIn) return null;
                            const startDate = new Date(rCheckIn);
                            const policy = policies?.cancellation || 'flexible';
                            let refundText = '';
                            
                            // Calculate 5 days before check-in for moderate/flexible
                            const refundDate = new Date(startDate);
                            const now = new Date();
                            
                            if (policy.toLowerCase().includes('strict')) {
                                refundText = 'Non-refundable';
                            } else if (policy.toLowerCase().includes('moderate')) {
                                refundDate.setDate(refundDate.getDate() - 5);
                                if (refundDate < now) {
                                    refundText = 'Non-refundable';
                                } else {
                                    const d = refundDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                    refundText = `Partial refund before ${d}`;
                                }
                            } else {
                                // Flexible - 24 hours before
                                refundDate.setDate(refundDate.getDate() - 1);
                                if (refundDate < now) {
                                    refundText = 'Non-refundable';
                                } else {
                                    const d = refundDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
                                    refundText = `Free cancellation before ${d}`;
                                }
                            }
                            
                            return (
                                <div className="reserve-policy-box">
                                    <span className="policy-text">{refundText}</span>
                                </div>
                            );
                        })()}

                        <div className="section-divider" style={{ margin: '24px 0' }} />

                        {/* Trip Details Moved Here */}
                        <div className="card-trip-details">
                            <div className="card-trip-row">
                                <div>
                                    <strong>Dates</strong>
                                    <span>
                                        {checkInDate && checkOutDate 
                                            ? `${checkInDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${checkOutDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` 
                                            : ''}
                                    </span>
                                </div>
                                <button className="edit-link-card" onClick={() => setShowCalendarModal(true)}>Edit</button>
                            </div>
                            <div className="card-trip-row">
                                <div>
                                    <strong>Guests</strong>
                                    <span>{rGuests ? `${rGuests} guest${rGuests !== 1 ? 's' : ''}` : ''}</span>
                                </div>
                                <button className="edit-link-card" onClick={() => setShowGuestModal(true)}>Edit</button>
                            </div>
                        </div>

                        <div className="section-divider" style={{ margin: '24px 0' }} />

                        {/* Collapsed Price Summary */}
                        <div className="price-breakdown">
                            <div className="price-row total-only">
                                <span>Total (INR)</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <button className="price-breakdown-link" onClick={() => setShowPriceModal(true)}>
                                Price breakdown
                            </button>
                        </div>
                    </div>
                    
                    {/* Mobile Next Button (Step 1) */}
                    <div className="mobile-fixed-footer desktop-hidden">
                        <button className="confirm-pay-btn-mobile black-btn" onClick={() => setMobileStep(2)}>
                             Next
                        </button>
                    </div>
                </div>
            </main>

            {/* Price Breakdown Modal */}
            {showPriceModal && (
                <div className="price-modal-overlay" onClick={() => setShowPriceModal(false)}>
                    <div className="price-modal" onClick={e => e.stopPropagation()}>
                        <div className="price-modal-header">
                            <div className="empty-spacer"></div>
                            <h3>Price breakdown</h3>
                            <button className="close-btn-small" onClick={() => setShowPriceModal(false)}>
                                <span style={{fontSize: '20px'}}>×</span>
                            </button>
                        </div>
                        <div className="price-modal-body">
                            <div className="price-detail-row">
                                <span>
                                    {nights} night{nights !== 1 ? 's' : ''} 
                                    {checkInDate ? ` · ${checkInDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''} 
                                    {checkOutDate ? ` - ${checkOutDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                                </span>
                                <span>₹{baseAmount.toLocaleString()}</span>
                            </div>

                            <div className="price-detail-row">
                                <span className="underline">Taxes</span>
                                <span>₹{gstAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="price-modal-footer">
                            <div className="price-detail-row total">
                                <span>Total (INR)</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Calendar Modal */}
            <CalendarModal 
                isOpen={showCalendarModal}
                onClose={() => setShowCalendarModal(false)}
                checkIn={rCheckIn}
                checkOut={rCheckOut}
                onSelectDates={(inDate, outDate) => {
                    setRCheckIn(inDate);
                    setRCheckOut(outDate);
                }}
            />

            {/* Guest Modal */}
            <GuestModal
                isOpen={showGuestModal}
                onClose={() => setShowGuestModal(false)}
                guests={rGuests}
                setGuests={() => {}} // calculated
                adults={rAdults} setAdults={setRAdults}
                children={rChildren} setChildren={setRChildren}
                infants={rInfants} setInfants={setRInfants}
                pets={rPets} setPets={setRPets}
            />
        </div>
    );
};

export default ShortStayReserve;

