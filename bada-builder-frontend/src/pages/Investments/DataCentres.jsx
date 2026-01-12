import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaServer, FaMapMarkerAlt, FaChartLine, FaClock, FaShieldAlt } from 'react-icons/fa';
import './DataCentres.css';

const DataCentres = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    location: 'all',
    tier: 'all',
    minInvestment: 'all',
    returns: 'all',
    risk: 'all'
  });

  // Sample data centre projects
  const dataCentreProjects = [
    {
      id: 'dc-mumbai-1',
      name: 'Mumbai Hyperscale Data Centre',
      city: 'Mumbai',
      country: 'India',
      tier: 'Tier III',
      totalCapacity: 25,
      pue: 1.4,
      tenantType: 'Hyperscale',
      minimumInvestment: 1000000,
      expectedAnnualReturns: 12,
      investmentTenure: 5,
      riskLevel: 'Low',
      status: 'Live',
      fundedPercentage: 65,
      image: '/placeholder-property.jpg'
    },
    {
      id: 'dc-bangalore-1',
      name: 'Bangalore Enterprise DC',
      city: 'Bangalore',
      country: 'India',
      tier: 'Tier IV',
      totalCapacity: 15,
      pue: 1.3,
      tenantType: 'Enterprise',
      minimumInvestment: 500000,
      expectedAnnualReturns: 14,
      investmentTenure: 7,
      riskLevel: 'Low',
      status: 'Live',
      fundedPercentage: 80,
      image: '/placeholder-property.jpg'
    },
    {
      id: 'dc-delhi-1',
      name: 'Delhi NCR Mixed Use DC',
      city: 'Delhi NCR',
      country: 'India',
      tier: 'Tier III',
      totalCapacity: 20,
      pue: 1.5,
      tenantType: 'Mixed',
      minimumInvestment: 750000,
      expectedAnnualReturns: 13,
      investmentTenure: 6,
      riskLevel: 'Medium',
      status: 'Live',
      fundedPercentage: 45,
      image: '/placeholder-property.jpg'
    }
  ];

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'risk-low';
      case 'Medium': return 'risk-medium';
      case 'High': return 'risk-high';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live': return 'status-live';
      case 'Fully Funded': return 'status-funded';
      case 'Coming Soon': return 'status-coming';
      default: return '';
    }
  };

  return (
    <div className="data-centres-page">
      {/* Hero Section */}
      <div className="dc-hero">
        <motion.div 
          className="dc-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1><FaServer className="inline mr-3" />Data Centre Investments</h1>
          <p>Invest in institutional-grade data centre infrastructure with stable returns</p>
          <div className="dc-stats">
            <div className="stat-box">
              <span className="stat-number">₹500 Cr+</span>
              <span className="stat-label">Assets Under Management</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">12-15%</span>
              <span className="stat-label">Average Annual Returns</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">3</span>
              <span className="stat-label">Active Projects</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Why Invest Section */}
      <div className="why-invest-section">
        <h2>Why Invest in Data Centres?</h2>
        <div className="benefits-grid-dc">
          <div className="benefit-card-dc">
            <FaChartLine className="benefit-icon-dc" />
            <h3>Stable Returns</h3>
            <p>Long-term lease agreements ensure predictable cash flows</p>
          </div>
          <div className="benefit-card-dc">
            <FaShieldAlt className="benefit-icon-dc" />
            <h3>Low Risk</h3>
            <p>Institutional-grade assets with tier III/IV certifications</p>
          </div>
          <div className="benefit-card-dc">
            <FaClock className="benefit-icon-dc" />
            <h3>Growing Demand</h3>
            <p>Digital transformation driving exponential data centre demand</p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="dc-projects-section">
        <h2>Investment Opportunities</h2>
        
        <div className="dc-projects-grid">
          {dataCentreProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="dc-project-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="dc-card-image">
                <img src={project.image} alt={project.name} />
                <div className="dc-card-badges">
                  <span className={`status-badge ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="tier-badge">{project.tier}</span>
                </div>
              </div>

              <div className="dc-card-content">
                <h3>{project.name}</h3>
                <p className="dc-location">
                  <FaMapMarkerAlt /> {project.city}, {project.country}
                </p>

                <div className="dc-specs">
                  <div className="spec-item">
                    <span className="spec-label">Capacity:</span>
                    <span className="spec-value">{project.totalCapacity} MW</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">PUE:</span>
                    <span className="spec-value">{project.pue}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Tenant:</span>
                    <span className="spec-value">{project.tenantType}</span>
                  </div>
                </div>

                <div className="dc-financials">
                  <div className="financial-row">
                    <span className="label">Min. Investment:</span>
                    <span className="value">{formatCurrency(project.minimumInvestment)}</span>
                  </div>
                  <div className="financial-row highlight">
                    <span className="label">Expected Returns:</span>
                    <span className="value">{project.expectedAnnualReturns}% p.a.</span>
                  </div>
                  <div className="financial-row">
                    <span className="label">Tenure:</span>
                    <span className="value">{project.investmentTenure} years</span>
                  </div>
                  <div className="financial-row">
                    <span className="label">Risk Level:</span>
                    <span className={`value ${getRiskColor(project.riskLevel)}`}>
                      {project.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="funding-progress">
                  <div className="progress-header">
                    <span>Funding Progress</span>
                    <span>{project.fundedPercentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${project.fundedPercentage}%` }}
                    />
                  </div>
                </div>

                <button 
                  className="view-details-btn-dc"
                  onClick={() => navigate(`/investments/data-centres/${project.id}`)}
                >
                  View Details & Invest
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="legal-disclaimer">
        <h3>⚠️ Important Disclaimer</h3>
        <p>
          Data Centre investments are market-linked and subject to risk. Past performance is not indicative of future results. 
          Please read all scheme-related documents carefully before investing. KYC is mandatory for all investments.
        </p>
      </div>
    </div>
  );
};

export default DataCentres;
