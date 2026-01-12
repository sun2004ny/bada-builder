import React from 'react';
import { motion } from 'framer-motion';
import './PropertyForm.css';

const PropertyForm = ({
    formData,
    handleChange,
    handleImageChange,
    imagePreview,
    handleSubmit,
    loading,
    userType,
    showBhkType,
    editingProperty,
    disabled
}) => {
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

                    <div className="form-group">
                        <label htmlFor="price">Price (₹) *</label>
                        <input
                            type="text"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="e.g. 75,00,000"
                            required
                            disabled={disabled}
                        />
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
                    <label htmlFor="propertyImage">Property Image *</label>
                    <div className="image-upload-container">
                        <input
                            type="file"
                            id="propertyImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            required={!editingProperty && !imagePreview}
                            disabled={disabled}
                        />
                        {imagePreview && (
                            <div className="image-preview-wrapper">
                                <img src={imagePreview} alt="Property Preview" className="preview-image" />
                                <p>Selected Image</p>
                            </div>
                        )}
                    </div>
                    <small>Upload a clear photo of the property to attract more buyers.</small>
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
