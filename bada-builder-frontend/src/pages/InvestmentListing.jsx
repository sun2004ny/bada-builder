import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaFilter,
    FaSortAmountDown,
    FaMapMarkerAlt,
    FaRulerCombined,
    FaArrowRight,
    FaCalendarCheck,
    FaRupeeSign,
    FaArrowLeft
} from 'react-icons/fa';

// Mock Data Generator
const generateMockListings = (type) => {
    const types = {
        shop: { title: 'Retail Shop', area: '300-600', return: '6-8%' },
        office: { title: 'Office Space', area: '1000-2500', return: '7-9%' },
        flat: { title: 'Luxury Appt', area: '1200-3000', return: '4-6%' },
        warehouse: { title: 'Warehouse', area: '5000+', return: '8-10%' },
        godown: { title: 'Godown', area: '2000+', return: '7-9%' },
        showroom: { title: 'Showroom', area: '1500-4000', return: '6-8%' },
        bungalow: { title: 'Villa', area: '3000+', return: '5-7%' },
    };

    const base = types[type] || { title: 'Property', area: 'Variable', return: 'Variable' };

    return Array.from({ length: 6 }).map((_, i) => ({
        id: `${type}-${i + 1}`,
        title: `${base.title} ${i + 1}`,
        location: ['Mumbai', 'Bangalore', 'Pune', 'Delhi'][i % 4],
        area: base.area,
        price: (i + 1) * 25 + ' Lakhs',
        minInvestment: (5 + i) + ' Lakhs',
        return: base.return,
        funded: Math.floor(Math.random() * 90) + 10, // 10-99%
        image: `https://source.unsplash.com/random/800x600/?${type},building&sig=${i}`
    }));
};

const InvestmentListing = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setListings(generateMockListings(type));
    }, [type]);

    const handleBookVisit = (item) => {
        navigate('/book-visit', { state: { property: item } });
    };

    const handleInvestNow = (item) => {
        // Navigate to details page and maybe scroll to form?
        // Using hash to potentially trigger scroll or just standard nav
        navigate(`/investment-details/${item.id}#invest`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header & Breadcrumb */}
                <div className="mb-8">
                    <Link to="/investments" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4">
                        <FaArrowLeft className="mr-2" /> Back to Categories
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 capitalize">
                        {type} Investments
                    </h1>
                    <p className="text-gray-500 mt-2">Explore high-yield {type} opportunities.</p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <FaFilter className="text-gray-400" />
                        <span>Filter By:</span>
                    </div>
                    <div className="flex gap-2 text-sm overflow-x-auto pb-2 sm:pb-0">
                        {['All', 'Under 50L', 'High Return', 'Nearly Funded'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f.toLowerCase())}
                                className={`px-4 py-2 rounded-full border transition-all ${filter === f.toLowerCase() ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group"
                        >
                            {/* Image Helper */}
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                <Link to={`/investment-details/${item.id}`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    <div className="absolute bottom-4 left-4 z-20 text-white">
                                        <div className="font-bold text-lg">{item.title}</div>
                                        <div className="text-sm opacity-90 flex items-center gap-1"><FaMapMarkerAlt /> {item.location}</div>
                                    </div>
                                    <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-gray-800">
                                        {item.return} Yield
                                    </div>
                                </Link>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                    <div>
                                        <div className="text-gray-400 text-xs uppercase font-bold">Min Invest</div>
                                        <div className="font-bold text-gray-800">{item.minInvestment}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs uppercase font-bold">Area</div>
                                        <div className="font-bold text-gray-800">{item.area} sq.ft</div>
                                    </div>
                                </div>

                                {/* Funding Progress */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className={item.funded > 80 ? 'text-green-600' : 'text-blue-600'}>{item.funded}% Funded</span>
                                        <span className="text-gray-400">Target Reached</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${item.funded > 80 ? 'bg-green-500' : 'bg-blue-500'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.funded}%` }}
                                            transition={{ duration: 1 }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-auto space-y-2">
                                    {/* Action Buttons Grid */}
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">

                                        {/* View Details */}
                                        <Link to={`/investment-details/${item.id}`} className="w-full">
                                            <button className="w-full h-10 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs xl:text-[10px] 2xl:text-xs">
                                                <span>View Details</span>
                                                <FaArrowRight className="hidden xl:block" />
                                            </button>
                                        </Link>

                                        {/* Book Site Visit */}
                                        <button
                                            onClick={() => handleBookVisit(item)}
                                            className="w-full h-10 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-xs xl:text-[10px] 2xl:text-xs"
                                        >
                                            <FaCalendarCheck />
                                            <span>Book Visit</span>
                                        </button>

                                        {/* Invest Now */}
                                        <button
                                            onClick={() => handleInvestNow(item)}
                                            className="w-full h-10 rounded-lg bg-gray-900 text-white font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-xs xl:text-[10px] 2xl:text-xs"
                                        >
                                            <FaRupeeSign />
                                            <span>Invest Now</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InvestmentListing;
