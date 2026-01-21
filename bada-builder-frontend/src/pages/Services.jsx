import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Services.css';
import PageTransition from '../components/Motion/PageTransition';
import ScrollReveal from '../components/Motion/ScrollReveal';
import AnimatedButton from '../components/Motion/AnimatedButton';

const services = [
  {
    id: 1,
    title: 'Legal Verification',
    description: 'Complete property document verification and legal clearance services',
    icon: '⚖️',
    features: ['Title verification', 'Document authentication', 'Legal compliance check'],
    link: null
  },
  {
    id: 2,
    title: 'Home Loans',
    description: 'Get the best home loan deals with competitive interest rates',
    icon: '🏦',
    features: ['Low interest rates', 'Quick approval', 'Flexible repayment'],
    link: '/home-loans'
  },
  {
    id: 3,
    title: 'Interior Design',
    description: 'Professional interior design services for your dream home',
    icon: '🎨',
    features: ['Custom designs', '3D visualization', 'Turnkey solutions'],
    link: null
  },
  {
    id: 4,
    title: 'Investment Advisory',
    description: 'Expert guidance on real estate investments and portfolio management',
    icon: '📈',
    features: ['ROI analysis', 'Market insights', 'Investment strategies'],
    link: '/investments'
  },
  {
    id: 5,
    title: 'Property Valuation',
    description: 'Accurate property valuation by certified professionals',
    icon: '💰',
    features: ['Market analysis', 'Detailed reports', 'Expert consultation'],
    link: null
  },
  {
    id: 6,
    title: 'Property Management',
    description: 'End-to-end property management and maintenance services',
    icon: '🏢',
    features: ['Tenant management', 'Maintenance', 'Rent collection'],
    link: null
  },
  {
    id: 7,
    title: 'Insurance Services',
    description: 'Comprehensive property and home insurance solutions',
    icon: '🛡️',
    features: ['Property insurance', 'Home insurance', 'Claim assistance'],
    link: null
  }
];

const Services = () => {
  const navigate = useNavigate();

  const handleServiceClick = (service) => {
    if (service.link) {
      navigate(service.link);
    } else {
      alert(`${service.title} service - Coming soon! Contact us for more information.`);
    }
  };

  return (
    <PageTransition>
      <div className="services-page">
        <div className="services-container">
          <ScrollReveal
            className="services-header"
            width="100%"
          >
            <h1>Our Services</h1>
            <p>Comprehensive real estate solutions for all your needs</p>
          </ScrollReveal>

          <div className="services-grid">
            {services.map((service, index) => (
              <ScrollReveal
                key={service.id}
                className="service-card"
                delay={index * 0.1}
                width="100%"
              >
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>
                      <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <AnimatedButton
                  className="service-btn"
                  onClick={() => handleServiceClick(service)}
                >
                  {service.link ? 'Explore Now' : 'Learn More'}
                </AnimatedButton>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal
            className="cta-section"
            delay={0.8}
            width="100%"
          >
            <h2>Need Help Choosing?</h2>
            <p>Our experts are here to guide you through every step</p>
            <AnimatedButton
              className="cta-button"
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </AnimatedButton>
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  );
};

export default Services;
