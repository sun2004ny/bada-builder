import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaChevronLeft, FaStar, FaGooglePay } from 'react-icons/fa';
import { SiRazorpay } from "react-icons/si";
import { useAuth } from '../../context/AuthContext';
import './ShortStayReserve.css';

// Load Razorpay Script
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
    const [selectedPayment, setSelectedPayment] = useState('gpay'); // 'razorpay' or 'gpay'

    const { 
        checkIn, checkOut, guests, pricing, 
        propertyTitle, propertyImage, propertyRating 
    } = location.state || {};

    useEffect(() => {
        if (!location.state) {
            navigate(`/short-stay/${id}`);
        }
        loadRazorpay();
    }, [location, navigate, id]);

    // Strict Dynamic Calculations - No Fallbacks
    const checkInDate = checkIn ? new Date(checkIn) : null;
    const checkOutDate = checkOut ? new Date(checkOut) : null;
    
    // Calculate nights ONLY if valid dates exist
    const nights = (checkInDate && checkOutDate) 
        ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) 
        : 0;

    // Strict Pricing - No fallback if data is missing, we handle it in display
    const pricePerNight = Number(pricing?.perNight);
    const cleaningFee = Number(pricing?.cleaning);
    
    // Only calculate totals if we have valid nights & price
    // If pricePerNight is NaN (missing), baseAmount will be NaN (falsy check handles display)
    const baseAmount = (nights > 0 && pricePerNight) ? (pricePerNight * nights) : 0;
    const gstAmount = Math.round(baseAmount * 0.18);
    const totalAmount = baseAmount + gstAmount + (cleaningFee || 0);

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
            setLoading(false); // Razorpay modal opens, we can stop loading
        } else {
            // Google Pay / Mock Payment
            // In a real implementation this would likely invoke a payment intent
            setTimeout(() => {
                setLoading(false);
                navigate('/short-stay/success', { state: { paymentId: `GPAY_${Date.now()}` } });
            }, 2000);
        }
    };

    return (
        <div className="reserve-page">
            <header className="reserve-header">
                <div className="reserve-container-nav">
                    <button className="back-circle" onClick={() => navigate(-1)}>
                        <FaChevronLeft />
                    </button>
                    <div className="nav-logo">
                        <img src="/logo.png" alt="BadaBuilder" style={{ height: '32px' }} />
                    </div>
                </div>
            </header>

            <main className="reserve-main-grid">
                {/* Left Column: Trip Details & Payment */}
                <div className="reserve-left">
                    <div className="section-title">
                        <button className="back-circle-mobile" onClick={() => navigate(-1)}><FaChevronLeft /></button>
                        <h1>Confirm and pay</h1>
                    </div>

                    <div className="reserve-section">
                        <h2>Your trip</h2>
                        
                        <div className="trip-info-row">
                            <div>
                                <strong>Dates</strong>
                                <span>
                                    {checkInDate && checkOutDate 
                                        ? `${checkInDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${checkOutDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` 
                                        : ''}
                                </span>
                            </div>
                            <span className="edit-link">Edit</span>
                        </div>

                        <div className="trip-info-row">
                            <div>
                                <strong>Guests</strong>
                                <span>{guests ? `${guests} guest${guests !== 1 ? 's' : ''}` : ''}</span>
                            </div>
                            <span className="edit-link">Edit</span>
                        </div>
                    </div>

                    <div className="section-divider"></div>

                    <div className="reserve-section">
                        <h2>Pay with</h2>
                        <div className="payment-methods">
                            <label className={`payment-option ${selectedPayment === 'gpay' ? 'selected' : ''}`}>
                                <div className="payment-label">
                                    <FaGooglePay size={24} />
                                    <span>UPI / Netbanking</span>
                                </div>
                                <div className="radio-circle">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        checked={selectedPayment === 'gpay'} 
                                        onChange={() => setSelectedPayment('gpay')} 
                                    />
                                </div>
                            </label>
                            
                            <label className={`payment-option ${selectedPayment === 'razorpay' ? 'selected' : ''}`}>
                                <div className="payment-label">
                                    <SiRazorpay size={20} color="#3399cc" />
                                    <span>Credit or Debit Card</span>
                                </div>
                                <div className="radio-circle">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        checked={selectedPayment === 'razorpay'} 
                                        onChange={() => setSelectedPayment('razorpay')} 
                                    />
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="section-divider"></div>

                    <button className="confirm-pay-btn" onClick={handlePayment} disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm and pay'}
                    </button>
                </div>

                {/* Right Column: Price Card */}
                <div className="reserve-right">
                    <div className="price-card">
                        <div className="price-card-header">
                            <img src={propertyImage || ''} alt="Property" className="price-card-img" />
                            <div className="price-card-info">
                                <span className="superhost-tag">Superhost</span>
                                <h4>{propertyTitle}</h4>
                                <div className="mini-rating">
                                    <FaStar size={12} />
                                    {propertyRating || 'New'}
                                </div>
                            </div>
                        </div>

                        <div className="section-divider"></div>

                        <div className="price-card-breakdown">
                            <h3>Price details</h3>
                            
                            {(nights > 0 && pricePerNight) ? (
                                <div className="price-row">
                                    <span>₹{pricePerNight.toLocaleString()} x {nights} nights</span>
                                    <span>₹{baseAmount.toLocaleString()}</span>
                                </div>
                            ) : null}
                            
                            {cleaningFee > 0 && (
                                <div className="price-row">
                                    <span>Cleaning fee</span>
                                    <span>₹{cleaningFee.toLocaleString()}</span>
                                </div>
                            )}

                            {baseAmount > 0 && (
                                <div className="price-row">
                                    <span>Taxes (18% GST)</span>
                                    <span>₹{gstAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="section-divider"></div>

                            <div className="price-total-row">
                                <span>Total (INR)</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShortStayReserve;
