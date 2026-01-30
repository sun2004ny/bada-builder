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
        background-color: #1f2937 !important; /* gray-800 */
        color: white !important;
        border: 1px solid #4b5563 !important; /* gray-600 */
        outline: none !important;
        box-shadow: none !important;
    }

    .admin-modal-input:focus {
        border-color: #9ca3af !important; /* gray-400 */
        box-shadow: none !important;
        outline: none !important;
    }

    /* Fix for Select dropdown options */
    .admin-modal-input option {
        background-color: #1f2937 !important;
        color: white !important;
    }

    /* Remove autocomplete background color causing white/blue wash */
    .admin-modal-input:-webkit-autofill,
    .admin-modal-input:-webkit-autofill:hover, 
    .admin-modal-input:-webkit-autofill:focus, 
    .admin-modal-input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #1f2937 inset !important;
        -webkit-text-fill-color: white !important;
    }
`;

const AdminPropertyModal = ({ isOpen, onClose, onSave, property = null, initialSource = 'Individual' }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
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
            amenities: [],
            contactPhone: '',
            completionDate: '',
            towers: '',
            floors: '',
            units: '',
            sold_units: 0,
            total_revenue: 0
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
                metadata: {}
            });
        }
    }, [property, isOpen, initialSource]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // 1. Upload new files if any
            let newImageUrls = [];
            if (selectedFiles.length > 0) {
                console.log(`Uploading ${selectedFiles.length} images...`);
                // Compress and Upload
                newImageUrls = await Promise.all(selectedFiles.map(async (file) => {
                    try {
                        const compressed = await compressImage(file);
                        return await uploadToCloudinary(compressed);
                    } catch (err) {
                        console.error('Upload failed for file', file.name, err);
                        try { return await uploadToCloudinary(file); } catch (retryErr) { return null; }
                    }
                }));
            }

            // Filter out failed uploads
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
                submissionData.project_name = formData.metadata.projectName;
                submissionData.company_name = formData.property_source === 'By Bada Builder' ? 'Bada Builder' : (formData.metadata.ownerName || 'Developer');
                submissionData.possession_status = formData.metadata.possessionStatus;
                submissionData.contact_phone = formData.metadata.contactPhone;

                // Map stats for Developer view
                submissionData.project_stats = {
                    towers: formData.metadata.towers,
                    floors: formData.metadata.floors,
                    units: formData.metadata.units,
                    area: formData.area
                };
            } else {
                // Individual mappings
                submissionData.bathrooms = formData.metadata.bathrooms;
                submissionData.furnishing = formData.metadata.furnishing;
                submissionData.parking = formData.metadata.parking;
            }

            await onSave(submissionData);
            setUploading(false);
            setSelectedFiles([]);

        } catch (error) {
            console.error('Submission error:', error);
            setUploading(false);
            alert('Failed to upload images or save property.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto dark">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <style>{adminModalStyles}</style>

                <div className="inline-block relative z-10 w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {property ? 'Edit Property' : 'Add New Property'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Core Data */}
                            <div className="space-y-6">
                                <div className="p-4 bg-transparent rounded-xl space-y-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                                        <Info className="h-4 w-4 text-blue-500" />
                                        <span>Listing Identity</span>
                                    </h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Luxurious 3BHK Apartment"
                                            className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Type</label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg admin-modal-input"
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                                            <select
                                                name="property_source"
                                                value={formData.property_source}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                                            >
                                                <option value="Individual">Individual</option>
                                                <option value="Developer">Developer</option>
                                                <option value="By Bada Builder">By Bada Builder</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Sections based on Source */}
                                {formData.property_source === 'Individual' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (Total) *</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="price"
                                                        value={formData.price}
                                                        onChange={handleChange}
                                                        placeholder="e.g. 85 Lakh"
                                                        required
                                                        className="w-full pl-10 pr-4 py-2 rounded-lg admin-modal-input"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BHK Type</label>
                                                <select
                                                    name="bhk"
                                                    value={formData.bhk}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                >
                                                    <option value="">Select BHK</option>
                                                    <option value="1 BHK">1 BHK</option>
                                                    <option value="2 BHK">2 BHK</option>
                                                    <option value="3 BHK">3 BHK</option>
                                                    <option value="4 BHK">4 BHK</option>
                                                    <option value="5+ BHK">5+ BHK</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Built-up Area</label>
                                                <input
                                                    type="text"
                                                    name="area"
                                                    value={formData.area}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 1500 sq.ft"
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
                                                <input
                                                    type="number"
                                                    name="metadata.bathrooms"
                                                    value={formData.metadata.bathrooms || ''}
                                                    onChange={handleMetadataChange}
                                                    placeholder="e.g. 2"
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Furnishing</label>
                                                <select
                                                    name="metadata.furnishing"
                                                    value={formData.metadata.furnishing || 'Unfurnished'}
                                                    onChange={handleMetadataChange}
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                >
                                                    <option value="Unfurnished">Unfurnished</option>
                                                    <option value="Semi-Furnished">Semi-Furnished</option>
                                                    <option value="Fully Furnished">Fully Furnished</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parking Availability</label>
                                            <select
                                                name="metadata.parking"
                                                value={formData.metadata.parking || 'No'}
                                                onChange={handleMetadataChange}
                                                className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                            >
                                                <option value="No">No</option>
                                                <option value="Yes (Open)">Yes (Open)</option>
                                                <option value="Yes (Covered)">Yes (Covered)</option>
                                                <option value="Yes (Both)">Yes (Both)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {(formData.property_source === 'Developer' || formData.property_source === 'By Bada Builder') && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                                            <input
                                                type="text"
                                                name="metadata.projectName"
                                                value={formData.metadata.projectName || ''}
                                                onChange={handleMetadataChange}
                                                placeholder="e.g. Green Valley Residency"
                                                required
                                                className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Range *</label>
                                                <input
                                                    type="text"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 50L - 1.2Cr"
                                                    required
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RERA Number</label>
                                                <input
                                                    type="text"
                                                    name="rera_number"
                                                    value={formData.rera_number || ''}
                                                    onChange={handleChange}
                                                    placeholder="Registration No."
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheme Type</label>
                                                <select
                                                    name="metadata.schemeType"
                                                    value={formData.metadata.schemeType || 'Residential'}
                                                    onChange={handleMetadataChange}
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                >
                                                    <option value="Residential">Residential</option>
                                                    <option value="Commercial">Commercial</option>
                                                    <option value="Both">Both</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company/Owner Name</label>
                                                <input
                                                    type="text"
                                                    name="metadata.ownerName"
                                                    value={formData.metadata.ownerName || ''}
                                                    onChange={handleMetadataChange}
                                                    placeholder="e.g. DLF Ltd."
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Possession Status</label>
                                                <select
                                                    name="metadata.possessionStatus"
                                                    value={formData.metadata.possessionStatus || 'Ready to Move'}
                                                    onChange={handleMetadataChange}
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                >
                                                    <option value="Ready to Move">Ready to Move</option>
                                                    <option value="Under Construction">Under Construction</option>
                                                    <option value="Just Launched">Just Launched</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                                                <input
                                                    type="text"
                                                    name="metadata.contactPhone"
                                                    value={formData.metadata.contactPhone || ''}
                                                    onChange={handleMetadataChange}
                                                    maxLength={10}
                                                    placeholder="10-digit number"
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                />
                                            </div>
                                        </div>

                                        {(formData.metadata.possessionStatus === 'Under Construction' || formData.metadata.possessionStatus === 'Just Launched') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Completion</label>
                                                <input
                                                    type="date"
                                                    name="metadata.completionDate"
                                                    value={formData.metadata.completionDate || ''}
                                                    onChange={handleMetadataChange}
                                                    className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                                />
                                            </div>
                                        )}

                                        <div className="p-4 bg-transparent rounded-xl">
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Project Statistics</h5>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Towers</label>
                                                    <input
                                                        type="number"
                                                        name="metadata.towers"
                                                        value={formData.metadata.towers || ''}
                                                        onChange={handleMetadataChange}
                                                        className="w-full px-3 py-1.5 text-sm rounded admin-modal-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Floors</label>
                                                    <input
                                                        type="number"
                                                        name="metadata.floors"
                                                        value={formData.metadata.floors || ''}
                                                        onChange={handleMetadataChange}
                                                        className="w-full px-3 py-1.5 text-sm rounded admin-modal-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Total Units</label>
                                                    <input
                                                        type="number"
                                                        name="metadata.units"
                                                        value={formData.metadata.units || ''}
                                                        onChange={handleMetadataChange}
                                                        className="w-full px-3 py-1.5 text-sm rounded admin-modal-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {formData.property_source === 'By Bada Builder' && (
                                            <div className="grid grid-cols-2 gap-4 p-4 bg-transparent rounded-lg border border-gray-700">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Sold Units</label>
                                                    <input
                                                        type="number"
                                                        name="metadata.sold_units"
                                                        value={formData.metadata.sold_units || 0}
                                                        onChange={handleMetadataChange}
                                                        className="w-full px-4 py-2 rounded admin-modal-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Total Revenue (Cr)</label>
                                                    <input
                                                        type="number"
                                                        name="metadata.total_revenue"
                                                        value={formData.metadata.total_revenue || 0}
                                                        onChange={handleMetadataChange}
                                                        step="0.1"
                                                        className="w-full px-4 py-2 rounded admin-modal-input"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Description *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Vastrapur, Ahmedabad"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg admin-modal-input"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        placeholder="Enter all property details, amenities, and key highlights..."
                                        className="w-full px-4 py-2 rounded-lg admin-modal-input"
                                    />
                                </div>
                            </div>

                            {/* Right Column: Media & Map */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precision Map Location</label>
                                    <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 h-[240px]">
                                        <LocationPicker
                                            onLocationSelect={handleLocationSelect}
                                            initialLat={formData.latitude}
                                            initialLng={formData.longitude}
                                            initialAddress={formData.map_address}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic">Pinning the exact location helps in better visibility and distance calculation.</p>
                                </div>

                                {/* Image Gallery */}
                                {/* Image Gallery Cloudinary Upload */}
                                <div className="p-4 bg-transparent rounded-xl space-y-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />
                                            <span>Gallery Images</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formData.images.filter(i => i).length + selectedFiles.length} selected
                                        </span>
                                    </label>

                                    {/* File Input */}
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="gallery-upload"
                                        />
                                        <label
                                            htmlFor="gallery-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-800/50 transition-colors"
                                        >
                                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Click to upload images</span>
                                        </label>
                                    </div>

                                    {/* Preview Grid */}
                                    <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {/* Existing URLs */}
                                        {formData.images.filter(img => img && img.trim() !== '').map((img, idx) => (
                                            <div key={`exist-${idx}`} className="relative aspect-square rounded-lg overflow-hidden group">
                                                <img src={img} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] px-1 py-0.5 truncate">
                                                    Existing
                                                </div>
                                            </div>
                                        ))}

                                        {/* New Selected Files */}
                                        {selectedFiles.map((file, idx) => (
                                            <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden group">
                                                <img src={URL.createObjectURL(file)} alt={`New ${idx}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                                <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white text-[8px] px-1 py-0.5 truncate">
                                                    New
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500">Images will be uploaded to Cloudinary on save.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                {uploading ? 'Uploading & Saving...' : (property ? 'Update Property' : 'Create Property')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminPropertyModal;
