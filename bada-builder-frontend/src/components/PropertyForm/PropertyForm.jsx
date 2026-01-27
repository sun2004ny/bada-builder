import React from 'react';
import { motion } from 'framer-motion';
import LocationPicker from '../Map/LocationPicker';

const PropertyForm = ({
    formData,
    handleChange,
    handleImageChange,
    imagePreview,
    extraPreviews,
    handleExtraImagesChange,
    removeExtraImage,
    handleSubmit,
    loading,
    userType,
    showBhkType,
    editingProperty,
    disabled,
    handleLocationSelect
}) => {
    console.log('PropertyForm Props:', { disabled, loading, userType, formData });
    return (
        <form onSubmit={handleSubmit} className="property-form">
            <div className="form-section">
                <div className="form-group">
                    <label htmlFor="title">Property Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Beautiful 3BHK Apartment in Downtown"
                        required
                        disabled={disabled}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="type">Property Type *</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            disabled={disabled}
                        >
                            <option value="">Select Type</option>
                            <option value="Flat/Apartment">Flat/Apartment</option>
                            <option value="Independent House/Villa">Independent House/Villa</option>
                            <option value="Plot/Land">Plot/Land</option>
                            <option value="Commercial Shop">Commercial Shop</option>
                            <option value="Office Space">Office Space</option>
                            <option value="Warehouses/Godowns">Warehouses/Godowns</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="premium-input-group">
                            <label className="premium-label">INVESTMENT / PRICE *</label>
                            <div className="underlined-combined-input">
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="e.g. 75"
                                    required
                                    disabled={disabled}
                                />
                                <select
                                    name="priceUnit"
                                    value={formData.priceUnit}
                                    onChange={handleChange}
                                    disabled={disabled}
                                    className="underlined-unit-select"
                                >
                                    <option value="Lakh">Lakh</option>
                                    <option value="Crore">Crore</option>
                                </select>
                            </div>
                        </div>
                        <div className="premium-input-group">
                            <label className="premium-label">BUILT-UP AREA</label>
                            <div className="underlined-combined-input">
                                <input
                                    type="number"
                                    id="area"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    placeholder="e.g. 1500"
                                    disabled={disabled}
                                />
                                <select
                                    name="areaUnit"
                                    value={formData.areaUnit}
                                    onChange={handleChange}
                                    disabled={disabled}
                                    className="underlined-unit-select"
                                >
                                    <option value="sq.ft">sq.ft</option>
                                    <option value="sq.m">sq.m</option>
                                    <option value="sq.yd">sq.yd</option>
                                    <option value="acre">acre</option>
                                    <option value="bigha">bigha</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {showBhkType && (
                    <div className="form-group">
                        <label htmlFor="bhk">BHK Type *</label>
                        <select
                            id="bhk"
                            name="bhk"
                            value={formData.bhk}
                            onChange={handleChange}
                            required
                            disabled={disabled}
                        >
                            <option value="">Select BHK</option>
                            <option value="1 BHK">1 BHK</option>
                            <option value="2 BHK">2 BHK</option>
                            <option value="3 BHK">3 BHK</option>
                            <option value="4 BHK">4 BHK</option>
                            <option value="4+ BHK">4+ BHK</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="form-section">
                <div className="form-group">
                    <label htmlFor="location">Location (City, Area) *</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Mumbai, Andheri West"
                        required
                        disabled={disabled}
                    />
                </div>

                {/* Location Map Picker */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label>Pin Precise Location on Map</label>
                    <LocationPicker 
                        onLocationSelect={handleLocationSelect}
                        initialLat={formData.latitude}
                        initialLng={formData.longitude}
                        initialAddress={formData.mapAddress}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="facilities">Key Facilities (comma separated)</label>
                    <input
                        type="text"
                        id="facilities"
                        name="facilities"
                        value={formData.facilities}
                        onChange={handleChange}
                        placeholder="e.g. Parking, Lift, Swimming Pool, Gym"
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="form-section">
                <div className="form-group">
                    <label htmlFor="description">Detailed Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell us more about the property, its condition, surroundings, etc."
                        required
                        rows="5"
                        disabled={disabled}
                    ></textarea>
                </div>
            </div>

            <div className="form-section">
                <div className="form-group">
                    <label htmlFor="propertyImage">Cover Image * (Main Image)</label>
                    <div className="image-upload-container">
                        <input
                            type="file"
                            id="propertyImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={disabled}
                        />
                        {imagePreview && (
                            <div className="image-preview-wrapper">
                                <img src={imagePreview} alt="Property Preview" className="preview-image" />
                                <p>Cover Image Preview</p>
                            </div>
                        )}
                    </div>
                    <small>This will be the main image shown in listings. (Mandatory)</small>
                </div>

                <div className="form-group">
                    <label htmlFor="extraImages">Additional Images * (5-20 images)</label>
                    <div className="image-upload-container extra-images-upload">
                        <input
                            type="file"
                            id="extraImages"
                            accept="image/*"
                            onChange={handleExtraImagesChange}
                            multiple
                            disabled={disabled}
                        />
                        <div className="extra-images-grid">
                            {extraPreviews && extraPreviews.length > 0 && extraPreviews.map((preview, index) => (
                                <div key={index} className="extra-image-preview-item">
                                    <img src={preview} alt={`Extra ${index + 1}`} />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => removeExtraImage(index)}
                                        title="Remove Image"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <small>{extraPreviews.length} images selected (Min: 5, Max: 20 Mandatory)</small>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                type="submit"
                className="submit-button"
                disabled={loading || disabled}
            >
                {loading ? (
                    <span className="button-loading">
                        <span className="spinner-small"></span>
                        {editingProperty ? 'Updating...' : 'Posting...'}
                    </span>
                ) : (
                    editingProperty ? 'Update Property' : 'Post Property'
                )}
            </motion.button>
        </form>
    );
};

export default PropertyForm;
