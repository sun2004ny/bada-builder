import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png"; // adjust the path as per your project structure

const Footer = () => {
  // Simpler variants that don't hide content initially to ensure visibility
  const socialVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  const linkHover = {
    hover: { x: 5 },
  };

  return (
    <footer className="relative bg-[#020617] !text-white overflow-hidden font-sans border-t border-slate-800">
      {/* Background - Solid Deepest Blue/Slate */}
      <div className="absolute inset-0 bg-[#020617] z-0"></div>

      {/* Container - Full Width as requested */}
      <div className="w-full mx-auto px-6 py-16 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand & Address Section (Span 3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <Link to="/" className="inline-block group outline-none focus:outline-none" style={{ border: 'none', outline: 'none', boxShadow: 'none' }}>
              <motion.img
                src={logo}
                alt="Logo"
                className="h-10 md:h-12 object-contain brightness-0 invert border-none outline-none"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                whileHover={{ scale: 1.05 }}
              />
            </Link>
            <p className="!text-white text-sm leading-relaxed max-w-sm font-medium">
              Designing dreams into reality. From concept to creation, we deliver elegant and functional spaces that reflect your vision.
            </p>

            <div className="space-y-4 pt-4">
              <div className="group flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-600 !text-blue-300 group-hover:bg-slate-700 group-hover:text-white transition-colors shrink-0">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div className="text-sm !text-white leading-snug">
                  <p className="font-bold !text-white mb-1">Corporate Office</p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Lalita+Tower+Nr+Vadodara+Railway+Station+Vadodara+Gujarat+390020"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:!text-blue-300 transition-colors font-medium hover:underline !text-white"
                  >
                    510 Lalita Tower, Nr. Vadodara Railway Station,<br />
                    Vadodara, Gujarat - 390020
                  </a>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              {[
                { Icon: FaInstagram, link: "https://instagram.com", label: "Instagram" },
                { Icon: FaFacebookF, link: "https://facebook.com", label: "Facebook" },
                { Icon: FaLinkedinIn, link: "https://linkedin.com", label: "LinkedIn" },
                { Icon: FaYoutube, link: "https://youtube.com", label: "YouTube" },
              ].map(({ Icon, link, label }, index) => (
                <motion.a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-600 !text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-sm"
                  aria-label={label}
                  variants={socialVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={18} />
                </motion.a>
              ))}

              {/* Refer & Earn CTA - Moved here */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="shrink-0"
              >
                <Link
                  to="/refer-earn"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300/60 hover:shadow-emerald-400/50 transition-all duration-200 h-10"
                >
                  REFER &amp; EARN
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Quick Links (Span 2 cols) */}
          <div className="lg:col-span-2 lg:pl-4">
            <h3 className="text-lg font-bold !text-white mb-6 border-b-2 border-slate-700 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/book-visit", label: "Book a Site Visit" },
                { to: "/exhibition/individual", label: "Exhibition" },
                { to: "/services", label: "Services" },
                { to: "/subscription-plans", label: "Pricing" },
                { to: "/contact", label: "Contact Us" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="!text-white text-[15px] flex items-center group transition-colors hover:!text-blue-300 font-medium"
                  >
                    <motion.span variants={linkHover} whileHover="hover" className="flex items-center w-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 shrink-0" />
                      <span className="!text-white group-hover:!text-blue-300 transition-colors">{link.label}</span>
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources (Span 2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold !text-white mb-6 border-b-2 border-slate-700 pb-2 inline-block">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/post-property", label: "Post Property" },
                { to: "/exhibition/live-grouping", label: "Live Grouping" },
                { to: "/investments", label: "Investments" },
                { to: "/register-complaint", label: "Register Complaints" },
                { to: "/login", label: "Login / Sign Up" },
                { to: "/about", label: "About Us" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="!text-white text-[15px] flex items-center group transition-colors hover:!text-blue-300 font-medium"
                  >
                    <motion.span variants={linkHover} whileHover="hover" className="flex items-center w-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 shrink-0" />
                      <span className="!text-white group-hover:!text-blue-300 transition-colors">{link.label}</span>
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn REITs (Span 2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold !text-white mb-6 border-b-2 border-slate-700 pb-2 inline-block">
              Learn REITs
            </h3>
            <ul className="space-y-3">
              {[
                "Lease & Asset Management",
                "Market & Investment Analysis",
                "Financial Modelling",
                "Market Research",
                "Valuation & Compliance",
                "Risk Assessment",
                "Stakeholder Communication",
                "Types of REITs",
                "Taxation in REITs",
                "Job Profiles",
              ].map((label, idx) => {
                let slug = label.toLowerCase()
                  .replace(/ & /g, '-and-')
                  .replace(/ /g, '-')
                  .replace('types-of-reits', 'types-of-reits-india')
                  .replace('risk-assessment', 'risk-assessment-due-diligence')
                  .replace('financial-modelling', 'real-estate-financial-modelling')
                  .replace('market-research', 'real-estate-market-research')
                  .replace('valuation-and-compliance', 'reit-valuation-and-compliance')
                  .replace('job-profiles', 'job-profiles-in-reits');

                if (label === "Lease & Asset Management") slug = "lease-and-asset-management";
                if (label === "Market & Investment Analysis") slug = "market-and-investment-analysis";

                return (
                  <li key={idx}>
                    <Link
                      to={`/learn/${slug}`}
                      className="!text-white text-[15px] flex items-start group transition-colors hover:!text-blue-300 font-medium"
                    >
                      <motion.span variants={linkHover} whileHover="hover" className="flex items-center w-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 mt-1.5 shrink-0" />
                        <span className="flex-1 !text-white group-hover:!text-blue-300 transition-colors">{label}</span>
                      </motion.span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Calculators (Span 3 cols - slightly wider) */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-bold !text-white mb-6 border-b-2 border-slate-700 pb-2 inline-block">
              Calculators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-4 gap-y-6">
              {/* Performance */}
              <div className="space-y-2">
                <h4 className="text-[11px] uppercase font-bold !text-blue-300 tracking-wider mb-2">Performance</h4>
                <ul className="space-y-1.5">
                  {["FFO", "AFFO", "NOI", "EBITDAre", "Occupancy"].map((item, i) => (
                    <li key={i}>
                      <Link to={`/calculator/${item === 'Occupancy' ? 'OccupancyRate' : item}`}
                        className="text-xs !text-white hover:!text-blue-300 transition-colors block py-0.5 hover:translate-x-1 duration-200 font-medium"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Valuation */}
              <div className="space-y-2">
                <h4 className="text-[11px] uppercase font-bold !text-blue-300 tracking-wider mb-2">Valuation</h4>
                <ul className="space-y-1.5">
                  {["Cap Rate", "NAV", "P/FFO", "DCF", "NPV", "LTV", "DSCR"].map((item, i) => {
                    const slug = item.replace(/ /g, '').replace('/', '');
                    return (
                      <li key={i}>
                        <Link to={`/calculator/${slug}`}
                          className="text-xs !text-white hover:!text-blue-300 transition-colors block py-0.5 hover:translate-x-1 duration-200 font-medium"
                        >
                          {item}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Investment */}
              <div className="col-span-2 border-t border-slate-700 pt-4 mt-2">
                <h4 className="text-[11px] uppercase font-bold !text-blue-300 tracking-wider mb-2">Investment</h4>
                <ul className="grid grid-cols-2 gap-2 text-xs text-white">
                  <li><Link to="/calculator/DividendYield" className="hover:!text-blue-300 transition-colors hover:translate-x-1 duration-200 block font-medium !text-white">Yield</Link></li>
                  <li><Link to="/calculator/PayoutRatio" className="hover:!text-blue-300 transition-colors hover:translate-x-1 duration-200 block font-medium !text-white">Payout</Link></li>
                  <li><Link to="/calculator/IRR" className="hover:!text-blue-300 transition-colors hover:translate-x-1 duration-200 block font-medium !text-white">IRR</Link></li>
                  <li><Link to="/calculator/TotalReturn" className="hover:!text-blue-300 transition-colors hover:translate-x-1 duration-200 block font-medium !text-white">Return</Link></li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-slate-800 bg-[#020617]">
        <div className="w-full mx-auto px-6 py-6 md:px-12 lg:px-20 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs !text-slate-300">
          <p className="!text-slate-300">
            © {new Date().getFullYear()} Bada Builder. All rights reserved.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex space-x-6">
              <Link
                to="/privacy-policy"
                className="hover:!text-white transition-colors !text-slate-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="hover:!text-white transition-colors !text-slate-300"
              >
                Terms of Service
              </Link>
              <Link
                to="/sitemap"
                className="hover:!text-white transition-colors !text-slate-300"
              >
                Sitemap
              </Link>
            </div>


          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
