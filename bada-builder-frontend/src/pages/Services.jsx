import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Services.css';

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
    id: 8,
    title: 'Marketing Services',
    description: 'Premium videography, drone shoots, and digital marketing strategies',
    icon: '📢',
    features: ['DSLR & Drone Shoots', 'Meta Ads', 'Influencer Marketing'],
    link: '/services/marketing'
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

  // Refined animation variants - subtle and intentional
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut"
      }
    }
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  return (
    <div className="services-page">
      {/* Subtle background elements */}
      <div className="floating-bg-blob blob-1"></div>
      <div className="floating-bg-blob blob-2"></div>

      <div className="services-container">
        {/* Header Section */}
        <motion.div
          className="services-header"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <h1>Our Services</h1>
          <p>Comprehensive real estate solutions tailored for your success</p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              className="service-card"
              variants={cardVariants}
            >
              {/* Card Header */}
              <div className="service-card-header">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
              </div>

              {/* Card Body */}
              <div className="service-card-body">
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
              </div>

              {/* Card Footer */}
              <div className="service-card-footer">
                <button
                  className="service-btn"
                  onClick={() => handleServiceClick(service)}
                >
                  {service.link ? 'Explore Now' : 'Learn More'}
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="cta-section"
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2>Need Help Choosing?</h2>
          <p>Our experts are here to guide you through every step</p>
          <button
            className="cta-button"
            onClick={() => navigate('/contact')}
          >
            Contact Us
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
