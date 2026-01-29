import { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaArrowRight, FaArrowLeft, FaUpload, FaTrash, FaMapMarkerAlt, FaRupeeSign, FaClipboardList, FaConciergeBell, FaCamera, FaHome } from 'react-icons/fa';
import { shortStayAPI } from '../../services/shortStayApi';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ShortStayForm.css';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STEPS = [
    { id: 'basic', title: 'The Basics', icon: <FaClipboardList /> },
    { id: 'location', title: 'Location', icon: <FaMapMarkerAlt /> },
    { id: 'media', title: 'Media', icon: <FaCamera /> },
    { id: 'pricing', title: 'Pricing', icon: <FaRupeeSign /> },
    { id: 'specifics', title: 'Details', icon: <FaHome /> }, 
    { id: 'rules', title: 'Rules', icon: <FaClipboardList /> },
    { id: 'policies', title: 'Policies', icon: <FaClipboardList /> },
    { id: 'amenities', title: 'Amenities', icon: <FaConciergeBell /> }
];

const stepVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
};

// Map Component Helper
const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
        locationfound(e) {
            setPosition(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (!position) {
            map.locate();
        }
    }, [map, position]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const ShortStayForm = ({ category, onClose, initialData = null }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        // Basic
        title: '',
        description: '',
        hostType: 'individual', 
        propertyType: category, // Auto-set
        
        // Location
        location: {
            address: '',
            landmark: '',
            city: '',
            state: '',
            country: 'India',
            pincode: '',
            lat: '',
            lng: ''
        },

        // Media
        images: [], // New Image Files
        existingImages: [], // Existing Image URLs (for edit mode)
        imagePreviews: [], // All previews (existing + new)
        video: null,
        tour360: '', // URL
        
        // Pricing
        pricing: {
            perNight: '',
            weekly: '',
            monthly: '',
            extraGuest: '',
            cleaning: '',
            securityDeposit: '',
            taxes: ''
        },

        // Rules
        rules: {
            checkIn: '12:00',
            checkOut: '11:00',
            minStay: 1,
            maxStay: 30,
            instantBooking: false
        },

        // Policies
        policies: {
            cancellation: 'flexible', 
            houseRules: '',
            idRequired: true,
            smoking: false,
            pets: false,
            events: false
        },

        // Amenities
        amenities: [],

        // Specific Details
        specific_details: {}
    });

    // Load Initial Data for Edit Mode
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                title: initialData.title || '',
                description: initialData.description || '',
                hostType: initialData.hostType || 'individual',
                propertyType: initialData.category || category,
                location: {
                    ...prev.location,
                    ...initialData.location
                },
                // Handle Images
                existingImages: initialData.images || [],
                images: [], // No new images yet
                imagePreviews: initialData.images || [],
                
                video: null, // Video file object cant be prefilled from URL immediately easily in this structure without more work, leaving empty for now or need specific handling if video edit supported
                tour360: initialData.tour360 || '',
                
                pricing: {
                    ...prev.pricing,
                    ...initialData.pricing
                },
                rules: {
                    ...prev.rules,
                    ...initialData.rules
                },
                policies: {
                    ...prev.policies,
                    ...initialData.policies
                },
                amenities: initialData.amenities || [],
                specific_details: initialData.specific_details || {}
            }));
        }
    }, [initialData, category]);

    // Handlers
    const handleBasicChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            location: { ...prev.location, [name]: value }
        }));
    };

    const handlePricingChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            pricing: { ...prev.pricing, [name]: value }
        }));
    };

    const handleRulesChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            rules: { ...prev.rules, [name]: type === 'checkbox' ? checked : value }
        }));
    };

    const handlePolicyChange = (e) => {
         const { name, value, type, checked } = e.target;
         setFormData(prev => ({
             ...prev,
             policies: { ...prev.policies, [name]: type === 'checkbox' ? checked : value }
         }));
    };

    const handleSpecificChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            specific_details: { 
                ...prev.specific_details, 
                [name]: type === 'checkbox' ? checked : value 
            }
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        // Count total: existing + current new + incoming new
        const totalImages = (formData.existingImages?.length || 0) + formData.images.length + files.length;
        
        if (totalImages > 30) {
            alert('Maximum 30 images allowed');
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files],
            imagePreviews: [...prev.imagePreviews, ...newPreviews]
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => {
            const isExisting = index < (prev.existingImages?.length || 0);
            
            if (isExisting) {
                // Removing an existing image
                const newExisting = prev.existingImages.filter((_, i) => i !== index);
                const newPreviews = prev.imagePreviews.filter((_, i) => i !== index);
                return {
                    ...prev,
                    existingImages: newExisting,
                    imagePreviews: newPreviews
                };
            } else {
                // Removing a new image
                // Calculate index in the 'images' array
                const newImageIndex = index - (prev.existingImages?.length || 0);
                const newImages = prev.images.filter((_, i) => i !== newImageIndex);
                const newPreviews = prev.imagePreviews.filter((_, i) => i !== index);
                return {
                    ...prev,
                    images: newImages,
                    imagePreviews: newPreviews
                };
            }
        });
    };

    const toggleAmenity = (amenity) => {
        setFormData(prev => {
            const amenities = prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity];
            return { ...prev, amenities };
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (initialData) {
                // Update Mode
                await shortStayAPI.update(initialData.id, {
                    ...formData,
                    existing_images: formData.existingImages, // Send remaining existing images
                    category: initialData.category || category
                }, formData.images); // Send NEW files
                alert('Property updated successfully!');
            } else {
                // Create Mode
                await shortStayAPI.create({
                    ...formData,
                    category
                }, formData.images);
                alert('Property listed successfully!');
            }
            
            navigate('/short-stay/my-listings'); // Redirect to my listings
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderSpecificFields = () => {
        const props = formData.specific_details;
        
        switch(category) {
            case 'apartment': // Flats / Apartments
                return (
                    <>
                        <div className="form-group">
                            <label>BHK Type</label>
                            <select name="bhk" value={props.bhk || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="">Select Configuration</option>
                                <option value="Studio">Studio</option>
                                <option value="1">1 BHK</option>
                                <option value="2">2 BHK</option>
                                <option value="3">3 BHK</option>
                                <option value="4+">4+ BHK</option>
                            </select>
                        </div>
                        <div className="form-row">
                             <div className="form-group">
                                <label>Floor No.</label>
                                <input type="number" name="floor" value={props.floor || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                             <div className="form-group">
                                <label>Total Floors</label>
                                <input type="number" name="totalFloors" value={props.totalFloors || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                        </div>
                         <div className="form-group">
                            <label>Carpet Area (sq ft)</label>
                            <input type="number" name="carpetArea" value={props.carpetArea || ''} onChange={handleSpecificChange} className="premium-input" />
                        </div>
                        <label>Features & Amenities</label>
                        <div className="checkbox-group-styled">
                            {['Lift Available', 'Balcony', 'Gated Society', 'Gym', 'Pool', 'Security', 'Clubhouse'].map(item => (
                                <label key={item} className={`checkbox-card ${props[item] ? 'active' : ''}`}>
                                    <input type="checkbox" name={item} checked={props[item] || false} onChange={handleSpecificChange} hidden />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </>
                );
            case 'house': // Villa / Bungalow
                 return (
                    <>
                        <div className="form-group">
                            <label>House Type</label>
                            <select name="houseType" value={props.houseType || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="">Select Type</option>
                                <option value="Villa">Villa</option>
                                <option value="Bungalow">Bungalow</option>
                                <option value="Duplex">Duplex</option>
                                <option value="Triplex">Triplex</option>
                            </select>
                        </div>
                         <div className="form-row">
                             <div className="form-group">
                                <label>Total Floors</label>
                                <input type="number" name="totalFloors" value={props.totalFloors || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                             <div className="form-group">
                                <label>Built-up Area</label>
                                <input type="number" name="builtUpArea" value={props.builtUpArea || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                        </div>
                        <div className="form-row">
                             <div className="form-group">
                                <label>Plot Area</label>
                                <input type="number" name="plotArea" value={props.plotArea || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                            <div className="form-group">
                                <label>Parking Spots</label>
                                <input type="number" name="parkingCount" value={props.parkingCount || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                        </div>
                        <label>Features</label>
                        <div className="checkbox-group-styled">
                             {['Private Garden', 'Private Pool', 'Caretaker Available', 'BBQ Area'].map(item => (
                                <label key={item} className={`checkbox-card ${props[item] ? 'active' : ''}`}>
                                    <input type="checkbox" name={item} checked={props[item] || false} onChange={handleSpecificChange} hidden />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </>
                );
             case 'dormitory':
                return (
                    <>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Total Beds</label>
                                <input type="number" name="totalBeds" value={props.totalBeds || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                             <div className="form-group">
                                <label>Shared Washrooms</label>
                                <input type="number" name="washrooms" value={props.washrooms || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Bed Type</label>
                             <select name="bedType" value={props.bedType || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="Single">Single</option>
                                <option value="Bunk">Bunk</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Crowd Type</label>
                             <select name="gender" value={props.gender || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="Mixed">Mixed</option>
                                <option value="Male Only">Male Only</option>
                                <option value="Female Only">Female Only</option>
                            </select>
                        </div>
                         <div className="checkbox-group-styled">
                             {['Lockers Available', 'Common Area', 'Security Cameras'].map(item => (
                                <label key={item} className={`checkbox-card ${props[item] ? 'active' : ''}`}>
                                    <input type="checkbox" name={item} checked={props[item] || false} onChange={handleSpecificChange} hidden />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </>
                );
             case 'hotel':
                return (
                    <>
                        <div className="form-group">
                            <label>Category</label>
                             <select name="hotelCategory" value={props.hotelCategory || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="Budget">Budget</option>
                                <option value="3 Star">3 Star</option>
                                <option value="4 Star">4 Star</option>
                                <option value="5 Star">5 Star</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Total Rooms</label>
                                <input type="number" name="totalRooms" value={props.totalRooms || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                             <div className="form-group">
                                <label>Elevator Count</label>
                                <input type="number" name="elevatorCount" value={props.elevatorCount || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                        </div>
                         <div className="checkbox-group-styled">
                             {['24x7 Front Desk', 'Room Service', 'Restaurant', 'Bar', 'Banquet Hall'].map(item => (
                                <label key={item} className={`checkbox-card ${props[item] ? 'active' : ''}`}>
                                    <input type="checkbox" name={item} checked={props[item] || false} onChange={handleSpecificChange} hidden />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </>
                );
             case 'cottage':
                return (
                    <>
                         <div className="form-group">
                            <label>Cottage Type</label>
                             <select name="cottageType" value={props.cottageType || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="Wooden">Wooden</option>
                                <option value="Mud">Mud</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                        </div>
                         <div className="form-group">
                            <label>Nature View</label>
                             <select name="natureView" value={props.natureView || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="Forest">Forest</option>
                                <option value="Lake">Lake</option>
                                <option value="Mountain">Mountain</option>
                            </select>
                        </div>
                        <div className="checkbox-group-styled">
                             {['Private Lawn', 'Fireplace', 'Outdoor Seating'].map(item => (
                                <label key={item} className={`checkbox-card ${props[item] ? 'active' : ''}`}>
                                    <input type="checkbox" name={item} checked={props[item] || false} onChange={handleSpecificChange} hidden />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </>
                );
            case 'tree_house':
                return (
                     <div className="form-row">
                         <div className="form-group">
                            <label>Height (ft)</label>
                            <input type="number" name="height" value={props.height || ''} onChange={handleSpecificChange} className="premium-input" />
                        </div>
                         <div className="form-group">
                            <label>Access Type</label>
                             <select name="accessType" value={props.accessType || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="Ladder">Ladder</option>
                                <option value="Staircase">Staircase</option>
                            </select>
                        </div>
                         <div className="form-group">
                            <label>Immersion Level</label>
                             <select name="immersion" value={props.immersion || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className="checkbox-group-styled">
                             {['Safety Certified', 'Child Friendly'].map(item => (
                                <label key={item} className={`checkbox-card ${props[item] ? 'active' : ''}`}>
                                    <input type="checkbox" name={item} checked={props[item] || false} onChange={handleSpecificChange} hidden />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
             case 'tent':
                return (
                    <>
                        <div className="form-group">
                            <label>Tent Type</label>
                             <select name="tentType" value={props.tentType || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="Dome">Dome</option>
                                <option value="Swiss">Swiss</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                        </div>
                         <div className="checkbox-group-styled">
                             {['Private Washroom', 'Beds Provided', 'Campfire Access', 'Meals Included'].map(item => (
                                <label key={item} className={`checkbox-card ${props[item] ? 'active' : ''}`}>
                                    <input type="checkbox" name={item} checked={props[item] || false} onChange={handleSpecificChange} hidden />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </>
                );
             case 'farmhouse':
                return (
                     <>
                        <div className="form-row">
                             <div className="form-group">
                                <label>Total Land Area</label>
                                <input type="number" name="landArea" value={props.landArea || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                             <div className="form-group">
                                <label>Max Guests</label>
                                <input type="number" name="maxGuests" value={props.maxGuests || ''} onChange={handleSpecificChange} className="premium-input" />
                            </div>
                        </div>
                          <div className="form-group">
                                <label>Music Allowed Till</label>
                                <input type="time" name="musicTime" value={props.musicTime || ''} onChange={handleSpecificChange} className="premium-input" />
                        </div>
                         <div className="checkbox-group-styled">
                             {['Event Allowed', 'Staff Available'].map(item => (
                                <label key={item} className={`checkbox-card ${props[item] ? 'active' : ''}`}>
                                    <input type="checkbox" name={item} checked={props[item] || false} onChange={handleSpecificChange} hidden />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </>
                );
             case 'hostel':
                return (
                     <>
                        <div className="form-group">
                            <label>Hostel Type</label>
                             <select name="hostelType" value={props.hostelType || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="Boys">Boys</option>
                                <option value="Girls">Girls</option>
                                <option value="Co-living">Co-living</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Sharing</label>
                             <select name="sharing" value={props.sharing || ''} onChange={handleSpecificChange} className="premium-input">
                                <option value="2">2 Sharing</option>
                                <option value="3">3 Sharing</option>
                                <option value="4">4 Sharing</option>
                                <option value="Dorm">Dorm</option>
                            </select>
                        </div>
                        <div className="checkbox-group-styled">
                             {['Mess Facility', 'Study Area', 'Warden Available', 'Laundry Facility'].map(item => (
                                <label key={item} className={`checkbox-card ${props[item] ? 'active' : ''}`}>
                                    <input type="checkbox" name={item} checked={props[item] || false} onChange={handleSpecificChange} hidden />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </>
                );
            default:
                return <p className="text-muted">No specific details required for this category.</p>;
        }
    };

    const renderStepContent = () => {
        switch(currentStep) {
            case 0: // Basic Info
                return (
                    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="form-step-content">
                        <h3>Let's start with the basics</h3>
                        <p className="step-subtitle">Give your property a catchy title and description.</p>
                        
                        <div className="form-group">
                            <label>Property Name</label>
                            <input 
                                name="title" 
                                value={formData.title} 
                                onChange={handleBasicChange} 
                                placeholder="e.g. Luxury Villa with Ocean View" 
                                className="premium-input"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label>Description (Short + Detailed)</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleBasicChange} 
                                rows={5} 
                                placeholder="Describe your property in detail..." 
                                className="premium-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Host Type</label>
                            <div className="select-cards">
                                {['individual', 'professional', 'company'].map(type => (
                                    <div 
                                        key={type}
                                        className={`select-card ${formData.hostType === type ? 'selected' : ''}`}
                                        onClick={() => handleBasicChange({ target: { name: 'hostType', value: type } })}
                                    >
                                        <span className="card-icon">{type === 'individual' ? '👤' : type === 'professional' ? '👔' : '🏢'}</span>
                                        <span className="card-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );
            case 1: // Location
                 return (
                    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="form-step-content">
                        <h3>Where is it located?</h3>
                        <p className="step-subtitle">Guests need to know exactly where to find your stay.</p>
                        
                        <div className="form-group">
                            <label>Full Address</label>
                            <input name="address" value={formData.location.address} onChange={handleLocationChange} className="premium-input" placeholder="House/Flat No, Street, Area" />
                        </div>
                        <div className="form-row">
                             <div className="form-group">
                                <label>City</label>
                                <input name="city" value={formData.location.city} onChange={handleLocationChange} className="premium-input" />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input name="state" value={formData.location.state} onChange={handleLocationChange} className="premium-input" />
                            </div>
                        </div>
                         <div className="form-row">
                              <div className="form-group">
                                <label>Pincode</label>
                                <input name="pincode" value={formData.location.pincode} onChange={handleLocationChange} className="premium-input" />
                            </div>
                             <div className="form-group">
                                <label>Country</label>
                                <input name="country" value={formData.location.country} onChange={handleLocationChange} className="premium-input" />
                            </div>
                        </div>
                        <div className="form-group">
                             <label>Landmark</label>
                             <input name="landmark" value={formData.location.landmark} onChange={handleLocationChange} className="premium-input" placeholder="Near..." />
                        </div>
                        
                        <div className="form-group">
                            <label>Pin Location on Map</label>
                            <p className="text-xs text-gray-400 mb-2">Tap on the map to mark the exact location.</p>
                            <div className="map-container-wrapper" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
                                <MapContainer 
                                    center={[20.5937, 78.9629]} // Default to India center
                                    zoom={4} 
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker 
                                        position={formData.location.lat && formData.location.lng ? [formData.location.lat, formData.location.lng] : null}
                                        setPosition={(lat, lng) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                location: { ...prev.location, lat, lng }
                                            }));
                                        }}
                                    />
                                </MapContainer>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {formData.location.lat && formData.location.lng 
                                    ? `Selected: ${Number(formData.location.lat).toFixed(6)}, ${Number(formData.location.lng).toFixed(6)}`
                                    : 'No location selected'
                                }
                            </div>
                        </div>
                    </motion.div>
                );
            case 2: // Media
                return (
                    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="form-step-content">
                        <h3>Add some photos</h3>
                        <p className="step-subtitle">High quality photos increase your bookings significantly.</p>
                        
                        <div className="image-upload-area premium-upload">
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} id="image-upload" hidden />
                            <label htmlFor="image-upload" className="upload-label">
                                <div className="upload-icon-circle"><FaUpload /></div>
                                <span className="upload-text">Drag & drop photos or <b>Browse</b></span>
                                <span className="upload-subtext">Add at least 5 photos</span>
                            </label>
                        </div>
                        <div className="image-previews premium-previews">
                            <AnimatePresence>
                                {formData.imagePreviews.map((src, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="preview-item"
                                    >
                                        <img src={src} alt="" />
                                        <button onClick={() => removeImage(i)} className="remove-btn"><FaTrash /></button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                         <div className="form-group" style={{marginTop: '20px'}}>
                            <label>Video (Optional)</label>
                            <input type="file" accept="video/*" className="premium-input" onChange={(e) => setFormData(prev => ({...prev, video: e.target.files[0]}))} />
                        </div>
                         <div className="form-group">
                            <label>360° Tour URL (Optional)</label>
                            <input type="url" name="tour360" value={formData.tour360} onChange={(e) => setFormData(prev => ({...prev, tour360: e.target.value}))} className="premium-input" placeholder="https://..." />
                        </div>
                    </motion.div>
                );
            case 3: // Pricing
                return (
                    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="form-step-content">
                        <h3>Set your pricing</h3>
                        <p className="step-subtitle">How much do you want to charge?</p>
                        
                        <div className="price-input-large">
                            <span className="currency-symbol">₹</span>
                            <input 
                                type="number" 
                                name="perNight" 
                                value={formData.pricing.perNight} 
                                onChange={handlePricingChange} 
                                placeholder="0" 
                            />
                            <span className="per-night-label">/ night</span>
                        </div>

                         <div className="form-row">
                             <div className="form-group">
                                <label>Weekly Price (Optional)</label>
                                <input type="number" name="weekly" value={formData.pricing.weekly} onChange={handlePricingChange} className="premium-input" placeholder="₹" />
                            </div>
                             <div className="form-group">
                                <label>Monthly Price (Optional)</label>
                                <input type="number" name="monthly" value={formData.pricing.monthly} onChange={handlePricingChange} className="premium-input" placeholder="₹" />
                            </div>
                        </div>
                        
                        <div className="divider-text"><span>Additional Charges</span></div>

                        <div className="form-row">
                             <div className="form-group">
                                <label>Cleaning Fee</label>
                                <input type="number" name="cleaning" value={formData.pricing.cleaning} onChange={handlePricingChange} className="premium-input" placeholder="₹0" />
                            </div>
                             <div className="form-group">
                                <label>Security Deposit</label>
                                <input type="number" name="securityDeposit" value={formData.pricing.securityDeposit} onChange={handlePricingChange} className="premium-input" placeholder="₹0" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Extra Guest Charge</label>
                                <input type="number" name="extraGuest" value={formData.pricing.extraGuest} onChange={handlePricingChange} className="premium-input" placeholder="₹0" />
                            </div>
                             <div className="form-group">
                                <label>Taxes (GST)</label>
                                <input type="number" name="taxes" value={formData.pricing.taxes} onChange={handlePricingChange} className="premium-input" placeholder="%" />
                            </div>
                        </div>
                    </motion.div>
                );
            case 4: // Specific Details (NOW AT STEP 5)
                return (
                    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="form-step-content">
                         <h3>Property Details</h3>
                         <p className="step-subtitle">Tell us more about the {category.replaceAll('_', ' ')}.</p>
                        {renderSpecificFields()}
                    </motion.div>
                );
            case 5: // Rules
                return (
                    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="form-step-content">
                        <h3>Stay Rules</h3>
                        
                         <div className="form-row">
                             <div className="form-group">
                                <label>Check-in Time</label>
                                <input type="time" name="checkIn" value={formData.rules.checkIn} onChange={handleRulesChange} className="premium-input" />
                            </div>
                            <div className="form-group">
                                <label>Check-out Time</label>
                                <input type="time" name="checkOut" value={formData.rules.checkOut} onChange={handleRulesChange} className="premium-input" />
                            </div>
                        </div>
                         <div className="form-row">
                             <div className="form-group">
                                <label>Min Stay (Nights)</label>
                                <input type="number" name="minStay" value={formData.rules.minStay} onChange={handleRulesChange} className="premium-input" />
                            </div>
                            <div className="form-group">
                                <label>Max Stay (Nights)</label>
                                <input type="number" name="maxStay" value={formData.rules.maxStay} onChange={handleRulesChange} className="premium-input" />
                            </div>
                        </div>
                         <div className="checkbox-group-styled">
                            <label className={`checkbox-card ${formData.rules.instantBooking ? 'active' : ''}`}>
                                <input type="checkbox" name="instantBooking" checked={formData.rules.instantBooking} onChange={handleRulesChange} hidden />
                                <span>⚡ Instant Booking Allowed</span>
                            </label>
                        </div>
                    </motion.div>
                );

            case 6: // Policies
                 return (
                    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="form-step-content">
                        <h3>Policies & House Rules</h3>

                         <div className="form-group">
                            <label>Cancellation Policy</label>
                            <div className="select-cards vertical">
                                {['flexible', 'moderate', 'strict'].map(policy => (
                                    <div 
                                        key={policy}
                                        className={`select-card ${formData.policies.cancellation === policy ? 'selected' : ''}`}
                                        onClick={() => handlePolicyChange({ target: { name: 'cancellation', value: policy } })}
                                    >
                                        <div className="card-content">
                                            <span className="card-title capitalize">{policy}</span>
                                            <span className="card-desc">
                                                {policy === 'flexible' && 'Full refund 1 day prior'}
                                                {policy === 'moderate' && 'Full refund 5 days prior'}
                                                {policy === 'strict' && 'No refund except major issues'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                         <div className="form-group">
                            <label>House Rules (Free Text)</label>
                            <textarea name="houseRules" value={formData.policies.houseRules} onChange={handlePolicyChange} className="premium-input" rows={3} placeholder="No loud music after 10 PM, etc." />
                        </div>

                         <div className="checkbox-group-styled">
                            {['ID Required', 'Smoking Allowed', 'Pets Allowed', 'Events Allowed'].map(item => {
                                const key = item.split(' ')[0].toLowerCase() + (item.includes('Required') ? 'Required' : ''); // sloppy mapping, fixing by manual key map
                                const mapKey = item === 'ID Required' ? 'idRequired' : item === 'Smoking Allowed' ? 'smoking' : item === 'Pets Allowed' ? 'pets' : 'events';
                                
                                return (
                                    <label key={item} className={`checkbox-card ${formData.policies[mapKey] ? 'active' : ''}`}>
                                        <input type="checkbox" name={mapKey} checked={formData.policies[mapKey]} onChange={handlePolicyChange} hidden />
                                        <span>{item}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </motion.div>
                );

             case 7: { // Amenities
                const amenitiesList = [
                    { name: 'Wifi', icon: '📶' },
                    { name: 'AC', icon: '❄️' },
                    { name: 'TV', icon: '📺' },
                    { name: 'Kitchen', icon: '🍳' },
                    { name: 'Washing Machine', icon: '🧺' },
                    { name: 'Pool', icon: '🏊' },
                    { name: 'Gym', icon: '🏋️' },
                    { name: 'Parking', icon: '🅿️' },
                    { name: 'Power Backup', icon: '🔋' },
                    { name: 'Geyser', icon: '🚿' },
                    { name: 'First Aid', icon: '🩹' },
                    { name: 'Workstation', icon: '💻' }
                ];
                return (
                    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="form-step-content">
                        <h3>Amenities</h3>
                        <p className="step-subtitle">What does your place offer?</p>
                        
                        <div className="amenities-grid-premium">
                            {amenitiesList.map(item => (
                                <div 
                                    key={item.name} 
                                    className={`amenity-card ${formData.amenities.includes(item.name) ? 'selected' : ''}`}
                                    onClick={() => toggleAmenity(item.name)}
                                >
                                    <span className="amenity-icon">{item.icon}</span>
                                    <span className="amenity-name">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            }
            default:
                return null;
        }
    };

    return (
        <div className="short-stay-modal-overlay">
            <motion.div 
                className="short-stay-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header with Progress */}
                <div className="modal-header-premium">
                    <div className="header-top">
                        <span className="category-badge">{category.replaceAll('_', ' ')}</span>
                        <button onClick={onClose} className="close-btn"><FaTimes /></button>
                    </div>
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                            />
                        </div>
                        <span className="step-indicator">Step {currentStep + 1} of {STEPS.length}</span>
                    </div>
                </div>

                <div className="modal-body-premium">
                    <AnimatePresence mode="wait">
                        {renderStepContent()}
                    </AnimatePresence>
                </div>

                <div className="modal-footer-premium">
                    <button 
                        disabled={currentStep === 0} 
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="back-btn-premium"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    
                    {currentStep < STEPS.length - 1 ? (
                        <button 
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="next-btn-premium"
                        >
                            Next <FaArrowRight />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading}
                            className="submit-btn-premium"
                        >
                            {loading ? (
                                <span className="loading-spinner-small" />
                            ) : (
                                <>List Property <FaCheck /></>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ShortStayForm;
