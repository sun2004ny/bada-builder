import React from 'react';
import { motion } from 'framer-motion';
import './DeveloperForm.css';
import LocationPicker from '../Map/LocationPicker';

const DeveloperForm = ({
    formData,
    setFormData,
    handleImageChange,
    imagePreview,
    extraPreviews,
    handleExtraImagesChange,
    removeExtraImage,
    brochureFile,
    setBrochureFile,
    handleChange,
    handleSubmit,
    loading,
    disabled,
    handleLocationSelect
}) => {
    const handleCheckboxChange = (category, value) => {
        const currentOptions = formData[category] || [];
        if (currentOptions.includes(value)) {
            setFormData(prev => ({
                ...prev,
                [category]: currentOptions.filter(item => item !== value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [category]: [...currentOptions, value]
            }));
        }
    };

    const handleStatsChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            projectStats: {
                ...prev.projectStats,
                [name]: value
            }
        }));
    };

    const handleSingleFileChange = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
            setter(file);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="developer-form">
            <div className="form-section">
                <div className="form-row">
                    <div className="form-group">
                        <label>Project Name *</label>
                        <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleChange}
                            placeholder="e.g. Green Valley Residency"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Owner / Developer Name *</label>
                        <input
                            type="text"
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleChange}
                            placeholder="Company or Individual Name"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <div className="form-group">
                    <label>Scheme Type *</label>
                    <div className="radio-group">
                        {['Residential', 'Commercial', 'Residential + Commercial'].map(type => (
                            <label key={type} className="radio-label">
                                <input
                                    type="radio"
                                    name="schemeType"
                                    value={type}
                                    checked={formData.schemeType === type}
                                    onChange={handleChange}
                                    required
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                </div>

                {(formData.schemeType === 'Residential' || formData.schemeType === 'Residential + Commercial') && (
                    <div className="form-group">
                        <label>Residential Options</label>
                        <div className="checkbox-grid">
                            {['Bungalows', 'Flats', 'Villas', 'Apartments', 'Duplex / Triplex'].map(opt => (
                                <label key={opt} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.residentialOptions.includes(opt)}
                                        onChange={() => handleCheckboxChange('residentialOptions', opt)}
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {(formData.schemeType === 'Commercial' || formData.schemeType === 'Residential + Commercial') && (
                    <div className="form-group">
                        <label>Commercial Options</label>
                        <div className="checkbox-grid">
                            {['Shops', 'Offices', 'Showroom',].map(opt => (
                                <label key={opt} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.commercialOptions.includes(opt)}
                                        onChange={() => handleCheckboxChange('commercialOptions', opt)}
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="form-section">
                <div className="premium-input-group">
                    <label className="premium-label">INVESTMENT / PRICE *</label>
                    <div className="price-range-flex">
                        <div className="underlined-combined-input">
                            <input
                                type="number"
                                name="basePrice"
                                value={formData.basePrice}
                                onChange={handleChange}
                                placeholder="Min Price"
                                required
                            />
                            <select
                                name="basePriceUnit"
                                value={formData.basePriceUnit}
                                onChange={handleChange}
                                className="underlined-unit-select"
                            >
                                <option value="Lakh">Lakh</option>
                                <option value="Crore">Crore</option>
                            </select>
                        </div>
                        <span className="price-range-separator">-</span>
                        <div className="underlined-combined-input">
                            <input
                                type="number"
                                name="maxPrice"
                                value={formData.maxPrice}
                                onChange={handleChange}
                                placeholder="Max Price"
                                required
                            />
                            <select
                                name="maxPriceUnit"
                                value={formData.maxPriceUnit}
                                onChange={handleChange}
                                className="underlined-unit-select"
                            >
                                <option value="Lakh">Lakh</option>
                                <option value="Crore">Crore</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label>Project Location (City / Area) *</label>
                    <input
                        type="text"
                        name="projectLocation"
                        value={formData.projectLocation}
                        onChange={handleChange}
                        placeholder="e.g. Whitefield, Bangalore"
                        required
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
            </div>

            <div className="form-section">
                <div className="form-row">
                    <div className="form-group">
                        <label>Towers</label>
                        <input type="number" name="towers" value={formData.projectStats.towers} onChange={handleStatsChange} placeholder="e.g. 5" />
                    </div>
                    <div className="form-group">
                        <label>Total Floors</label>
                        <input type="number" name="floors" value={formData.projectStats.floors} onChange={handleStatsChange} placeholder="e.g. 15" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Total Units</label>
                        <input type="number" name="units" value={formData.projectStats.units} onChange={handleStatsChange} placeholder="e.g. 250" />
                    </div>
                    <div className="premium-input-group">
                        <label className="premium-label">TOTAL PROJECT AREA</label>
                        <div className="underlined-combined-input">
                            <input
                                type="number"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                placeholder="e.g. 1500"
                            />
                            <select
                                name="areaUnit"
                                value={formData.areaUnit}
                                onChange={handleChange}
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

            <div className="form-section">
                <div className="checkbox-grid">
                    {['Parking', 'Lift', 'Garden', 'Gym', 'Security', 'Power Backup'].map(amenity => (
                        <label key={amenity} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.amenities.includes(amenity)}
                                onChange={() => handleCheckboxChange('amenities', amenity)}
                            />
                            {amenity}
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-section">
                <div className="form-row">
                    <div className="form-group">
                        <label>Possession Status *</label>
                        <select name="possessionStatus" value={formData.possessionStatus} onChange={handleChange} required>
                            <option value="">Select Status</option>
                            <option value="Under Construction">Under Construction</option>
                            <option value="Ready to Move">Ready to Move</option>
                            <option value="Just Launched">Just Launched</option>
                        </select>
                    </div>
                    {(formData.possessionStatus === 'Under Construction' || formData.possessionStatus === 'Just Launched') && (
                        <div className="form-group">
                            <label>Completion Date *</label>
                            <input
                                type="date"
                                name="completionDate"
                                value={formData.completionDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>RERA Registered? *</label>
                        <select name="reraStatus" value={formData.reraStatus} onChange={handleChange}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                    {formData.reraStatus === 'Yes' && (
                        <div className="form-group">
                            <label>RERA Number *</label>
                            <input
                                type="text"
                                name="reraNumber"
                                value={formData.reraNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="form-section">
                <div className="form-group">
                    <label>Cover Image * (Main Image)</label>
                    <div className="image-upload-container">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={disabled}
                        />
                        {imagePreview && (
                            <div className="image-preview-wrapper">
                                <img src={imagePreview} alt="Cover Preview" className="preview-image" />
                                <p>Cover Image Preview</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Additional Images * (5-20 images)</label>
                    <div className="image-upload-container extra-images-upload">
                        <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handleExtraImagesChange}
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
                    {extraPreviews.length > 0 && extraPreviews.length < 5 && (
                        <p className="validation-error">Please upload at least 5 additional images (currently {extraPreviews.length})</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Brochure (Optional PDF)</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleSingleFileChange(e, setBrochureFile)}
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="form-section">
                <div className="form-group">
                    <label>Contact Phone Number *</label>
                    <div className="phone-input-container">
                        <span className="phone-prefix">+91</span>
                        <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            placeholder="10-digit number"
                            maxLength="10"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <div className="form-group">
                    <label>Project Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Detailed project overview..."
                        rows="4"
                        required
                    />
                </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || disabled}>
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="spinner"></span>
                        'Posting Project...'
                    </span>
                ) : (
                    'Post Project'
                )}
            </button>
        </form>
    );
};

export default DeveloperForm;
