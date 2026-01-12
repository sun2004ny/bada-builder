import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// TODO: Remove Firebase - implement with API
import { useAuth } from '../../context/AuthContext';
import './HomeLoans.css';

const HomeLoans = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Eligibility Modal State
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityForm, setEligibilityForm] = useState({
    name: '',
    phone: '',
    income: '',
    employmentType: 'salaried'
  });

  // Default bank data
  const defaultBanks = [
    { id: 1, name: 'State Bank of India', interestRate: 8.20, processingFee: '0.35% of loan amount', maxTenure: 30, logo: '🏦' },
    { id: 2, name: 'HDFC Bank', interestRate: 8.35, processingFee: '0.50% of loan amount', maxTenure: 30, logo: '🏦' },
    { id: 3, name: 'ICICI Bank', interestRate: 8.40, processingFee: '0.50% of loan amount', maxTenure: 30, logo: '🏦' },
    { id: 4, name: 'Axis Bank', interestRate: 8.45, processingFee: '1% of loan amount', maxTenure: 30, logo: '🏦' },
    { id: 5, name: 'Bank of Baroda', interestRate: 8.25, processingFee: '0.50% of loan amount', maxTenure: 30, logo: '🏦' },
    { id: 6, name: 'LIC Housing Finance', interestRate: 8.30, processingFee: '0.50% of loan amount', maxTenure: 30, logo: '🏦' },
    { id: 7, name: 'PNB Housing Finance', interestRate: 8.50, processingFee: '0.50% of loan amount', maxTenure: 30, logo: '🏦' }
  ];

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenure]);

  const fetchBanks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'home_loan_banks'));
      if (querySnapshot.empty) {
        setBanks(defaultBanks);
      } else {
        const banksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBanks(banksData);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      setBanks(defaultBanks);
    } finally {
      setLoading(false);
    }
  };

  const calculateEMI = () => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;

    if (r === 0) {
      const monthlyEMI = P / n;
      setEmi(monthlyEMI);
      setTotalAmount(P);
      setTotalInterest(0);
      return;
    }

    const monthlyEMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthlyEMI * n;
    const interest = total - P;

    setEmi(monthlyEMI);
    setTotalAmount(total);
    setTotalInterest(interest);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleApplyLoan = (bankName) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    alert(`Applying for home loan with ${bankName}. Feature coming soon!`);
  };

  const handleEligibilityCheck = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'eligibility_checks'), {
        ...eligibilityForm,
        userId: currentUser?.uid || 'guest',
        timestamp: new Date(),
        type: 'home_loan'
      });
      
      alert('Eligibility check submitted! Our team will contact you soon.');
      setShowEligibilityModal(false);
      setEligibilityForm({ name: '', phone: '', income: '', employmentType: 'salaried' });
    } catch (error) {
      console.error('Error submitting eligibility check:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  const getBestRate = () => {
    return Math.min(...banks.map(b => b.interestRate));
  };

  return (
    <div className="home-loans-page">
      {/* Hero Section */}
      <motion.section 
        className="hero-section-loans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content-loans">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Home Loans in India
          </motion.h1>
          <motion.p
            className="hero-subtitle-loans"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Compare home loan interest rates, calculate EMI, and apply instantly
          </motion.p>
        </div>
      </motion.section>

      {/* Bank-wise Interest Rate Table */}
      <section className="banks-section">
        <div className="container-loans">
          <h2 className="section-title-loans">Compare Interest Rates</h2>
          <p className="section-subtitle-loans">Find the best home loan rates from top banks</p>

          {loading ? (
            <div className="loading-state-loans">Loading banks...</div>
          ) : (
            <div className="banks-table-wrapper">
              <table className="banks-table">
                <thead>
                  <tr>
                    <th>Bank Name</th>
                    <th>Interest Rate</th>
                    <th>Processing Fee</th>
                    <th>Max Tenure</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.map((bank, index) => (
                    <motion.tr
                      key={bank.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={bank.interestRate === getBestRate() ? 'best-rate' : ''}
                    >
                      <td>
                        <div className="bank-name-cell">
                          <span className="bank-logo">{bank.logo}</span>
                          <span>{bank.name}</span>
                          {bank.interestRate === getBestRate() && (
                            <span className="best-badge">Best Rate</span>
                          )}
                        </div>
                      </td>
                      <td className="rate-cell">{bank.interestRate}% onwards</td>
                      <td>{bank.processingFee}</td>
                      <td>Up to {bank.maxTenure} years</td>
                      <td>
                        <button 
                          className="apply-btn-table"
                          onClick={() => handleApplyLoan(bank.name)}
                        >
                          Apply Now
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* EMI Calculator */}
      <section className="emi-calculator-section">
        <div className="container-loans">
          <h2 className="section-title-loans">EMI Calculator</h2>
          <p className="section-subtitle-loans">Calculate your monthly EMI instantly</p>

          <div className="calculator-grid">
            <div className="calculator-inputs">
              <div className="input-group-loans">
                <label>Loan Amount</label>
                <div className="input-with-display">
                  <input
                    type="range"
                    min="100000"
                    max="50000000"
                    step="100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="range-input"
                  />
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="number-input"
                  />
                </div>
                <span className="input-value">{formatCurrency(loanAmount)}</span>
              </div>

              <div className="input-group-loans">
                <label>Interest Rate (% per annum)</label>
                <div className="input-with-display">
                  <input
                    type="range"
                    min="6"
                    max="15"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="range-input"
                  />
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="number-input"
                    step="0.1"
                  />
                </div>
                <span className="input-value">{interestRate}%</span>
              </div>

              <div className="input-group-loans">
                <label>Loan Tenure (Years)</label>
                <div className="input-with-display">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="range-input"
                  />
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="number-input"
                  />
                </div>
                <span className="input-value">{tenure} years</span>
              </div>
            </div>

            <div className="calculator-results">
              <div className="result-card">
                <span className="result-label">Monthly EMI</span>
                <span className="result-value primary">{formatCurrency(emi)}</span>
              </div>
              <div className="result-card">
                <span className="result-label">Total Interest Payable</span>
                <span className="result-value">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="result-card">
                <span className="result-label">Total Amount Payable</span>
                <span className="result-value">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Check Section */}
      <section className="eligibility-section">
        <div className="container-loans">
          <h2 className="section-title-loans">Eligibility Criteria</h2>
          <p className="section-subtitle-loans">Check if you qualify for a home loan</p>

          <div className="eligibility-grid">
            <div className="eligibility-card">
              <div className="eligibility-icon">👤</div>
              <h3>Age</h3>
              <p>21 - 65 years</p>
            </div>
            <div className="eligibility-card">
              <div className="eligibility-icon">💰</div>
              <h3>Minimum Income</h3>
              <p>₹25,000/month for salaried</p>
            </div>
            <div className="eligibility-card">
              <div className="eligibility-icon">📊</div>
              <h3>CIBIL Score</h3>
              <p>700+ preferred</p>
            </div>
            <div className="eligibility-card">
              <div className="eligibility-icon">💼</div>
              <h3>Employment</h3>
              <p>Salaried / Self-employed</p>
            </div>
            <div className="eligibility-card">
              <div className="eligibility-icon">📋</div>
              <h3>Existing EMIs</h3>
              <p>Considered in calculation</p>
            </div>
          </div>

          <div className="eligibility-cta">
            <button 
              className="check-eligibility-btn"
              onClick={() => setShowEligibilityModal(true)}
            >
              Check Eligibility
            </button>
          </div>
        </div>
      </section>

      {/* Documents Required */}
      <section className="documents-section">
        <div className="container-loans">
          <h2 className="section-title-loans">Documents Required</h2>
          <p className="section-subtitle-loans">Keep these documents ready for quick processing</p>

          <div className="documents-grid">
            <div className="documents-column">
              <h3 className="documents-heading">For Salaried</h3>
              <ul className="documents-list">
                <li>✓ Aadhaar & PAN Card</li>
                <li>✓ Last 3 months salary slips</li>
                <li>✓ Bank statements (6 months)</li>
                <li>✓ Property documents</li>
                <li>✓ Form 16</li>
                <li>✓ Employment proof</li>
              </ul>
            </div>
            <div className="documents-column">
              <h3 className="documents-heading">For Self-Employed</h3>
              <ul className="documents-list">
                <li>✓ Aadhaar & PAN Card</li>
                <li>✓ ITR (Last 2-3 years)</li>
                <li>✓ Balance Sheet & P&L</li>
                <li>✓ Bank statements (12 months)</li>
                <li>✓ Property documents</li>
                <li>✓ Business proof</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Process Flow */}
      <section className="process-section">
        <div className="container-loans">
          <h2 className="section-title-loans">Home Loan Process</h2>
          <p className="section-subtitle-loans">Simple 6-step process to get your home loan</p>

          <div className="process-steps">
            {[
              { step: 1, title: 'Apply Online', desc: 'Fill application form' },
              { step: 2, title: 'Document Verification', desc: 'Submit required documents' },
              { step: 3, title: 'Credit & Property Check', desc: 'Bank verifies details' },
              { step: 4, title: 'Loan Sanction', desc: 'Loan approved' },
              { step: 5, title: 'Disbursement', desc: 'Amount transferred' },
              { step: 6, title: 'EMI Starts', desc: 'Begin repayment' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="process-step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="step-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-loans">
        <div className="container-loans">
          <h2>Ready to Get Your Home Loan?</h2>
          <p>Start your home loan journey with Bada Builder today</p>
          <div className="cta-buttons-loans">
            <button className="cta-btn-loans primary" onClick={() => setShowEligibilityModal(true)}>
              Apply for Home Loan
            </button>
            <button className="cta-btn-loans secondary" onClick={() => alert('Talk to expert feature coming soon!')}>
              Talk to Loan Expert
            </button>
            <button className="cta-btn-loans secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Compare All Banks
            </button>
          </div>
        </div>
      </section>

      {/* Eligibility Modal */}
      {showEligibilityModal && (
        <div className="modal-overlay-loans" onClick={() => setShowEligibilityModal(false)}>
          <motion.div 
            className="modal-content-loans"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setShowEligibilityModal(false)}>×</button>
            <h2>Check Eligibility</h2>
            <form onSubmit={handleEligibilityCheck}>
              <div className="form-group-loans">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={eligibilityForm.name}
                  onChange={(e) => setEligibilityForm({...eligibilityForm, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group-loans">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={eligibilityForm.phone}
                  onChange={(e) => setEligibilityForm({...eligibilityForm, phone: e.target.value})}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group-loans">
                <label>Monthly Income *</label>
                <input
                  type="number"
                  required
                  value={eligibilityForm.income}
                  onChange={(e) => setEligibilityForm({...eligibilityForm, income: e.target.value})}
                  placeholder="Enter your monthly income"
                />
              </div>
              <div className="form-group-loans">
                <label>Employment Type *</label>
                <select
                  value={eligibilityForm.employmentType}
                  onChange={(e) => setEligibilityForm({...eligibilityForm, employmentType: e.target.value})}
                >
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-Employed</option>
                </select>
              </div>
              <button type="submit" className="submit-btn-loans">Submit</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HomeLoans;
