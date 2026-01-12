import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import logo from "../../assets/logo.png"; // adjust the path as per your project structure
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="custom-footer text-white py-10 px-6 md:px-20 border-t border-white/5">
      <div className="footer-grid max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Updated Logo Section */}
        <div className="footer-section">
          <div className="footer-logo-container mb-4">
            <Link to="/" className="footer-logo-link">
              <img src={logo} alt="Logo" className="footer-logo-image h-10" />
            </Link>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Designing dreams into reality. From concept to creation, we deliver elegant and functional spaces that reflect your vision.
          </p>

          <div className="flex space-x-4 mt-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon hover:scale-110 transition-transform"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon hover:scale-110 transition-transform"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon hover:scale-110 transition-transform"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon hover:scale-110 transition-transform"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-section-title text-lg font-medium mb-4">Quick Links</h3>
          <ul className="footer-link-list space-y-2 text-gray-400 text-sm">
            <li><Link to="/book-visit" className="footer-link hover:text-white transition-colors">Book a Site Visit</Link></li>
            <li><Link to="/exhibition/individual" className="footer-link hover:text-white transition-colors">Exhibition</Link></li>
            <li><Link to="/services" className="footer-link hover:text-white transition-colors">Services</Link></li>
            <li><Link to="/subscription-plans" className="footer-link hover:text-white transition-colors">Pricing</Link></li>
            <li><Link to="/contact" className="footer-link hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* More Links */}
        <div className="footer-section">
          <h3 className="footer-section-title text-lg font-medium mb-4">Resources</h3>
          <ul className="footer-link-list space-y-2 text-gray-400 text-sm">
            <li><Link to="/post-property" className="footer-link hover:text-white transition-colors">Post Property</Link></li>
            <li><Link to="/exhibition/live-grouping" className="footer-link hover:text-white transition-colors">Live Grouping</Link></li>
            <li><Link to="/investments" className="footer-link hover:text-white transition-colors">Investments</Link></li>
            <li><Link to="/register-complaint" className="footer-link hover:text-white transition-colors">Register Complaints</Link></li>
            <li><Link to="/login" className="footer-link hover:text-white transition-colors">Login / Sign Up</Link></li>
            <li><Link to="/about" className="footer-link hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>

        {/* Learn REITs */}
        <div className="footer-section">
          <h3 className="footer-section-title text-lg font-medium mb-4">Learn REITs</h3>
          <ul className="footer-link-list space-y-2 text-gray-400 text-sm">
            <li><Link to="/learn/lease-and-asset-management" className="footer-link hover:text-white transition-colors">Lease & Asset Management</Link></li>
            <li><Link to="/learn/market-and-investment-analysis" className="footer-link hover:text-white transition-colors">Market & Investment Analysis</Link></li>
            <li><Link to="/learn/real-estate-financial-modelling" className="footer-link hover:text-white transition-colors">Financial Modelling</Link></li>
            <li><Link to="/learn/real-estate-market-research" className="footer-link hover:text-white transition-colors">Market Research</Link></li>
            <li><Link to="/learn/reit-valuation-and-compliance" className="footer-link hover:text-white transition-colors">Valuation & Compliance</Link></li>
            <li><Link to="/learn/risk-assessment-due-diligence" className="footer-link hover:text-white transition-colors">Risk Assessment</Link></li>
            <li><Link to="/learn/stakeholder-communication" className="footer-link hover:text-white transition-colors">Stakeholder Communication</Link></li>
            <li><Link to="/learn/types-of-reits-india" className="footer-link hover:text-white transition-colors">Types of REITs</Link></li>
            <li><Link to="/learn/taxation-in-reits" className="footer-link hover:text-white transition-colors">Taxation in REITs</Link></li>
            <li><Link to="/learn/job-profiles-in-reits" className="footer-link hover:text-white transition-colors">Job Profiles</Link></li>
          </ul>
        </div>

        {/* Calculator Links */}
        <div className="footer-section">
          <h3 className="footer-section-title text-lg font-medium mb-4">Calculators</h3>
          <div className="flex flex-col space-y-4">
            <div className="footer-calculator-group">
              <h4 className="footer-calculator-title text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Performance</h4>
              <ul className="footer-link-list space-y-1 text-gray-400 text-xs">
                <li><Link to="/calculator/FFO" className="footer-link hover:text-white transition-colors">FFO</Link></li>
                <li><Link to="/calculator/AFFO" className="footer-link hover:text-white transition-colors">AFFO</Link></li>
                <li><Link to="/calculator/NOI" className="footer-link hover:text-white transition-colors">NOI</Link></li>
                <li><Link to="/calculator/EBITDAre" className="footer-link hover:text-white transition-colors">EBITDAre</Link></li>
                <li><Link to="/calculator/OccupancyRate" className="footer-link hover:text-white transition-colors">Occupancy Rate</Link></li>
              </ul>
            </div>
            <div className="footer-calculator-group">
              <h4 className="footer-calculator-title text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valuation & Finance</h4>
              <ul className="footer-link-list space-y-1 text-gray-400 text-xs">
                <li><Link to="/calculator/CapRate" className="footer-link hover:text-white transition-colors">Cap Rate</Link></li>
                <li><Link to="/calculator/NAV" className="footer-link hover:text-white transition-colors">NAV</Link></li>
                <li><Link to="/calculator/PFFO" className="footer-link hover:text-white transition-colors">P/FFO Ratio</Link></li>
                <li><Link to="/calculator/DCF" className="footer-link hover:text-white transition-colors">DCF</Link></li>
                <li><Link to="/calculator/NPV" className="footer-link hover:text-white transition-colors">NPV</Link></li>
                <li><Link to="/calculator/LTV" className="footer-link hover:text-white transition-colors">LTV Ratio</Link></li>
                <li><Link to="/calculator/DSCR" className="footer-link hover:text-white transition-colors">DSCR</Link></li>
              </ul>
            </div>
            <div className="footer-calculator-group">
              <h4 className="footer-calculator-title text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Investment</h4>
              <ul className="footer-link-list space-y-1 text-gray-400 text-xs">
                <li><Link to="/calculator/DividendYield" className="footer-link hover:text-white transition-colors">Dividend Yield</Link></li>
                <li><Link to="/calculator/PayoutRatio" className="footer-link hover:text-white transition-colors">Payout Ratio</Link></li>
                <li><Link to="/calculator/IRR" className="footer-link hover:text-white transition-colors">IRR</Link></li>
                <li><Link to="/calculator/TotalReturn" className="footer-link hover:text-white transition-colors">Total Return</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Bada Builder. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
