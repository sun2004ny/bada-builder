import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Admin.css';

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

const PostProperty = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editingProperty = location.state?.editProperty;

    // Initialize form with editing data or defaults
    const [images, setImages] = useState([]);

    // We need to track existing image URLs separately if editing
    const [existingImageUrls, setExistingImageUrls] = useState(editingProperty?.images || (editingProperty?.imageUrl ? [editingProperty.imageUrl] : []));

    const [uploading, setUploading] = useState(false);

    // Exact fields matching Live Grouping Card Structure
    const [formData, setFormData] = useState({
        listingGroup: editingProperty ? (location.state?.type === 'bada' ? 'By Bada Builder' : 'Live Grouping') : 'Live Grouping',

        // Header Info
        title: editingProperty?.title || '',

        // Builder & Location
        developer: editingProperty?.developer || '',
        location: editingProperty?.location || '',
        city: editingProperty?.city || '',

        // Specs
        type: editingProperty?.type || '', // e.g. "3 BHK Apartment"
        category: editingProperty?.category || 'Flat', // Internal categorization

        // Progress / Slots
        totalSlots: editingProperty?.totalSlots || 20,
        filledSlots: editingProperty?.filledSlots || 0,
        minBuyers: editingProperty?.minBuyers || 5, // "Min: 15"

        // Pricing
        pricePerSqFt: editingProperty?.pricePerSqFt || '', // "Regular Price"
        discount: editingProperty?.discount || '', // "9% OFF"

        // Misc
        timeLeft: editingProperty?.timeLeft || '', // "2 Days 5 Hours"

        // Benefits
        benefits: editingProperty?.benefits ? (Array.isArray(editingProperty.benefits) ? editingProperty.benefits.join('\n') : editingProperty.benefits) : '',

        // Description (Extra details)
        description: editingProperty?.description || ''
    });

    const [notification, setNotification] = useState({ message: '', type: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (images.length === 0 && existingImageUrls.length === 0) {
            setNotification({ message: 'Please upload at least one image', type: 'error' });
            return;
        }

        setUploading(true);

        try {
            // 1. Upload new images
            const newImageUrls = await Promise.all(
                images.map(image => uploadToCloudinary(image))
            );

            // 2. Combine images
            const finalImageUrls = [...existingImageUrls, ...newImageUrls];

            // 3. Process Benefits (Split by newline)
            const benefitsArray = formData.benefits.split('\n').filter(line => line.trim() !== '');

            // 4. Construct Property Data Object
            const propertyData = {
                id: editingProperty ? editingProperty.id : Date.now(), // STRICT: Keep ID if editing
                ...formData,
                benefits: benefitsArray,
                images: finalImageUrls,
                imageUrl: finalImageUrls[0], // Main Display Fallback
                createdAt: editingProperty ? editingProperty.createdAt : new Date().toISOString(),
                status: editingProperty ? editingProperty.status : 'active',

                // Ensure numeric values for calculations
                pricePerSqFt: Number(formData.pricePerSqFt),
                // Backwards compatibility
                price: `₹${formData.pricePerSqFt}/sq ft`,
            };

            const storageKey = formData.listingGroup === 'Live Grouping' ? 'liveGroupingProperties' : 'badaBuilderProperties';
            const existingProps = JSON.parse(localStorage.getItem(storageKey) || '[]');

            let updatedList;

            if (editingProperty) {
                // EDIT MODE: Update in place
                const index = existingProps.findIndex(p => p.id === editingProperty.id);
                if (index !== -1) {
                    updatedList = [...existingProps];
                    updatedList[index] = propertyData; // STRICT: Replace at original index
                } else {
                    updatedList = [propertyData, ...existingProps];
                }
            } else {
                // CREATE MODE: Prepend
                updatedList = [propertyData, ...existingProps];
            }

            localStorage.setItem(storageKey, JSON.stringify(updatedList));

            setNotification({
                message: editingProperty ? 'Property Updated Successfully!' : 'Property Posted Successfully!',
                type: 'success'
            });

            if (editingProperty) {
                setTimeout(() => navigate('/admin-panel/manage-properties'), 1500);
            } else {
                // Reset form
                setFormData({
                    listingGroup: 'Live Grouping',
                    title: '',
                    developer: '',
                    location: '',
                    city: '',
                    type: '',
                    category: 'Flat',
                    totalSlots: 20,
                    filledSlots: 0,
                    minBuyers: 5,
                    pricePerSqFt: '',
                    discount: '',
                    timeLeft: '',
                    benefits: '',
                    description: ''
                });
                setImages([]);
                setExistingImageUrls([]);
                setTimeout(() => setNotification({ message: '', type: '' }), 3000);
            }

        } catch (error) {
            console.error(error);
            setNotification({ message: 'Error: ' + error.message, type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-content-wrapper">
            <div className="admin-header">
                <h1>{editingProperty ? 'Edit Property' : 'Post New Property'}</h1>
                <p>{editingProperty ? 'Update details below' : 'Fill in the details exactly as they appear in the card'}</p>
            </div>

            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="admin-form">
                {/* 1. Group Selection */}
                <div className="form-group full-width" style={{ marginBottom: '30px' }}>
                    <label>Listing Group</label>
                    <select
                        name="listingGroup"
                        value={formData.listingGroup}
                        onChange={handleChange}
                        className="form-control highlight-input"
                        disabled={!!editingProperty}
                    >
                        <option value="Live Grouping">🔴 Live Grouping</option>
                        <option value="By Bada Builder">🔵 By Bada Builder</option>
                    </select>
                </div>

                <div className="form-grid">
                    {/* 2. Image (Top of Card) */}
                    <div className="form-group full-width">
                        <label>Property Images (Header Image)</label>
                        <div className="image-upload-container">
                            <input
                                type="file"
                                id="property-images"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input"
                            />
                            <label htmlFor="property-images" className="file-upload-label">
                                <span>📤 Upload Images</span>
                            </label>
                        </div>
                        {/* Image Previews */}
                        {(existingImageUrls.length > 0 || images.length > 0) && (
                            <div className="image-previews">
                                {existingImageUrls.map((url, i) => (
                                    <div key={`exist-${i}`} className="image-preview-card">
                                        <img src={url} alt="Existing" />
                                        <button type="button" className="remove-image-btn" onClick={() => handleRemoveExistingImage(i)}>×</button>
                                    </div>
                                ))}
                                {images.map((file, i) => (
                                    <div key={`new-${i}`} className="image-preview-card">
                                        <img src={URL.createObjectURL(file)} alt="New" />
                                        <button type="button" className="remove-image-btn" onClick={() => handleRemoveImage(i)}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. Title */}
                    <div className="form-group full-width">
                        <label>Property Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Skyline Towers - Group Buy"
                            className="form-control"
                            required
                        />
                    </div>

                    {/* 4. Developer & Location */}
                    <div className="form-group">
                        <label>Developer Name</label>
                        <input
                            type="text"
                            name="developer"
                            value={formData.developer}
                            onChange={handleChange}
                            placeholder="e.g. Shree Balaji Builders"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Waghodia Road, Vadodara"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="e.g. Vadodara"
                            className="form-control"
                        />
                    </div>

                    {/* 5. Type (Configuration) */}
                    <div className="form-group">
                        <label>Property Type (Label)</label>
                        <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            placeholder="e.g. 3 BHK Apartment"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Category (Filter)</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="form-control">
                            <option value="Flat">Flat / Apartment</option>
                            <option value="Plot">Plot / Land</option>
                            <option value="Villa">Villa / Bungalow</option>
                            <option value="Commercial">Commercial</option>
                        </select>
                    </div>

                    {/* 6. Slots Status */}
                    <div className="form-group">
                        <label>Filled Slots (Current)</label>
                        <input type="number" name="filledSlots" value={formData.filledSlots} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Total Slots (Target)</label>
                        <input type="number" name="totalSlots" value={formData.totalSlots} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Min Buyers to Activate</label>
                        <input type="number" name="minBuyers" value={formData.minBuyers} onChange={handleChange} className="form-control" />
                    </div>

                    {/* 7. Pricing */}
                    <div className="form-group">
                        <label>Regular Price (per sq ft)</label>
                        <input
                            type="number"
                            name="pricePerSqFt"
                            value={formData.pricePerSqFt}
                            onChange={handleChange}
                            placeholder="e.g. 5172"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Discount Text</label>
                        <input
                            type="text"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            placeholder="e.g. 9% OFF"
                            className="form-control"
                            required
                        />
                    </div>

                    {/* 8. Time Left */}
                    <div className="form-group">
                        <label>Time Left</label>
                        <input
                            type="text"
                            name="timeLeft"
                            value={formData.timeLeft}
                            onChange={handleChange}
                            placeholder="e.g. 2 Days 5 Hours"
                            className="form-control"
                        />
                    </div>

                    {/* 9. Benefits */}
                    <div className="form-group full-width">
                        <label>Group Benefits (One per line)</label>
                        <textarea
                            name="benefits"
                            value={formData.benefits}
                            onChange={handleChange}
                            rows="4"
                            className="form-control"
                            placeholder="Free Modular Kitchen&#10;2 Years Maintenance Free&#10;Premium Flooring"
                        ></textarea>
                    </div>

                    {/* 10. Description */}
                    <div className="form-group full-width">
                        <label>Additional Description (Optional)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="form-control"></textarea>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={uploading}>
                        {uploading ? 'Uploading...' : (editingProperty ? 'Update Property' : 'Post Property')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostProperty;
