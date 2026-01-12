import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaBuilding,
  FaHome,
  FaLaptopHouse,
  FaUsers,
  FaMapMarkedAlt,
  FaArrowRight,
  FaStore,
  FaBriefcase,
  FaWarehouse,
  FaIndustry,
  FaStoreAlt,
  FaRegBuilding,
  FaServer
} from 'react-icons/fa';

const investmentsData = [
  {
    id: 'data-centres',
    title: 'Data Centres',
    icon: <FaServer className="text-3xl" />,
    description: 'Invest in cutting-edge data centre infrastructure with stable returns and institutional-grade assets.',
    subCategories: [],
    bgGradient: 'from-indigo-50 to-white',
    hoverBorder: 'hover:border-indigo-400',
    iconColor: 'text-indigo-600',
    buttonColor: 'text-indigo-700',
    featured: true
  },
  {
    id: 'commercial',
    title: 'Commercial',
    icon: <FaBuilding className="text-3xl" />, // Icon top-left
    description: 'High-yield commercial properties perfect for business expansion or rental income.',
    subCategories: [
      { name: 'Shops', type: 'shop', icon: <FaStore /> },
      { name: 'Offices', type: 'office', icon: <FaBriefcase /> },
      { name: 'Godowns', type: 'godown', icon: <FaWarehouse /> },
      { name: 'Warehouses', type: 'warehouse', icon: <FaIndustry /> },
      { name: 'Showrooms', type: 'showroom', icon: <FaStoreAlt /> },
    ],
    bgGradient: 'from-blue-50 to-white',
    hoverBorder: 'hover:border-blue-400',
    iconColor: 'text-blue-600',
    buttonColor: 'group-hover:bg-blue-50 group-hover:border-blue-200 text-blue-700'
  },
  {
    id: 'residential',
    title: 'Residential',
    icon: <FaHome className="text-3xl" />,
    description: 'Premium homes offering comfort, security, and long-term appreciation.',
    subCategories: [
      { name: 'Flats', type: 'flat', icon: <FaRegBuilding /> },
      { name: 'Bungalows', type: 'bungalow', icon: <FaHome /> },
    ],
    bgGradient: 'from-green-50 to-white',
    hoverBorder: 'hover:border-green-400',
    iconColor: 'text-green-600',
    buttonColor: 'group-hover:bg-green-50 group-hover:border-green-200 text-green-700'
  },
  {
    id: 'co-working',
    title: 'Co-Working Space',
    icon: <FaLaptopHouse className="text-3xl" />,
    description: 'Modern shared workspaces designed for startups, freelancers, and remote teams.',
    subCategories: [],
    bgGradient: 'from-purple-50 to-white',
    hoverBorder: 'hover:border-purple-400',
    iconColor: 'text-purple-600',
    buttonColor: 'text-purple-700'
  },
  {
    id: 'co-living',
    title: 'Co-Living Space',
    icon: <FaUsers className="text-3xl" />,
    description: 'Community-centric living spaces with shared amenities and vibrant environments.',
    subCategories: [],
    bgGradient: 'from-orange-50 to-white',
    hoverBorder: 'hover:border-orange-400',
    iconColor: 'text-orange-600',
    buttonColor: 'text-orange-700'
  },
  {
    id: 'land',
    title: 'Land',
    icon: <FaMapMarkedAlt className="text-3xl" />,
    description: 'Strategic land plots for development, farming, or long-term investment.',
    subCategories: [],
    bgGradient: 'from-amber-50 to-white',
    hoverBorder: 'hover:border-amber-400',
    iconColor: 'text-amber-600',
    buttonColor: 'text-amber-700'
  },
];

const Investments = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto text-center mb-20">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Investment Opportunities
        </motion.h1>
        <motion.p
          className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Curated real estate assets for maximum returns. Choose your path to wealth creation.
        </motion.p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {investmentsData.map((category, index) => (
          <motion.div
            key={category.id}
            className={`
              relative bg-white rounded-3xl p-8 
              shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] 
              hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] 
              transition-all duration-500 ease-out 
              border border-transparent ${category.hoverBorder}
              group overflow-hidden flex flex-col
            `}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-30 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Header: Icon TL, Arrow TR */}
            <div className="relative z-10 flex items-start justify-between mb-6">
              <div className={`p-3 rounded-2xl bg-white shadow-sm ${category.iconColor}`}>
                {category.icon}
              </div>
              <Link
                to={`/search?category=${category.id}`}
                className={`
                  p-2 rounded-full transition-transform duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1
                  ${category.iconColor} hover:bg-white/50
                `}
              >
                <FaArrowRight size={20} />
              </Link>
            </div>

            {/* Title & Description */}
            <div className="relative z-10 mb-8 flex-grow">
              <Link to={`/search?category=${category.id}`} className="block">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-black transition-colors">
                  {category.title}
                </h3>
              </Link>
              <p className="text-gray-600 leading-relaxed">
                {category.description}
              </p>
            </div>

            {/* Sub-categories (Big Buttons) */}
            {category.subCategories.length > 0 ? (
              <div className="relative z-10 grid gap-3 grid-cols-1 sm:grid-cols-2">
                {category.subCategories.map((sub) => (
                  <Link
                    key={sub.name}
                    to={`/investments/${sub.type}`}
                  >
                    <motion.div
                      className={`
                            flex items-center justify-center gap-3 w-full h-14 
                            rounded-full border border-gray-200 bg-white
                            font-semibold text-gray-700 shadow-sm
                            hover:shadow-md transition-all duration-200
                            ${category.buttonColor} hover:border-current
                        `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-lg">{sub.icon}</span>
                      <span>{sub.name}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              // Fallback for categories without sub-items (e.g. Co-Working, Data Centres)
              <div className="relative z-10 mt-auto">
                <Link to={category.id === 'data-centres' ? '/investments/data-centres' : `/search?category=${category.id}`}>
                  <motion.button
                    className={`
                                w-full h-14 rounded-full border border-gray-200 bg-white
                                font-semibold text-gray-700 shadow-sm flex items-center justify-center gap-2
                                hover:shadow-md transition-all duration-200
                                ${category.buttonColor} hover:border-current
                            `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Explore {category.title}</span>
                    <FaArrowRight />
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Investments;
