import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
    FaVideo, FaCheckCircle, FaArrowLeft, FaChevronRight,
    FaShieldAlt, FaRupeeSign, FaMapMarkerAlt, FaSearch,
    FaLocationArrow, FaTimes, FaCamera
} from 'react-icons/fa';
import axios from 'axios';
import { packages } from './packages';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle map events
const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
};

// Helper component to handle external map control (like flyTo)
const MapController = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, 16, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [center, map]);

    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
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

const MarketingPackageDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [packageData, setPackageData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        propertyPrice: '',
        address: '',
        shootDate: '',
        buildingLandmark: '',
        timeSlot: '',
        city: '',
        pincode: '',
        state: '',
        paymentPreference: 'PRE_SHOOT'
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Map states
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [currentLocationLoading, setCurrentLocationLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Delhi
    const [markerPosition, setMarkerPosition] = useState([28.6139, 77.2090]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const searchTimeoutRef = useRef(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const foundPackage = packages.find(p => p.id === parseInt(id));
        if (foundPackage) {
            setPackageData(foundPackage);
            window.scrollTo(0, 0);
        } else {
            setPackageData('NOT_FOUND');
        }
    }, [id]);

    // Location & Map Helpers
    const handleSearch = async (query) => {
        if (!query || query.length < 3) return;

        try {
            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
            const response = await fetch(`${baseUrl}/api/proxy/nominatim/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            setSearchResults(data);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(query);
        }, 500);
    };

    const selectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const pos = [lat, lng];

        setMarkerPosition(pos);
        setMapCenter(pos);
        setSelectedLocation({
            lat,
            lng,
            address: result.display_name
        });
        setSearchQuery(result.display_name);
        setShowSearchResults(false);
    };

    const reverseGeocode = async (lat, lng) => {
        setAddressLoading(true);
        try {
            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
            const response = await fetch(`${baseUrl}/api/proxy/nominatim/reverse?lat=${lat}&lon=${lng}`);

            if (!response.ok) throw new Error('Reverse geocode failed');

            const data = await response.json();

            if (data && data.display_name) {
                setSelectedLocation({
                    lat,
                    lng,
                    address: data.display_name
                });
                setSearchQuery(data.display_name);
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        } finally {
            setAddressLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        setCurrentLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const pos = [lat, lng];

                setMarkerPosition(pos);
                setMapCenter(pos);
                reverseGeocode(lat, lng);
                setCurrentLocationLoading(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to get your location. Please allow location access.');
                setCurrentLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    const openMapModal = () => {
        setShowMapModal(true);
        setSearchQuery('');
        if (!selectedLocation) {
            setMapCenter([28.6139, 77.2090]);
        }
    };

    const confirmLocation = () => {
        if (selectedLocation) {
            setFormData(prev => ({
                ...prev,
                address: selectedLocation.address
            }));
            setShowMapModal(false);
        }
    };

    const handleMapClick = (latlng) => {
        const pos = [latlng.lat, latlng.lng];
        setMarkerPosition(pos);
        reverseGeocode(latlng.lat, latlng.lng);
    };

    const handleMarkerDragEnd = (e) => {
        const { lat, lng } = e.target.getLatLng();
        const pos = [lat, lng];
        setMarkerPosition(pos);
        reverseGeocode(lat, lng);
    };

    useEffect(() => {
        if (showMapModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showMapModal]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isPaymentPackage = packageData?.id === 1 || packageData?.id === 2;

    const validateForm = () => {
        if (!formData.shootDate) return 'Please select a shoot date.';
        if (!formData.timeSlot) return 'Please select a preferred time slot.';
        if (!formData.city) return 'Please enter your city.';
        if (!formData.state) return 'Please enter your state.';
        if (!formData.pincode || formData.pincode.length !== 6) return 'Please enter a valid 6-digit pincode.';
        if (!agreedToTerms) return 'You must agree to the terms and rules.';
        return null;
    };

    const handleRazorpayPayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        // If Post-Shoot selected, skip Razorpay and submit directly
        if (formData.paymentPreference === 'POST_SHOOT') {
            try {
                await axios.post('http://localhost:5000/api/marketing/inquiry', {
                    ...formData,
                    packageTitle: packageData.title,
                    packagePrice: packageData.price + ' ' + packageData.priceSub,
                    packageTarget: packageData.target,
                    status: 'BOOKED_POST_PAY'
                });
                setSuccess(true);
                setTimeout(() => {
                    navigate('/services');
                }, 3000);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to confirm booking. Please try again.');
            } finally {
                setLoading(false);
            }
            return;
        }

        const res = await loadRazorpay();
        if (!res) {
            setError('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        const priceString = packageData.price.replace(/[₹,]/g, '');
        const amount = Number(priceString);

        if (isNaN(amount)) {
            setError('Invalid price format. Please contact support.');
            setLoading(false);
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            amount: amount * 100,
            currency: 'INR',
            name: 'Bada Builder',
            description: `Payment for ${packageData.title}`,
            image: '/logo.png',
            handler: function (response) {
                handlePaymentSuccess(response);
            },
            prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone,
            },
            theme: { color: '#0ea5e9' },
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        setLoading(false);
    };

    const handlePaymentSuccess = async (response) => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/marketing/inquiry', {
                ...formData,
                packageTitle: packageData.title,
                packagePrice: packageData.price + ' ' + packageData.priceSub,
                packageTarget: packageData.target,
                paymentId: response.razorpay_payment_id,
                status: 'PAID'
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/services');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Payment successful but failed to save order. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/marketing/inquiry', {
                ...formData,
                packageTitle: packageData.title,
                packagePrice: packageData.price + ' ' + packageData.priceSub,
                packageTarget: packageData.target
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/services');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send inquiry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (packageData === 'NOT_FOUND') {
        return (
            <div id="marketing-package-details-root" className="bg-[#0F172A] text-[#F8FAFC] min-h-screen flex items-center justify-center pt-[200px] font-sans">
                <div className="text-center max-w-lg px-6">
                    <h2 className="text-3xl font-bold mb-4">Package Not Found</h2>
                    <p className="text-[#CBD5E1] mb-8">The marketing package you are looking for does not exist or has been removed.</p>
                    <button
                        className="flex items-center gap-2 mx-auto text-[#CBD5E1] bg-none border-none text-sm font-semibold cursor-pointer transition-all hover:text-white"
                        onClick={() => navigate('/services/marketing')}
                    >
                        <FaArrowLeft /> Back to Packages
                    </button>
                </div>
            </div>
        );
    }

    if (!packageData) return (
        <div id="marketing-package-details-root" className="bg-[#0F172A] text-[#F8FAFC] min-h-screen flex items-center justify-center font-sans">
            <div className="animate-pulse">Loading...</div>
        </div>
    );

    if (success) {
        return (
            <div id="marketing-package-details-root" className="bg-[#0F172A] text-[#F8FAFC] min-h-screen flex items-center justify-center pt-[100px] font-sans">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-12 bg-[#1e293b] rounded-3xl border border-[#94a3b826] shadow-2xl max-w-xl mx-6"
                >
                    <div className="flex justify-center mb-6">
                        <FaCheckCircle size={80} className="text-[#10B981]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{isPaymentPackage ? 'Payment Successful!' : 'Inquiry Sent Successfully!'}</h3>
                    <p className="text-[#CBD5E1] mb-2">{isPaymentPackage ? 'Your package has been booked. You will receive a confirmation shortly.' : 'Our team will contact you shortly to discuss your project.'}</p>
                    <p className="text-sm text-[#38BDF8] font-bold mt-6">Redirecting to marketing services...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div id="marketing-package-details-root" className="bg-[#0F172A] text-[#F8FAFC] min-h-screen pb-20 font-sans">
            <LoadingOverlay isSubmitting={loading} />
            {/* Breadcrumb / Back Navigation */}
            <div className="bg-[#0f172ae6] backdrop-blur-xl py-5 sticky top-0 z-[100] border-b border-[#94a3b833]">
                <div className="max-w-[1200px] mx-auto px-6 box-border">
                    <button
                        className="flex items-center gap-2 !text-white !bg-[#1e293b] hover:!bg-[#334155] border border-[#334155] py-2 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all duration-300 hover:!text-[#38BDF8] hover:-translate-x-1 shadow-lg"
                        onClick={() => navigate('/services/marketing')}
                    >
                        <FaArrowLeft className="text-[#38BDF8]" /> Back to Packages
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <section className="py-[60px] relative overflow-hidden border-b border-[#94a3b81a] bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent),radial-gradient(circle_at_bottom_left,rgba(30,41,59,0.6),transparent)]">
                <div className="max-w-[1100px] mx-auto px-6 box-border">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-start md:gap-10 md:text-center lg:text-left"
                    >
                        <div className="hero-text">
                            <span className="inline-block py-2 px-5 bg-[#38BDF826] text-[#7DD3FC] rounded-full text-[13px] font-extrabold uppercase tracking-[1.5px] mb-6 border border-[#38BDF833]">
                                {packageData.target}
                            </span>
                            <h1 className="text-[36px] md:text-[48px] font-[850] leading-[1.1] mb-6 text-white">
                                {packageData.title}
                            </h1>
                            <p className="text-[18px] text-[#CBD5E1] mb-10 leading-[1.6] max-w-[540px] md:mx-auto lg:mx-0">
                                Professional real estate marketing solutions tailored for premium property sales.
                            </p>
                            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-5 md:justify-center lg:justify-start">
                                <a href="#action-form" className="inline-flex items-center gap-3 bg-[#0ea5e9] text-white py-[18px] px-9 rounded-[14px] font-extrabold text-[17px] no-underline transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(14,165,233,0.5)] hover:bg-[#0284c7] hover:-translate-y-[3px] hover:shadow-[0_15px_35px_-5px_rgba(14,165,233,0.6)]">
                                    {isPaymentPackage ? 'Get Started' : 'Inquire Now'} <FaChevronRight />
                                </a>
                                <div className="flex flex-col gap-4 text-left">
                                    <div className="flex items-center gap-[10px] text-sm text-[#94A3B8] font-semibold">
                                        <FaShieldAlt className="text-[#38BDF8] drop-shadow-[0_0_5px_rgba(56,189,248,0.3)]" /> 100% Secure
                                    </div>
                                    <div className="flex items-center gap-[10px] text-sm text-[#94A3B8] font-semibold">
                                        <FaCheckCircle className="text-[#38BDF8] drop-shadow-[0_0_5px_rgba(56,189,248,0.3)]" /> Verification Ready
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#38bdf84d] rounded-3xl p-8 md:p-10 text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                            <div className="mb-6 flex items-baseline justify-center gap-[6px]">
                                <span className="text-[28px] font-bold text-[#38BDF8]">₹</span>
                                <span className="text-[56px] font-black tracking-[-1.5px] text-white">
                                    {packageData.price.replace('₹', '')}
                                </span>
                                <span className="text-base text-[#94A3B8] font-semibold">{packageData.priceSub}</span>
                            </div>
                            <div className="pt-8 border-t border-[#94a3b826] text-[#CBD5E1] flex justify-center gap-4 font-bold">
                                <div className="flex items-center gap-2"><FaVideo /> {packageData.videos}</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 box-border grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 items-start pt-[60px]">
                <div className="details-side-column order-1 lg:sticky lg:top-[120px]">
                    {/* Integrated Form Section */}
                    <section id="action-form" className="bg-[#1e293b] border border-[#38bdf840] rounded-3xl p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full mx-auto">
                        <div className="flex flex-col gap-3 mb-10">
                            <h3 className="text-3xl font-black text-white tracking-tight">{isPaymentPackage ? 'Book Package' : 'Send Inquiry'}</h3>
                            <p className="text-base text-[#94A3B8] leading-relaxed">Fill in the professional details below to proceed with your booking.</p>
                        </div>

                        <form onSubmit={isPaymentPackage ? handleRazorpayPayment : handleInquirySubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-[15px] font-bold text-[#E2E8F0]">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your name"
                                    className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.1)] placeholder:text-[#475569]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[15px] font-bold text-[#E2E8F0]">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="+91 00000 00000"
                                        className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.1)] placeholder:text-[#475569]"
                                    />
                                </div>

                                {isPaymentPackage && (
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[15px] font-bold text-[#E2E8F0]">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="your@email.com"
                                            className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.1)] placeholder:text-[#475569]"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6 max-[480px]:grid-cols-1">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[15px] font-bold text-[#E2E8F0]">Shoot Date</label>
                                    <input
                                        type="date"
                                        name="shootDate"
                                        value={formData.shootDate}
                                        onChange={handleChange}
                                        required
                                        min={today}
                                        className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] [color-scheme:dark] cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[15px] font-bold text-[#E2E8F0]">Time Slot</label>
                                    <select
                                        name="timeSlot"
                                        value={formData.timeSlot}
                                        onChange={handleChange}
                                        required
                                        className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2338BDF8%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M19 9l-7 7-7-7%22%3E%3C/path%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_20px_center] bg-[length:18px] cursor-pointer"
                                    >
                                        <option value="">Select slot</option>
                                        <option value="09:00 - 11:00">09:00 - 11:00 AM</option>
                                        <option value="11:00 - 13:00">11:00 - 01:00 PM</option>
                                        <option value="14:00 - 16:00">02:00 - 04:00 PM</option>
                                        <option value="16:00 - 18:00">04:00 - 06:00 PM</option>
                                    </select>
                                </div>
                            </div>

                            <div className="my-6 relative text-center before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-full before:h-[1px] before:bg-[#94a3b81a]">
                                <span className="relative bg-[#1e293b] px-6 text-[#38BDF8] text-[13px] font-black uppercase tracking-widest">Location Information</span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[15px] font-bold text-[#E2E8F0]">Building / Society Name & Landmark</label>
                                <input
                                    type="text"
                                    name="buildingLandmark"
                                    value={formData.buildingLandmark}
                                    onChange={handleChange}
                                    required
                                    placeholder="Flat No, Building Name, Landmark"
                                    className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.1)] placeholder:text-[#475569]"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-6 max-[768px]:grid-cols-1">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[15px] font-bold text-[#E2E8F0]">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        placeholder="City"
                                        className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] placeholder:text-[#475569]"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[15px] font-bold text-[#E2E8F0]">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        placeholder="State"
                                        className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] placeholder:text-[#475569]"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[15px] font-bold text-[#E2E8F0]">Pincode</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#38BDF8] font-black text-sm tracking-widest border-r border-[#94a3b833] pr-3">IND</span>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 6) handleChange({ target: { name: 'pincode', value: val } });
                                            }}
                                            required
                                            placeholder="000 000"
                                            className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 pl-16 pr-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.1)] placeholder:text-[#475569]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[15px] font-bold text-[#E2E8F0]">Full Address</label>
                                    <button
                                        type="button"
                                        onClick={openMapModal}
                                        className="flex items-center gap-2 !text-[#38BDF8] hover:!text-[#0F172A] text-[11px] font-black uppercase tracking-[1px] transition-all duration-300 !bg-[#38bdf81a] border border-[#38bdf866] py-2 px-4 rounded-xl hover:!bg-[#38BDF8] hover:shadow-[0_8px_20px_-5px_rgba(56,189,248,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <FaMapMarkerAlt className="text-sm" /> Pin on Map
                                    </button>
                                </div>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Complete street address for our team to find you"
                                    rows="4"
                                    className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] placeholder:text-[#475569] resize-none"
                                />
                            </div>

                            {!isPaymentPackage && (
                                <div className="flex flex-col gap-3">
                                    <label className="text-[15px] font-bold text-[#E2E8F0]">Property Price (₹)</label>
                                    <input
                                        type="number"
                                        name="propertyPrice"
                                        value={formData.propertyPrice}
                                        onChange={handleChange}
                                        required
                                        placeholder="Estimated price"
                                        className="bg-[#0f172a] border border-[#94a3b833] rounded-2xl py-4 px-5 text-white text-base transition-all duration-300 w-full box-border focus:border-[#38BDF8] focus:outline-none focus:bg-[#151f33] placeholder:text-[#475569]"
                                    />
                                </div>
                            )}

                            {isPaymentPackage && (
                                <div className="flex flex-col gap-4 mb-2">
                                    <label className="text-[15px] font-bold text-[#E2E8F0]">Payment Timing</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setFormData({ ...formData, paymentPreference: 'PRE_SHOOT' })}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col gap-1 ${formData.paymentPreference === 'PRE_SHOOT' ? 'bg-[#38BDF81a] border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.1)]' : 'bg-[#0f172a] border-[#94a3b833] hover:border-[#94a3b866]'}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-black text-white uppercase tracking-tighter">Pre-Shoot</span>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.paymentPreference === 'PRE_SHOOT' ? 'border-[#38BDF8]' : 'border-[#94a3b866]'}`}>
                                                    {formData.paymentPreference === 'PRE_SHOOT' && <div className="w-2 h-2 rounded-full bg-[#38BDF8]" />}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-[#94A3B8] leading-tight font-medium">Full online payment before the shoot.</p>
                                        </div>

                                        <div
                                            onClick={() => setFormData({ ...formData, paymentPreference: 'POST_SHOOT' })}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col gap-1 ${formData.paymentPreference === 'POST_SHOOT' ? 'bg-[#38BDF81a] border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.1)]' : 'bg-[#0f172a] border-[#94a3b833] hover:border-[#94a3b866]'}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-black text-white uppercase tracking-tighter">Post-Shoot</span>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.paymentPreference === 'POST_SHOOT' ? 'border-[#38BDF8]' : 'border-[#94a3b866]'}`}>
                                                    {formData.paymentPreference === 'POST_SHOOT' && <div className="w-2 h-2 rounded-full bg-[#38BDF8]" />}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-[#94A3B8] leading-tight font-medium">Payment after completion of shoot.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-[#F87171] text-[13px] font-semibold -mt-2">{error}</p>}

                            <div className="my-2">
                                <label className="flex items-start gap-4 cursor-pointer text-[14px] text-[#CBD5E1] leading-relaxed">
                                    <input
                                        type="checkbox"
                                        name="agreedToTerms"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="absolute opacity-0 cursor-pointer h-0 w-0"
                                    />
                                    <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-300 shrink-0 mt-[2px] flex items-center justify-center ${agreedToTerms ? 'bg-[#38BDF8] border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.4)]' : 'border-[#94a3b866]'}`}>
                                        {agreedToTerms && (
                                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <span className="check-text">
                                        I confirm that I have read and agree to the <a href="/services/marketing/terms-conditions" target="_blank" className="text-[#38BDF8] no-underline font-black border-b-2 border-[#38bdf833] hover:text-[#7DD3FC] hover:border-[#7DD3FC]">Terms & Rules</a>
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={!agreedToTerms || loading}
                                className="w-full !bg-[#38BDF8] !text-[#0F172A] border-none py-5 rounded-2xl font-black text-xl uppercase tracking-[2px] cursor-pointer transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(56,189,248,0.5)] hover:!bg-[#7DD3FC] hover:-translate-y-1 hover:shadow-[0_25px_50px_-5px_rgba(56,189,248,0.6)] disabled:opacity-20 disabled:cursor-not-allowed disabled:!bg-slate-700 disabled:!text-slate-400 disabled:shadow-none"
                            >
                                {loading ? 'Processing...' : (
                                    isPaymentPackage
                                        ? (formData.paymentPreference === 'POST_SHOOT' ? 'Confirm Booking' : `Complete Payment`)
                                        : 'Notify Me'
                                )}
                            </button>
                        </form>
                    </section>
                </div>

                <div className="details-main-column order-2 w-full">
                    {/* What's Included Section */}
                    <motion.section
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-12 w-full"
                    >
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-4 mb-8"
                        >
                            <motion.span
                                initial={{ height: 0 }}
                                whileInView={{ height: '32px' }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="w-2 bg-gradient-to-b from-[#38BDF8] to-[#0EA5E9] rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                            ></motion.span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] leading-none">
                                What's Included
                            </h2>
                        </motion.div>

                        <div className="flex flex-col gap-8">
                            {/* Top Highlight Cards - Premium Vertical Design */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                                <motion.div
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="relative overflow-hidden group rounded-[2rem] border border-[#38bdf820] bg-[#38bdf808] backdrop-blur-2xl hover:bg-[#38bdf815] transition-all duration-500 shadow-2xl"
                                >
                                    <div className="relative flex flex-row sm:flex-col gap-6 p-6 lg:p-10 items-center sm:text-center justify-start sm:justify-center min-h-[140px] sm:min-h-[260px]">
                                        <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-[#38bdf820] to-transparent text-[#38BDF8] rounded-3xl flex items-center justify-center shrink-0 text-3xl lg:text-5xl border border-[#38bdf830] shadow-[0_0_20px_rgba(56,189,248,0.2)] group-hover:shadow-[0_0_40px_rgba(56,189,248,0.4)] group-hover:bg-[#38bdf830] transition-all duration-500">
                                            <FaVideo className="group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h4 className="text-[10px] lg:text-[12px] font-black text-[#38BDF8] uppercase tracking-[0.3em] opacity-90">Content Structure</h4>
                                            <p className="text-xl lg:text-3xl text-white font-black tracking-tight leading-tight">
                                                {packageData.videos}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="relative overflow-hidden group rounded-[2rem] border border-[#38bdf820] bg-[#38bdf808] backdrop-blur-2xl hover:bg-[#38bdf815] transition-all duration-500 shadow-2xl"
                                >
                                    <div className="relative flex flex-row sm:flex-col gap-6 p-6 lg:p-10 items-center sm:text-center justify-start sm:justify-center min-h-[140px] sm:min-h-[260px]">
                                        <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-[#38bdf820] to-transparent text-[#38BDF8] rounded-3xl flex items-center justify-center shrink-0 text-3xl lg:text-5xl border border-[#38bdf830] shadow-[0_0_20px_rgba(56,189,248,0.2)] group-hover:shadow-[0_0_40px_rgba(56,189,248,0.4)] group-hover:bg-[#38bdf830] transition-all duration-500">
                                            <FaCamera className="group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h4 className="text-[10px] lg:text-[12px] font-black text-[#38BDF8] uppercase tracking-[0.3em] opacity-90">Visual Assets</h4>
                                            <p className="text-xl lg:text-3xl text-white font-black tracking-tight leading-tight">
                                                {packageData.id === 1 ? '10 Pro Images' :
                                                    packageData.id === 2 ? '20 Pro Images' :
                                                        '50+ High-Res Images'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Features Grid - Zero Waste Mobile Layout */}
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5"
                            >
                                {packageData.features.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 + 0.5 }}
                                        whileHover={{ x: 8, backgroundColor: "rgba(56, 189, 248, 0.08)" }}
                                        className="flex gap-4 bg-[#1e293b60] border border-[#94a3b810] p-5 rounded-2xl items-center backdrop-blur-md hover:border-[#38bdf830] hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 group"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#10B98115] flex items-center justify-center border border-[#10B98130] group-hover:scale-110 transition-transform">
                                            <FaCheckCircle className="text-[#10B981] text-[14px]" />
                                        </div>
                                        <p className="text-[14px] text-[#CBD5E1] font-semibold tracking-wide group-hover:text-white transition-colors">{feature}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.section>
                </div>
            </div>

            {/* Map Modal Portal */}
            {showMapModal && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1e293b] w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col border border-[#38bdf840] overflow-hidden overflow-y-auto custom-scrollbar">
                        {/* Header */}
                        <div className="flex justify-between items-center p-5 border-b border-[#94a3b81a] sticky top-0 bg-[#1e293b] z-[1001]">
                            <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                <div className="p-2 bg-[#38bdf81a] text-[#38BDF8] rounded-xl text-xs border border-[#38bdf826]">
                                    <FaMapMarkerAlt />
                                </div>
                                Select Location
                            </h3>
                            <button
                                onClick={() => setShowMapModal(false)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    minWidth: '40px',
                                    minHeight: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#ef4444',
                                    borderRadius: '50%',
                                    border: '2px solid white',
                                    cursor: 'pointer',
                                    zIndex: 9999,
                                    padding: 0,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                    opacity: 1,
                                    visibility: 'visible',
                                    position: 'relative'
                                }}
                                aria-label="Close"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{ display: 'block', opacity: 1, visibility: 'visible' }}
                                >
                                    <path
                                        d="M18 6L6 18M6 6l12 12"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex flex-col flex-1">
                            {/* Controls */}
                            <div className="p-4 bg-[#151f33] border-b border-[#94a3b81a] flex flex-col md:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    disabled={currentLocationLoading}
                                    className="px-5 py-3 !bg-[#38BDF8] hover:!bg-[#0EA5E9] disabled:!bg-[#475569] !text-[#0F172A] rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#38bdf826]"
                                >
                                    {currentLocationLoading ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
                                            Locating...
                                        </>
                                    ) : (
                                        <>
                                            <FaLocationArrow /> Use Current Location
                                        </>
                                    )}
                                </button>

                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]">
                                        <FaSearch />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search for your locality..."
                                        className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-[#94a3b833] rounded-2xl text-white placeholder-[#475569] focus:outline-none focus:border-[#38BDF8] transition-all text-sm"
                                        value={searchQuery}
                                        onChange={handleSearchInputChange}
                                        onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
                                    />

                                    {showSearchResults && searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-[#94a3b833] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                            {searchResults.map((result, idx) => (
                                                <div
                                                    key={idx}
                                                    className="px-5 py-3 hover:bg-[#38bdf81a] cursor-pointer text-[#CBD5E1] hover:text-[#38BDF8] border-b border-[#94a3b81a] last:border-0 transition-colors flex items-start gap-3 text-sm"
                                                    onClick={() => selectSearchResult(result)}
                                                >
                                                    <FaMapMarkerAlt className="mt-1 shrink-0" />
                                                    <span>{result.display_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Map */}
                            <div className="relative bg-[#0f172a] h-[400px] md:h-[450px]">
                                {addressLoading && (
                                    <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center gap-3">
                                        <div className="w-8 h-8 border-3 border-[#38BDF8]/30 border-t-[#38BDF8] rounded-full animate-spin" />
                                        <p className="text-[#38BDF8] font-black uppercase tracking-widest text-[10px]">Fetching address...</p>
                                    </div>
                                )}

                                <MapContainer
                                    center={mapCenter}
                                    zoom={13}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker
                                        position={markerPosition}
                                        draggable={true}
                                        eventHandlers={{
                                            dragend: handleMarkerDragEnd,
                                        }}
                                    />
                                    <MapEvents onMapClick={handleMapClick} />
                                    <MapController center={mapCenter} />
                                </MapContainer>

                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-[#1e293b]/90 backdrop-blur px-4 py-2 rounded-full text-[#38BDF8] text-[10px] font-black uppercase tracking-widest border border-[#38bdf840] shadow-xl pointer-events-none">
                                    📍 Drag marker to pinpoint
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5 bg-[#151f33] border-t border-[#94a3b81a] flex flex-col gap-4">
                                {selectedLocation && (
                                    <div className="bg-[#38bdf80d] border border-[#38bdf826] rounded-2xl p-4">
                                        <p className="text-[#38BDF8] text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <FaCheckCircle /> Selected Location
                                        </p>
                                        <p className="text-[#CBD5E1] text-xs leading-relaxed">{selectedLocation.address}</p>
                                    </div>
                                )}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowMapModal(false)}
                                        className="px-6 py-3 text-[#94A3B8] hover:text-white font-black uppercase tracking-widest text-xs transition-all border border-transparent hover:border-[#94A3B8/20] rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmLocation}
                                        disabled={!selectedLocation}
                                        className="px-8 py-3 !bg-[#38BDF8] hover:!bg-[#0EA5E9] disabled:!bg-[#475569] !text-[#0F172A] rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-[#38bdf826]"
                                    >
                                        Confirm Address
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MarketingPackageDetails;
