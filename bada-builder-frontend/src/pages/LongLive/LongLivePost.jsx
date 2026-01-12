import React, { useState } from 'react';
// TODO: Remove Firebase - implement with API
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LongLivePost.css';

const LongLivePost = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    rentalType: 'rent', // rent or lease
    monthlyRent: '',
    securityDeposit: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    furnishing: 'unfurnished', // unfurnished, semi-furnished, fully-furnished
    propertyType: 'apartment', // apartment, house, villa, etc.
    availableFrom: '',
    amenities: [],
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });

  const amenitiesList = [
    'Parking', 'Gym', 'Swimming Pool', 'Security', 'Power Backup',
    'Lift', 'Garden', 'Club House', 'Play Area', 'Wi-Fi'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const uploadImages = async () => {
    const imageUrls = [];
    for (const image of images) {
      const imageRef = ref(storage, `rental-properties/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);
      imageUrls.push(url);
    }
    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Please login to post a property');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Upload images
      const imageUrls = images.length > 0 ? await uploadImages() : [];

      // Add property to Firestore
      await addDoc(collection(db, 'rentalProperties'), {
        ...formData,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseFloat(formData.area),
        images: imageUrls,
        userId: currentUser.uid,
        status: 'active',
        createdAt: serverTimestamp(),
        views: 0,
        inquiries: 0
      });

      alert('Property posted successfully!');
      navigate('/long-live/browse');
    } catch (error) {
      console.error('Error posting property:', error);
      alert('Failed to post property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="long-live-post">
      <div className="post-header">
        <h1>Post Your Rental Property</h1>
        <p>List your property for long-term rent or lease</p>
      </div>

      <form onSubmit={handleSubmit} className="post-form">
        {/* Basic Details */}
        <div className="form-section">
          <h2>Basic Details</h2>
          
          <div className="form-group">
            <label>Property Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Spacious 3 BHK Apartment"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your property..."
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rental Type *</label>
              <select name="rentalType" value={formData.rentalType} onChange={handleInputChange} required>
                <option value="rent">For Rent</option>
                <option value="lease">For Lease</option>
              </select>
            </div>

            <div className="form-group">
              <label>Property Type *</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} required>
                <option value="apartment">Apartment</option>
                <option value="house">Independent House</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="penthouse">Penthouse</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <h2>Location</h2>
          
          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Street address"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="form-section">
          <h2>Property Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms *</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Bathrooms *</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Area (sq ft) *</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Furnishing Status *</label>
            <select name="furnishing" value={formData.furnishing} onChange={handleInputChange} required>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully Furnished</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h2>Pricing</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Monthly Rent (₹) *</label>
              <input
                type="number"
                name="monthlyRent"
                value={formData.monthlyRent}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Security Deposit (₹) *</label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Available From *</label>
              <input
                type="date"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="form-section">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="amenity-checkbox">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h2>Property Images</h2>
          <div className="form-group">
            <label>Upload Images (Max 10)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              max="10"
            />
            {images.length > 0 && (
              <p className="image-count">{images.length} image(s) selected</p>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="form-section">
          <h2>Contact Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Contact Name *</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Phone *</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Email *</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Posting...' : 'Post Property'}
        </button>
      </form>
    </div>
  );
};

export default LongLivePost;
