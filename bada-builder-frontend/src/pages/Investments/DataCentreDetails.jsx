import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaServer, FaMapMarkerAlt, FaChartLine, FaClock, FaShieldAlt, 
  FaBuilding, FaFileAlt, FaCalculator, FaCheckCircle 
} from 'react-icons/fa';
import './DataCentreDetails.css';

const DataCentreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [investmentAmount, setInvestmentAmount] = useState(1000000);
  const [showCalculator, setShowCalculator] = useState(false);

  // Sample project data (in production, fetch from Firestore)
  const project = {
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
    
    description: 'State-of-the-art hyperscale data centre facility located in Mumbai\'s prime IT corridor. Designed to meet the growing demand for cloud computing and digital services.',
    operatorName: 'DataHub Infrastructure Pvt Ltd',
    ownershipStructure: 'SPV (Special Purpose Vehicle)',
    commissioningDate: '2024-06-15',
    totalProjectCost: 50000000000,
    fundedAmount: 32500000000,
    remainingAmount: 17500000000,
    
    redundancy: 'N+1',
    coolingType: 'Precision Air Cooling with Hot Aisle Containment',
    connectivity: ['Multiple Fiber Routes', 'Tier-1 ISP Connectivity', 'Dark Fiber Available'],
    compliance: ['ISO 27001', 'SOC 2 Type II', 'PCI DSS', 'HIPAA Ready'],
    
    targetIRR: 14,
    annualYield: 12,
    cashflowFrequency: 'Quarterly',
    lockInPeriod: 12,
    exitOptions: ['Secondary Market', 'Buyback Option', 'IPO Exit'],
    managementFee: 1.5,
    performanceFee: 10,
    
    tenants: [
      { name: 'AWS', leaseArea: '40%', leaseTerm: '10 years' },
      { name: 'Microsoft Azure', leaseArea: '35%', leaseTerm: '8 years' },
      { name: 'Enterprise Clients', leaseArea: '25%', leaseTerm: '5 years' }
    ],
    leaseType: 'Triple Net Lease',
    averageLeaseDuration: 8,
    revenueType: ['Colocation Revenue', 'Power Revenue', 'Cross-Connect Fees'],
    
    risks: [
      { risk: 'Technology Obsolescence', mitigation: 'Regular infrastructure upgrades planned' },
      { risk: 'Tenant Concentration', mitigation: 'Diversified tenant base across hyperscalers' },
      { risk: 'Power Supply', mitigation: 'Dual power feeds with N+1 redundancy' },
      { risk: 'Market Competition', mitigation: 'Strategic location with limited supply' }
    ],
    
    images: ['/placeholder-property.jpg'],
    documents: [
      { name: 'Investment Memorandum', url: '#' },
      { name: 'Technical Specifications', url: '#' },
      { name: 'Financial Projections', url: '#' },
      { name: 'Legal Agreement', url: '#' }
    ]
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const calculateReturns = () => {
    const annualIncome = (investmentAmount * project.expectedAnnualReturns) / 100;
    const totalReturns = annualIncome * project.investmentTenure;
    const totalValue = investmentAmount + totalReturns;
    
    return {
      annualIncome,
      monthlyIncome: annualIncome / 12,
      quarterlyIncome: annualIncome / 4,
      totalReturns,
      totalValue
    };
  };

  const returns = calculateReturns();

  const handleInvest = () => {
    // Navigate to payment page or show payment modal
    alert(`Proceeding to invest ${formatCurrency(investmentAmount)} in ${project.name}`);
    // In production: navigate('/payment', { state: { project, amount: investmentAmount } });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaBuilding },
    { id: 'technical', label: 'Technical', icon: FaServer },
    { id: 'financials', label: 'Financials', icon: FaChartLine },
    { id: 'tenants', label: 'Tenants', icon: FaBuilding },
    { id: 'risks', label: 'Risks', icon: FaShieldAlt },
    { id: 'documents', label: 'Documents', icon: FaFileAlt }
  ];

  return (
    <div className="dc-details-page">
      {/* Hero Section */}
      <div className="dc-details-hero">
        <div className="dc-hero-overlay" />
        <div className="dc-hero-content-details">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="dc-breadcrumb">
              <span onClick={() => navigate('/investments')}>Investments</span>
              <span> / </span>
              <span onClick={() => navigate('/investments/data-centres')}>Data Centres</span>
              <span> / </span>
              <span>{project.name}</span>
            </div>
            <h1>{project.name}</h1>
            <p className="dc-location-hero">
              <FaMapMarkerAlt /> {project.city}, {project.country}
            </p>
            <div className="dc-hero-badges">
              <span className="badge-tier">{project.tier}</span>
              <span className="badge-status">{project.status}</span>
              <span className="badge-tenant">{project.tenantType}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="dc-details-container">
        {/* Main Content */}
        <div className="dc-details-main">
          {/* Tabs */}
          <div className="dc-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`dc-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="tab-icon" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            className="dc-tab-content"
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="tab-section">
                <h2>Project Overview</h2>
                <p className="description">{project.description}</p>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Operator</span>
                    <span className="info-value">{project.operatorName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ownership Structure</span>
                    <span className="info-value">{project.ownershipStructure}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Commissioning Date</span>
                    <span className="info-value">{new Date(project.commissioningDate).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Project Cost</span>
                    <span className="info-value">{formatCurrency(project.totalProjectCost)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Funded Amount</span>
                    <span className="info-value">{formatCurrency(project.fundedAmount)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Remaining Amount</span>
                    <span className="info-value">{formatCurrency(project.remainingAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="tab-section">
                <h2>Technical Specifications</h2>
                
                <div className="tech-grid">
                  <div className="tech-card">
                    <h3>Infrastructure</h3>
                    <ul>
                      <li><strong>Tier:</strong> {project.tier}</li>
                      <li><strong>Total Capacity:</strong> {project.totalCapacity} MW</li>
                      <li><strong>PUE:</strong> {project.pue}</li>
                      <li><strong>Redundancy:</strong> {project.redundancy}</li>
                      <li><strong>Cooling:</strong> {project.coolingType}</li>
                    </ul>
                  </div>
                  
                  <div className="tech-card">
                    <h3>Connectivity</h3>
                    <ul>
                      {project.connectivity.map((conn, idx) => (
                        <li key={idx}><FaCheckCircle className="check-icon" /> {conn}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="tech-card">
                    <h3>Compliance & Certifications</h3>
                    <div className="compliance-badges">
                      {project.compliance.map((cert, idx) => (
                        <span key={idx} className="compliance-badge">{cert}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="tab-section">
                <h2>Financial Details</h2>
                
                <div className="financial-grid">
                  <div className="financial-card">
                    <span className="fin-label">Target IRR</span>
                    <span className="fin-value">{project.targetIRR}%</span>
                  </div>
                  <div className="financial-card">
                    <span className="fin-label">Annual Yield</span>
                    <span className="fin-value">{project.annualYield}%</span>
                  </div>
                  <div className="financial-card">
                    <span className="fin-label">Cashflow Frequency</span>
                    <span className="fin-value">{project.cashflowFrequency}</span>
                  </div>
                  <div className="financial-card">
                    <span className="fin-label">Lock-in Period</span>
                    <span className="fin-value">{project.lockInPeriod} months</span>
                  </div>
                  <div className="financial-card">
                    <span className="fin-label">Management Fee</span>
                    <span className="fin-value">{project.managementFee}%</span>
                  </div>
                  <div className="financial-card">
                    <span className="fin-label">Performance Fee</span>
                    <span className="fin-value">{project.performanceFee}%</span>
                  </div>
                </div>

                <div className="exit-options">
                  <h3>Exit Options</h3>
                  <div className="exit-list">
                    {project.exitOptions.map((option, idx) => (
                      <div key={idx} className="exit-item">
                        <FaCheckCircle className="check-icon" />
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tenants' && (
              <div className="tab-section">
                <h2>Tenants & Revenue</h2>
                
                <div className="tenant-info">
                  <div className="info-row">
                    <span className="label">Lease Type:</span>
                    <span className="value">{project.leaseType}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Average Lease Duration:</span>
                    <span className="value">{project.averageLeaseDuration} years</span>
                  </div>
                </div>

                <h3>Major Tenants</h3>
                <div className="tenants-grid">
                  {project.tenants.map((tenant, idx) => (
                    <div key={idx} className="tenant-card">
                      <h4>{tenant.name}</h4>
                      <p><strong>Lease Area:</strong> {tenant.leaseArea}</p>
                      <p><strong>Lease Term:</strong> {tenant.leaseTerm}</p>
                    </div>
                  ))}
                </div>

                <h3>Revenue Streams</h3>
                <div className="revenue-list">
                  {project.revenueType.map((revenue, idx) => (
                    <div key={idx} className="revenue-item">
                      <FaCheckCircle className="check-icon" />
                      <span>{revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'risks' && (
              <div className="tab-section">
                <h2>Risk Assessment & Mitigation</h2>
                
                <div className="risks-grid">
                  {project.risks.map((item, idx) => (
                    <div key={idx} className="risk-card">
                      <div className="risk-header">
                        <FaShieldAlt className="risk-icon" />
                        <h3>{item.risk}</h3>
                      </div>
                      <p><strong>Mitigation:</strong> {item.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="tab-section">
                <h2>Documents & Reports</h2>
                
                <div className="documents-grid">
                  {project.documents.map((doc, idx) => (
                    <div key={idx} className="document-card">
                      <FaFileAlt className="doc-icon" />
                      <span className="doc-name">{doc.name}</span>
                      <button className="download-btn">Download</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar - Investment Calculator */}
        <div className="dc-details-sidebar">
          <div className="investment-calculator-card">
            <div className="calc-header">
              <FaCalculator className="calc-icon" />
              <h3>Investment Calculator</h3>
            </div>

            <div className="calc-body">
              <div className="amount-input-section">
                <label>Investment Amount</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  min={project.minimumInvestment}
                  step={100000}
                />
                <span className="min-investment">
                  Min: {formatCurrency(project.minimumInvestment)}
                </span>
              </div>

              <div className="returns-display">
                <div className="return-item">
                  <span className="return-label">Annual Income</span>
                  <span className="return-value">{formatCurrency(returns.annualIncome)}</span>
                </div>
                <div className="return-item">
                  <span className="return-label">Quarterly Payout</span>
                  <span className="return-value">{formatCurrency(returns.quarterlyIncome)}</span>
                </div>
                <div className="return-item highlight">
                  <span className="return-label">Total Returns ({project.investmentTenure} years)</span>
                  <span className="return-value">{formatCurrency(returns.totalReturns)}</span>
                </div>
                <div className="return-item highlight">
                  <span className="return-label">Total Value at Exit</span>
                  <span className="return-value">{formatCurrency(returns.totalValue)}</span>
                </div>
              </div>

              <button className="invest-now-btn" onClick={handleInvest}>
                Invest Now
              </button>

              <div className="quick-stats">
                <div className="stat">
                  <FaChartLine />
                  <span>{project.expectedAnnualReturns}% Returns</span>
                </div>
                <div className="stat">
                  <FaClock />
                  <span>{project.investmentTenure} Years</span>
                </div>
                <div className="stat">
                  <FaShieldAlt />
                  <span>{project.riskLevel} Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Funding Progress */}
          <div className="funding-progress-card">
            <h3>Funding Progress</h3>
            <div className="progress-circle">
              <span className="progress-percentage">{project.fundedPercentage}%</span>
            </div>
            <div className="funding-details">
              <div className="funding-row">
                <span>Funded</span>
                <span>{formatCurrency(project.fundedAmount)}</span>
              </div>
              <div className="funding-row">
                <span>Remaining</span>
                <span>{formatCurrency(project.remainingAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCentreDetails;
