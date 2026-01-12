import React from 'react';
import { motion } from 'framer-motion';
import './DeveloperForm.css';

const DeveloperForm = ({
    formData,
    setFormData,
    projectImages,
    setProjectImages,
    brochureFile,
    setBrochureFile,
    handleChange,
    handleSubmit,
    loading,
    disabled
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

    const handleFileArrayChange = (e, setter, currentFiles) => {
        const files = Array.from(e.target.files);
        const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        const filteredFiles = files.filter(file => validFormats.includes(file.type));

        if (filteredFiles.length !== files.length) {
            alert('Some files were skipped. Only JPG, JPEG, PNG, and WEBP formats are accepted.');
        }

        setter(prev => {
            const updated = [...prev, ...filteredFiles];
            if (updated.length > 30) {
                alert('Maximum 30 images allowed. Only the first 30 images will be kept.');
                return updated.slice(0, 30);
            }
            return updated;
        });

        // Clear input value so same file can be selected again if removed
        e.target.value = '';
    };

    const handleRemoveImage = (index) => {
        setProjectImages(prev => prev.filter((_, i) => i !== index));
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
                <div className="form-row">
                    <div className="form-group">
                        <label>Base Price *</label>
                        <input
                            type="number"
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleChange}
                            placeholder="Min Price"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Max Price *</label>
                        <input
                            type="number"
                            name="maxPrice"
                            value={formData.maxPrice}
                            onChange={handleChange}
                            placeholder="Max Price"
                            required
                        />
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
                    <div className="form-group">
                        <label>Area (sq.ft / acres)</label>
                        <input type="text" name="area" value={formData.projectStats.area} onChange={handleStatsChange} placeholder="e.g. 2.5 Acres" />
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
                    <label>Project Images (5-30 images) *</label>
                    <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleFileArrayChange(e, setProjectImages, projectImages)}
                        required={projectImages.length === 0}
                    />
                    <small>{projectImages.length} images selected (Min: 5, Max: 30)</small>

                    {projectImages.length > 0 && (
                        <div className="image-previews-grid">
                            {projectImages.map((file, index) => (
                                <div key={index} className="preview-item">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {projectImages.length > 0 && projectImages.length < 5 && (
                        <p className="validation-error">Please upload at least 5 images (currently {projectImages.length})</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Brochure (Optional PDF)</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleSingleFileChange(e, setBrochureFile)}
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
