import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import './HundredMonths.css';

const HundredMonths = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Fetch properties that support 100-month plan
      const propertiesRef = collection(db, 'properties');
      const q = query(propertiesRef, where('paymentPlanEnabled', '==', true));
      const snapshot = await getDocs(q);
      
      const propertiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hundred-months-page">
      {/* Hero Section */}
      <div className="hero-section-100">
        <div className="hero-content">
          <h1>💰 100 Months Payment Plan</h1>
          <p className="hero-subtitle">Own Your Dream Property with Flexible Monthly Installments</p>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>No Interest</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏠</span>
              <span>Immediate Possession</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💳</span>
              <span>Flexible Payments</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>100% Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Choose Property</h3>
            <p>Select from our verified properties with 100-month plan option</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Pay Booking Amount</h3>
            <p>Make initial booking payment (typically 10-20% of property value)</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Monthly Installments</h3>
            <p>Pay remaining amount in 100 equal monthly installments</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Own Your Property</h3>
            <p>Get full ownership after completing all payments</p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section-100">
        <h2>Why Choose 100 Months Plan?</h2>
        <div className="benefits-grid">
          <div className="benefit-card-100">
            <span className="benefit-icon-100">💰</span>
            <h3>Affordable Monthly Payments</h3>
            <p>Spread your payment over 100 months with no interest</p>
          </div>
          <div className="benefit-card-100">
            <span className="benefit-icon-100">🏡</span>
            <h3>Immediate Possession</h3>
            <p>Move into your property right after booking</p>
          </div>
          <div className="benefit-card-100">
            <span className="benefit-icon-100">📊</span>
            <h3>Transparent Tracking</h3>
            <p>Monitor your payment progress in real-time</p>
          </div>
          <div className="benefit-card-100">
            <span className="benefit-icon-100">🔐</span>
            <h3>Secure & Legal</h3>
            <p>RERA approved with proper documentation</p>
          </div>
          <div className="benefit-card-100">
            <span className="benefit-icon-100">⏰</span>
            <h3>Grace Period</h3>
            <p>5-day grace period for each installment</p>
          </div>
          <div className="benefit-card-100">
            <span className="benefit-icon-100">🔄</span>
            <h3>Flexible Options</h3>
            <p>Prepay anytime without penalties</p>
          </div>
        </div>
      </div>

      {/* Available Properties */}
      <div className="properties-section-100">
        <div className="section-header">
          <h2>Available Properties</h2>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-100"></div>
            <p>Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <h3>No Properties Available</h3>
            <p>Check back soon for new properties with 100-month plan</p>
          </div>
        ) : (
          <div className="properties-grid-100">
            {properties.map(property => (
              <div key={property.id} className="property-card-100">
                <div className="property-image-100">
                  <img src={property.images?.[0] || '/placeholder-property.jpg'} alt={property.title} />
                  <span className="plan-badge">100 Months Available</span>
                </div>
                <div className="property-info-100">
                  <h3>{property.title}</h3>
                  <p className="location-100">📍 {property.location}</p>
                  <div className="property-specs-100">
                    <span>{property.type}</span>
                    <span>{property.area} sq ft</span>
                  </div>
                  <div className="pricing-info-100">
                    <div className="price-row">
                      <span className="label">Total Value:</span>
                      <span className="value">₹{(property.price / 100000).toFixed(2)}L</span>
                    </div>
                    <div className="price-row">
                      <span className="label">Booking Amount:</span>
                      <span className="value">₹{(property.bookingAmount / 100000).toFixed(2)}L</span>
                    </div>
                    <div className="price-row highlight">
                      <span className="label">Monthly (100 months):</span>
                      <span className="value">₹{((property.price - property.bookingAmount) / 100 / 1000).toFixed(2)}K</span>
                    </div>
                  </div>
                  <button 
                    className="view-plan-btn"
                    onClick={() => navigate(`/100-months/property/${property.id}`)}
                  >
                    View Payment Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Payment Plans (if logged in) */}
      {currentUser && (
        <div className="my-plans-section">
          <div className="my-plans-header">
            <h2>My Payment Plans</h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/profile/payment-plans')}
            >
              View All →
            </button>
          </div>
          <p className="my-plans-desc">Track your active payment plans and upcoming installments</p>
        </div>
      )}

      {/* FAQ Section */}
      <div className="faq-section-100">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>What is the 100 Months Payment Plan?</h4>
            <p>It's a flexible payment option where you pay a booking amount upfront and the remaining amount in 100 equal monthly installments with no interest.</p>
          </div>
          <div className="faq-item">
            <h4>When do I get possession?</h4>
            <p>You can get immediate possession after paying the booking amount, subject to property availability and developer terms.</p>
          </div>
          <div className="faq-item">
            <h4>What happens if I miss a payment?</h4>
            <p>You have a 5-day grace period. After that, a late fee may apply. Missing 3 consecutive payments may result in plan cancellation.</p>
          </div>
          <div className="faq-item">
            <h4>Can I prepay the remaining amount?</h4>
            <p>Yes, you can prepay anytime without any penalties. Your ownership will be transferred immediately upon full payment.</p>
          </div>
          <div className="faq-item">
            <h4>Is this plan legally secure?</h4>
            <p>Yes, all properties are RERA approved with proper legal documentation. Your payments are tracked and secured.</p>
          </div>
          <div className="faq-item">
            <h4>What are the ownership rights?</h4>
            <p>You get partial rights during the payment period and full ownership rights after completing all 100 installments.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section-100">
        <h2>Ready to Own Your Dream Property?</h2>
        <p>Start your journey with our flexible 100-month payment plan</p>
        <button 
          className="cta-btn-100"
          onClick={() => {
            if (currentUser) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/login');
            }
          }}
        >
          {currentUser ? 'Browse Properties' : 'Login to Get Started'}
        </button>
      </div>
    </div>
  );
};

export default HundredMonths;
