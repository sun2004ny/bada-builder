import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Building, Star, Users, MapPin, DollarSign, Calendar, Info, Upload } from 'lucide-react';
import LocationPicker from '../../components/Map/LocationPicker';
import { compressImage } from '../../utils/imageCompressor';

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = "dooamkdih";
const CLOUDINARY_UPLOAD_PRESET = "property_images";

const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw error;
    }
};


const adminModalStyles = `
    .admin-modal-input {
        background-color: transparent !important;
        color: white !important; /* Force white text for visibility on dark bg */
        border: 1px solid rgba(156, 163, 175, 0.3) !important;
        outline: none !important;
        box-shadow: none !important;
        transition: all 0.2s ease;
    }

    .admin-modal-input:focus {
        border-color: #3b82f6 !important; /* blue-500 */
        box-shadow: 0 0 0 1px #3b82f6 !important;
        background-color: rgba(59, 130, 246, 0.05) !important;
    }

    /* Fix for Select dropdown options */
    .admin-modal-input option {
        background-color: #1f2937 !important; /* Forces dark background for options since modal is dark */
        color: white !important;
    }

    /* Remove autocomplete background color causing white/blue/grey wash - EXTREMELY AGGRESSIVE */
    .admin-modal-input:-webkit-autofill,
    .admin-modal-input:-webkit-autofill:hover, 
    .admin-modal-input:-webkit-autofill:focus, 
    .admin-modal-input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px #1f2937 inset !important; /* Match your dark theme background */
        -webkit-text-fill-color: white !important;
        transition: background-color 5000s ease-in-out 0s;
    }

    /* Placeholder style */
    .admin-modal-input::placeholder {
        color: rgba(156, 163, 175, 0.5) !important;
    }
`;

const AdminPropertyModal = ({ isOpen, onClose, onSave, property = null, initialSource = 'By Bada Builder' }) => {
    const [activeLayout, setActiveLayout] = useState('Form A');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        title: '',
        type: 'Apartment',
        property_source: initialSource,
        location: '',
        price: '',
        bhk: '',
        area: '',
        description: '',
        facilities: [''],
        images: [''],
        status: 'active',
        is_featured: false,
        rera_number: '',
        latitude: null,
        longitude: null,
        map_address: '',
        // Developer Specific
        metadata: {
            projectName: '',
            ownerName: '',
            schemeType: 'Residential',
            possessionStatus: 'Ready to Move',
            amenities: '', // Changed to string for comma-separated
            contactPhone: '',
            contactEmail: '', // Added Email
            completionDate: '',
            towers: '',
            floors: '',
            units: '',
            sold_units: 0,
            total_revenue: 0,
            bathrooms: '',
            furnishing: 'Unfurnished',
            priceUnit: 'Lakh',
            areaUnit: 'sq.ft'
        }
    });

    useEffect(() => {
        if (property) {
            setFormData({
                ...property,
                facilities: property.facilities?.length ? property.facilities : [''],
                images: property.images?.length ? property.images : [''],
                metadata: property.metadata || {}
            });
        } else {
            setFormData({
                title: '',
                type: 'Apartment',
                property_source: initialSource,
                location: '',
                price: '',
                bhk: '',
                area: '',
                description: '',
                facilities: [''],
                images: [''],
                status: 'active',
                is_featured: false,
                rera_number: '',
                latitude: null,
                longitude: null,
                map_address: '',
                metadata: {
                    amenities: '',
                    contactEmail: '',
                    bathrooms: '',
                    furnishing: 'Unfurnished',
                    priceUnit: 'Lakh',
                    areaUnit: 'sq.ft'
                }
            });
        }
    }, [property, isOpen, initialSource]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setIsDirty(true);
        if (name.startsWith('metadata.')) {
            const metaKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                metadata: { ...prev.metadata, [metaKey]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleLocationSelect = (loc) => {
        setFormData(prev => ({
            ...prev,
            latitude: loc.lat,
            longitude: loc.lng,
            map_address: loc.address
        }));
    };

    const handleMetadataChange = (e) => {
        const { name, value } = e.target;
        const metaKey = name.includes('.') ? name.split('.')[1] : name;
        setFormData(prev => ({
            ...prev,
            metadata: { ...prev.metadata, [metaKey]: value }
        }));
    };

    const handleArrayChange = (index, value, field) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayItem = (index, field) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArray.length ? newArray : [''] });
    };

    // --- File Handling Logic ---
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.location) newErrors.location = 'Location description is required';
        if (!formData.description) newErrors.description = 'Detailed description is required';
        if (!formData.price) newErrors.price = 'Price is required';

        // Removed Project Name requirement as per user request to use Title instead

        if (formData.images.filter(img => img).length === 0 && selectedFiles.length === 0) {
            newErrors.images = 'At least one image is required';
        }

        setErrors(newErrors);
        return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { isValid, errors: validationErrors } = validateForm();
        if (!isValid) {
            const firstError = Object.values(validationErrors)[0] || 'Check the form for highlighted fields.';
            alert(`Validation Error: ${firstError}`);
            return;
        }

        setUploading(true);
        try {
            // 1. Upload new files if any
            let newImageUrls = [];
            if (selectedFiles.length > 0) {
                newImageUrls = await Promise.all(selectedFiles.map(async (file) => {
                    try {
                        const compressed = await compressImage(file);
                        return await uploadToCloudinary(compressed);
                    } catch (err) {
                        console.error('Upload failed for file', file.name, err);
                        return null;
                    }
                }));
            }
            const successfulUrls = newImageUrls.filter(url => url !== null);

            // 2. Combine with existing URLs
            const existingUrls = formData.images.filter(img => img && img.trim() !== '');
            const finalImages = [...existingUrls, ...successfulUrls];

            // 3. Prepare Submission Data
            const submissionData = {
                ...formData,
                facilities: formData.facilities.filter(f => f.trim() !== ''),
                images: finalImages
            };

            // Sync metadata fields to root for card compatibility
            if (formData.property_source === 'Developer' || formData.property_source === 'By Bada Builder') {
                submissionData.project_name = formData.metadata.projectName || formData.title;
                submissionData.company_name = formData.property_source === 'By Bada Builder' ? 'Bada Builder' : (formData.metadata.ownerName || 'Developer');
                submissionData.possession_status = formData.metadata.possessionStatus;
                submissionData.contact_phone = formData.metadata.contactPhone;
                submissionData.contact_email = formData.metadata.contactEmail; // Added Email

                // Map stats for Developer view
                submissionData.project_stats = {
                    towers: formData.metadata.towers,
                    floors: formData.metadata.floors,
                    units: formData.metadata.units,
                    area: formData.area,
                    bathrooms: formData.metadata.bathrooms,
                    furnishing: formData.metadata.furnishing
                };
            } else {
                // Individual mappings
                submissionData.bathrooms = formData.metadata.bathrooms;
                submissionData.furnishing = formData.metadata.furnishing;
                submissionData.parking = formData.metadata.parking;
            }

            await onSave(submissionData);
            setIsDirty(false);
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to upload images or save property.');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto dark">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <style>{adminModalStyles}</style>

                <div className="inline-block relative z-10 w-full max-w-5xl overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700">
                    {/* Header: Fixed/Sticky area */}
                    <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {property ? 'Edit Property' : 'Add New Property'}
                            </h3>
                            <div className="h-6 w-[1px] bg-gray-300 dark:bg-gray-600 hidden md:block" />
                            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveLayout('Form A')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeLayout === 'Form A' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                >
                                    Form A
                                </button>
                                <button
                                    onClick={() => setActiveLayout('Form B')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeLayout === 'Form B' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                >
                                    Form B
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="flex-1 md:flex-initial">
                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
                                    By Bada Builder
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    if (isDirty) {
                                        if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
                                            onClose();
                                        }
                                    } else {
                                        onClose();
                                    }
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Main Form Content Area (LHS + RHS) */}
                            {activeLayout === 'Form A' ? (
                                <>
                                    <div className="lg:col-span-7 space-y-6">
                                        {/* Property Title */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1 ml-4">Property Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 3BHK Apartment near Airport"
                                                    required
                                                    className="w-full px-4 py-2 text-xl font-bold bg-transparent text-white border-b border-gray-100 dark:border-gray-700 focus:border-blue-500 outline-none transition-colors admin-modal-input"
                                                />
                                            </div>
                                        </div>

                                        {/* Location (City, Area) */}
                                        <div className="flex items-center space-x-2 p-2 bg-transparent border border-gray-100 dark:border-gray-700 rounded-lg admin-modal-input">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="Location (City, Area)"
                                                required
                                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-white admin-modal-input"
                                            />
                                        </div>

                                        {/* Property Type & Furnishing */}
                                        <div className="grid grid-cols-2 gap-6 pt-2">
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Property Type</label>
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 text-white admin-modal-input"
                                                >
                                                    <option value="Apartment">Apartment</option>
                                                    <option value="Villa">Villa</option>
                                                    <option value="Independent House">Independent House</option>
                                                    <option value="Plot">Plot</option>
                                                    <option value="Commercial">Commercial</option>
                                                    <option value="Bungalow">Bungalow</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Furnishing Status</label>
                                                <select
                                                    name="metadata.furnishing"
                                                    value={formData.metadata.furnishing || 'Unfurnished'}
                                                    onChange={handleMetadataChange}
                                                    className="w-full px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 text-white admin-modal-input"
                                                >
                                                    <option value="Unfurnished">Unfurnished</option>
                                                    <option value="Semi-Furnished">Semi-Furnished</option>
                                                    <option value="Fully Furnished">Fully Furnished</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Boxed Quick Stats Layout (12-column grid) */}
                                        <div className="grid grid-cols-12 gap-4 pt-4">
                                            {/* Investment / Price Box (Large) */}
                                            <div className="col-span-6 p-4 rounded-xl space-y-4 admin-modal-input">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Investment / Price</label>
                                                    <div className="flex items-center space-x-1">
                                                        <input
                                                            type="text"
                                                            name="price"
                                                            value={formData.price}
                                                            onChange={handleChange}
                                                            placeholder="Price"
                                                            className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 focus:border-blue-500 outline-none text-sm font-bold admin-modal-input"
                                                        />
                                                        <select
                                                            name="metadata.priceUnit"
                                                            value={formData.metadata.priceUnit || 'Lakh'}
                                                            onChange={handleMetadataChange}
                                                            className="bg-transparent text-[10px] font-bold text-blue-500 outline-none admin-modal-input"
                                                        >
                                                            <option value="Lakh">Lakh</option>
                                                            <option value="Cr">Cr</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Built-up Area</label>
                                                    <div className="flex items-center space-x-1">
                                                        <input
                                                            type="text"
                                                            name="area"
                                                            value={formData.area}
                                                            onChange={handleChange}
                                                            placeholder="Area"
                                                            className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 focus:border-blue-500 outline-none text-sm font-bold admin-modal-input"
                                                        />
                                                        <select
                                                            name="metadata.areaUnit"
                                                            value={formData.metadata.areaUnit || 'sq.ft'}
                                                            onChange={handleMetadataChange}
                                                            className="bg-transparent text-[10px] font-bold text-blue-500 outline-none admin-modal-input"
                                                        >
                                                            <option value="sq.ft">sq.ft</option>
                                                            <option value="sq.yd">sq.yd</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bedrooms Box */}
                                            <div className="col-span-3 flex flex-col items-center justify-center p-4 rounded-xl text-center admin-modal-input">
                                                <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-4 h-8">Bedrooms (BHK)</label>
                                                <input
                                                    type="text"
                                                    name="bhk"
                                                    value={formData.bhk}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 3"
                                                    className="w-full text-center text-lg font-bold bg-transparent border border-gray-100 dark:border-gray-700 rounded-lg p-1 outline-none text-white focus:border-blue-500 admin-modal-input"
                                                />
                                            </div>

                                            {/* Bathrooms Box */}
                                            <div className="col-span-3 flex flex-col items-center justify-center p-4 rounded-xl text-center admin-modal-input">
                                                <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-4 h-8">Bathrooms</label>
                                                <input
                                                    type="text"
                                                    name="metadata.bathrooms"
                                                    value={formData.metadata.bathrooms || ''}
                                                    onChange={handleMetadataChange}
                                                    placeholder="e.g. 2"
                                                    className="w-full text-center text-lg font-bold bg-transparent border border-gray-100 dark:border-gray-700 rounded-lg p-1 outline-none text-white focus:border-blue-500 admin-modal-input"
                                                />
                                            </div>
                                        </div>

                                        {/* Details & About Property */}
                                        <div className="grid grid-cols-2 gap-6 pt-6">
                                            <div className="space-y-4">
                                                <h4 className="text-2xl font-bold bg-blue-600 dark:bg-blue-600 text-white px-3 py-1 rounded-sm border-l-4 border-blue-400 w-fit">Details</h4>
                                                <div className="p-4 rounded-xl admin-modal-input shadow-sm">
                                                    <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-2">Amenities / Facilities (Comma Separated)</label>
                                                    <textarea
                                                        name="metadata.amenities"
                                                        value={formData.metadata.amenities || ''}
                                                        onChange={handleMetadataChange}
                                                        placeholder="Eg. Pool, Gym, Club House, 24x7 Security..."
                                                        rows={3}
                                                        className="w-full bg-transparent border border-gray-100 dark:border-gray-700 rounded-lg p-3 text-sm focus:border-blue-500 transition-colors text-white admin-modal-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-2xl font-bold bg-blue-600 dark:bg-blue-600 text-white px-3 py-1 rounded-sm border-l-4 border-blue-400 w-fit">About Property</h4>
                                                <div className="p-4 rounded-xl admin-modal-input shadow-sm">
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        placeholder="Write a detailed description of the property/project here..."
                                                        rows={6}
                                                        className="w-full bg-transparent outline-none text-sm text-gray-200 admin-modal-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div className="pt-8 pb-4 space-y-4">
                                            <h4 className="text-2xl font-bold bg-blue-600 dark:bg-blue-600 text-white px-3 py-1 rounded-sm border-l-4 border-blue-400 w-fit">Contact Information</h4>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-6 px-4 pt-2">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Owner Name</label>
                                                    <input
                                                        type="text"
                                                        name="metadata.ownerName"
                                                        value={formData.metadata.ownerName || ''}
                                                        onChange={handleMetadataChange}
                                                        placeholder="Your Name"
                                                        className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 p-2 text-lg font-bold outline-none focus:border-blue-500 transition-colors text-white admin-modal-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Phone Number *</label>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">+91</span>
                                                        <input
                                                            type="text"
                                                            name="metadata.contactPhone"
                                                            value={formData.metadata.contactPhone || ''}
                                                            onChange={handleMetadataChange}
                                                            placeholder="10-digit number"
                                                            className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 p-2 text-lg font-bold outline-none focus:border-blue-500 transition-colors text-white admin-modal-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Email Address</label>
                                                    <input
                                                        type="email"
                                                        name="metadata.contactEmail"
                                                        value={formData.metadata.contactEmail || ''}
                                                        onChange={handleMetadataChange}
                                                        placeholder="name@example.com"
                                                        className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 p-2 text-sm outline-none admin-modal-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Left Column: Form B Design */}
                                    <div className="lg:col-span-7 space-y-8">
                                        <div className="space-y-6">
                                            {/* Listing Identity Section */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-blue-400 flex items-center space-x-2 uppercase tracking-wider">
                                                    <Info className="h-4 w-4" />
                                                    <span>Listing Identity</span>
                                                </h4>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">Title *</label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1">Property Type</label>
                                                        <select
                                                            name="type"
                                                            value={formData.type}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                        >
                                                            <option value="Apartment">Apartment</option>
                                                            <option value="Villa">Villa</option>
                                                            <option value="Independent House">Independent House</option>
                                                            <option value="Plot">Plot</option>
                                                            <option value="Commercial">Commercial</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Project Details */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">Project Name *</label>
                                                    <input
                                                        type="text"
                                                        name="metadata.projectName"
                                                        value={formData.metadata.projectName || ''}
                                                        onChange={handleMetadataChange}
                                                        className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1">Price Range *</label>
                                                        <input
                                                            type="text"
                                                            name="price"
                                                            value={formData.price}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1">RERA Number</label>
                                                        <input
                                                            type="text"
                                                            name="rera_number"
                                                            value={formData.rera_number || ''}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1">Scheme Type</label>
                                                        <select
                                                            name="metadata.schemeType"
                                                            value={formData.metadata.schemeType || 'Residential'}
                                                            onChange={handleMetadataChange}
                                                            className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                        >
                                                            <option value="Residential">Residential</option>
                                                            <option value="Commercial">Commercial</option>
                                                            <option value="Both">Both</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1">Company/Owner Name</label>
                                                        <input
                                                            type="text"
                                                            name="metadata.ownerName"
                                                            value={formData.metadata.ownerName || ''}
                                                            onChange={handleMetadataChange}
                                                            className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1">Possession Status</label>
                                                        <select
                                                            name="metadata.possessionStatus"
                                                            value={formData.metadata.possessionStatus || 'Ready to Move'}
                                                            onChange={handleMetadataChange}
                                                            className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                        >
                                                            <option value="Ready to Move">Ready to Move</option>
                                                            <option value="Under Construction">Under Construction</option>
                                                            <option value="Just Launched">Just Launched</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1">Contact Phone</label>
                                                        <input
                                                            type="text"
                                                            name="metadata.contactPhone"
                                                            value={formData.metadata.contactPhone || ''}
                                                            onChange={handleMetadataChange}
                                                            className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Project Statistics (Form B style) */}
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Project Statistics</h5>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Towers</label>
                                                        <input
                                                            type="number"
                                                            name="metadata.towers"
                                                            value={formData.metadata.towers || ''}
                                                            onChange={handleMetadataChange}
                                                            className="w-full px-3 py-2 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Floors</label>
                                                        <input
                                                            type="number"
                                                            name="metadata.floors"
                                                            value={formData.metadata.floors || ''}
                                                            onChange={handleMetadataChange}
                                                            className="w-full px-3 py-2 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Total Units</label>
                                                        <input
                                                            type="number"
                                                            name="metadata.units"
                                                            value={formData.metadata.units || ''}
                                                            onChange={handleMetadataChange}
                                                            className="w-full px-3 py-2 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-700/50">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Sold Units</label>
                                                        <input
                                                            type="number"
                                                            name="metadata.sold_units"
                                                            value={formData.metadata.sold_units || 0}
                                                            onChange={handleMetadataChange}
                                                            className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Total Revenue (Cr)</label>
                                                        <input
                                                            type="number"
                                                            name="metadata.total_revenue"
                                                            value={formData.metadata.total_revenue || 0}
                                                            onChange={handleMetadataChange}
                                                            step="0.1"
                                                            className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Descriptions */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">Location Description *</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                        <input
                                                            type="text"
                                                            name="location"
                                                            value={formData.location}
                                                            onChange={handleChange}
                                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg admin-modal-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">Detailed Description *</label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        rows={4}
                                                        className="w-full px-4 py-2.5 rounded-lg admin-modal-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Shared Right Column: Map & Media (Always stays mounted for performance) */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Precision Map Location Card */}
                                <div className="p-5 bg-gray-900/20 rounded-2xl border border-gray-700/50 space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precision Map Location</h4>
                                    <div className="rounded-xl overflow-hidden border border-gray-700 h-[280px] shadow-inner">
                                        <LocationPicker
                                            onLocationSelect={handleLocationSelect}
                                            initialLat={formData.latitude}
                                            initialLng={formData.longitude}
                                            initialAddress={formData.map_address}
                                        />
                                    </div>
                                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                        <p className="text-xs text-gray-400 flex items-center">
                                            <MapPin className="h-3 w-3 mr-2 text-blue-500" />
                                            <span className="truncate">{formData.map_address || 'No location selected'}</span>
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic text-center px-4">
                                        Pinning the exact location helps in better visibility and distance calculation.
                                    </p>
                                </div>

                                {/* Image Gallery Card */}
                                <div className="p-5 bg-gray-900/20 rounded-2xl border border-gray-700/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                            <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />
                                            <span>Gallery Images</span>
                                        </h4>
                                        <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                                            {formData.images.filter(i => i).length + selectedFiles.length} selected
                                        </span>
                                    </div>

                                    {/* Upload Trigger */}
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="gallery-upload-v2"
                                        />
                                        <label
                                            htmlFor="gallery-upload-v2"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300"
                                        >
                                            <Upload className="h-10 w-10 text-gray-500 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-400 group-hover:text-blue-400">Click to upload images</span>
                                        </label>
                                    </div>

                                    {/* Preview Grid */}
                                    <div className="grid grid-cols-4 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                        {/* Existing URLs */}
                                        {formData.images.filter(img => img && img.trim() !== '').map((img, idx) => (
                                            <div key={`exist-${idx}`} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-700 shadow-lg">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* New Selected Files */}
                                        {selectedFiles.map((file, idx) => (
                                            <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden group border border-blue-500/50 shadow-lg">
                                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-blue-600/20 pointer-events-none" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500 text-center font-medium">first image will be the cover image</p>
                                </div>
                            </div>
                        </div>

                        {/* Unified Submission Area */}
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pt-8 border-t border-gray-700/50 mt-8">
                            <div className="flex items-center space-x-2 text-gray-500 text-sm">
                                <Info className="h-4 w-4" />
                                <span>All fields are synchronized in real-time across layouts.</span>
                            </div>
                            <div className="flex items-center space-x-3 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 md:flex-initial px-8 py-3 rounded-xl border border-gray-600 text-gray-300 font-bold hover:bg-gray-700 hover:text-white transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 md:flex-initial px-10 py-3 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center space-x-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>{property ? 'Update Property' : 'Create Property'}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default AdminPropertyModal;
