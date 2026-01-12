import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Projects.css';
import listings from '../data/listings';

const categories = ['All', 'Flat/Apartment', 'Independent House/Villa', 'Commercial Property', 'Land'];

const Project = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const filteredListings = selectedCategory === 'All'
    ? listings
    : listings.filter(listing => listing.type === selectedCategory);

  const handleBookVisit = (e, project = null) => {
    e.preventDefault(); // to prevent <Link> navigation
    if (isAuthenticated) {
      navigate('/book-visit', { 
        state: project ? { property: { ...project, type: 'projects' } } : null 
      });
    } else {
      navigate('/login', {
        state: {
          returnTo: '/book-visit',
          property: project,
          message: 'Please login to book a site visit'
        }
      });
    }
  };

  const handleContact = (e) => {
    e.preventDefault(); // to prevent <Link> navigation
    if (isAuthenticated) {
      alert('Contact details: 123-456-7890');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="project-container">
      <h1 className="project-title">Explore Projects</h1>

      <div className="category-buttons">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="project-grid">
        {filteredListings.map((listing) => (
          <Link to={`/projects/${listing.id}`} key={listing.id} className="project-link">
            <div className="project-card">
              <div className="card-img">
                <img src={listing.image} alt={listing.title} />
                <div className="tag-wrapper">
                  {listing.tags?.map((tag, i) => (
                    <span key={i} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="card-details">
                <h3>{listing.title}</h3>
                <p className="text-gray-600">{listing.location}</p>
                <p className="price">{listing.priceRange}</p>
                <div className="card-actions">
                  <button
                    className="view-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleBookVisit(e);
                    }}
                  >
                    Book a Site Visit
                  </button>

                  <Link to={`/projects/${listing.id}`} className="contact-btn">
                    View More
                  </Link>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Project;