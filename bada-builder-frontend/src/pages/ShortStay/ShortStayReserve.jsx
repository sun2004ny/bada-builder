import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaChevronLeft, FaStar, FaCreditCard, FaLock, FaGooglePay } from 'react-icons/fa';
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

    // Calculations
    const nights = 5; // Placeholder logic, should be real date diff
    const pricePerNight = Number(pricing?.perNight) || 0;
    const cleaningFee = Number(pricing?.cleaning) || 0;
    const totalAmount = (pricePerNight * nights) + cleaningFee;
    const taxes = Math.round(totalAmount * 0.18); // Example GST logic
    const grandTotal = totalAmount + taxes;

    const handlePayment = async () => {
        setLoading(true);

        if (selectedPayment === 'razorpay') {
            const res = await loadRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            // Create Order on Backend (Mock for now, normally fetch from API)
            // const order = await createOrderAPI({ amount: grandTotal });
            
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
                amount: grandTotal * 100, // Paíse
                currency: "INR",
                name: "Bada Builder",
                description: `Payment for ${propertyTitle}`,
                image: "/logo.png",
                handler: function (response) {
                    // Handle success
                    alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                    navigate('/short-stay/success');
                },
                prefill: {
                    name: currentUser?.displayName || "Guest",
                    email: currentUser?.email,
                    contact: currentUser?.phoneNumber
                },
                theme: {
                    color: "#E61E4D"
                }
            };
            
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            setLoading(false);

        } else if (selectedPayment === 'gpay') {
            // Manual UPI Intent / QR Display
            // In a real mobile app, this could invoke a deep link.
            // For web, we usually show a QR code or VPA.
            // User requested: "gpay should come to upi: badabuilder@okhdfc"
            
            // We can try a deep link for mobile users:
            const upiLink = `upi://pay?pa=badabuilder@okhdfc&pn=BadaBuilder&am=${grandTotal}&ti=${Date.now()}`;
            
            // Check if mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                window.location.href = upiLink;
            } else {
                alert(`Please open your GPay app and pay ₹${grandTotal} to handle: badabuilder@okhdfc`);
            }
            setLoading(false);
        }
    };

    return (
        <div className="reserve-page">
            <header className="reserve-header">
                <div className="reserve-container-nav">
                    <button className="back-btn" onClick={() => navigate(-1)}><FaChevronLeft /></button>
                    <img src="/logo.png" alt="Bada Builder" className="nav-logo" style={{height: 32}} />
                </div>
            </header>

            <div className="reserve-main-grid">
                
                {/* Left Column: Payment & Confirm */}
                <div className="reserve-left">
                    <div className="section-title">
                        <button className="back-circle" onClick={() => navigate(-1)}><FaChevronLeft /></button>
                        <h1>Confirm and pay</h1>
                    </div>

                    <div className="reserve-section">
                        <h2>Your trip</h2>
                        <div className="trip-dates">
                            <div className="trip-info-row">
                                <strong>Dates</strong>
                                <span>{checkIn} – {checkOut}</span>
                                <button className="edit-btn">Edit</button>
                            </div>
                            <div className="trip-info-row">
                                <strong>Guests</strong>
                                <span>{guests} guest{guests > 1 ? 's' : ''}</span>
                                <button className="edit-btn">Edit</button>
                            </div>
                        </div>
                    </div>

                    <div className="divider" />

                    <div className="reserve-section">
                        <h2>Pay with</h2>
                        <div className="payment-options">
                            {/* Razorpay Option */}
                            <div 
                                className={`payment-card ${selectedPayment === 'razorpay' ? 'selected' : ''}`}
                                onClick={() => setSelectedPayment('razorpay')}
                            >
                                <div className="payment-icon">
                                    <SiRazorpay size={24} color="#3395FF"/>
                                </div>
                                <div className="payment-details">
                                    <span>Razorpay / Cards / Netbanking</span>
                                </div>
                                <div className="radio-circle">
                                    {selectedPayment === 'razorpay' && <div className="radio-dot" />}
                                </div>
                            </div>

                            {/* GPay Option */}
                            <div 
                                className={`payment-card ${selectedPayment === 'gpay' ? 'selected' : ''}`}
                                onClick={() => setSelectedPayment('gpay')}
                            >
                                <div className="payment-icon">
                                    <FaGooglePay size={28} />
                                </div>
                                <div className="payment-details">
                                    <span>Google Pay / UPI</span>
                                </div>
                                <div className="radio-circle">
                                    {selectedPayment === 'gpay' && <div className="radio-dot" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="divider" />

                    <div className="reserve-rules">
                        <h2>Ground rules</h2>
                        <p>We ask every guest to remember a few simple things about what makes a great guest.</p>
                        <ul>
                            <li>Follow the house rules</li>
                            <li>Treat your host's home like your own</li>
                        </ul>
                    </div>

                    <div className="divider" />

                    <button className="confirm-pay-btn" onClick={handlePayment} disabled={loading}>
                        {loading ? 'Processing...' : `Confirm and pay • ₹${grandTotal.toLocaleString()}`}
                    </button>
                </div>

                {/* Right Column: Price Breakdown Card */}
                <div className="reserve-right">
                    <div className="price-card-sticky">
                        <div className="property-preview-header">
                            <img src={propertyImage || '/placeholder-property.jpg'} alt="Property" />
                            <div className="property-preview-info">
                                <span className="property-type">Entire home</span>
                                <h4>{propertyTitle}</h4>
                                <div className="preview-rating">
                                    <FaStar size={12} />
                                    <span>{propertyRating || 'New'}</span>
                                    <span className="dot">·</span>
                                    <span>Superhost</span>
                                </div>
                            </div>
                        </div>

                        <div className="divider" />

                        <div className="price-breakdown">
                            <h3>Price details</h3>
                            <div className="breakdown-row">
                                <span>₹{pricePerNight.toLocaleString()} x {nights} nights</span>
                                <span>₹{(pricePerNight * nights).toLocaleString()}</span>
                            </div>
                            <div className="breakdown-row">
                                <span>Cleaning fee</span>
                                <span>₹{cleaningFee.toLocaleString()}</span>
                            </div>
                            <div className="breakdown-row">
                                <span>Taxes</span>
                                <span>₹{taxes.toLocaleString()}</span>
                            </div>
                            <div className="divider-light" />
                            <div className="breakdown-row total">
                                <span>Total (INR)</span>
                                <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ShortStayReserve;
