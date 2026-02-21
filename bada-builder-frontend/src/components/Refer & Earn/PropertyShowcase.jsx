import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { referEarnAPI } from '../../services/api';
import ReferEarnCard from './ReferEarnCard';

const PropertyShowcase = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both types of referral properties
                const [postedData, activeData] = await Promise.all([
                    referEarnAPI.getPostedProperties(true),
                    referEarnAPI.getReferralProperty()
                ]);

                // 1. Normalize Isolated Properties (Posted from form)
                const normalizedPosted = (postedData || []).map(p => ({
                    id: `posted-${p.id}`,
                    title: p.property_name,
                    price: p.price,
                    location: p.location,
                    type: p.property_type || 'Property',
                    description: p.description,
                    image: p.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                    source: 'refer-earn', // Unified source for all referral cards
                    isIsolated: true
                }));

                // 2. Normalize Active Selected Main Properties
                const normalizedActive = (activeData || []).map(p => ({
                    id: `main-${p.id}`,
                    title: p.title || p.project_name,
                    price: p.group_price || p.regular_price_min || p.price || 'Price on Request',
                    location: p.location || p.project_location || 'Location Not Specified',
                    type: p.property_type || p.type || 'Property',
                    image: p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                    source: 'refer-earn',
                    isIsolated: false
                }));

                // 3. Merge Both Arrays
                const combined = [...normalizedActive, ...normalizedPosted];
                setProperties(combined);
            } catch (err) {
                console.error('Error fetching referral properties:', err);
                setError('Failed to load referral properties.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error || properties.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md w-full">
                    <div className="text-5xl mb-4">🏠</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No active referral properties available.</h2>
                    <p className="text-gray-500 mb-6">Please check back later or contact support.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold transition-all hover:bg-black"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] py-16 px-4 md:px-0">
            <div className="w-full max-w-[1400px] mx-auto">
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate("/")}
                    className="w-fit flex items-center gap-2 !text-white !bg-[#1e293b] hover:!bg-[#334155] border border-[#334155] py-2 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all duration-300 hover:!text-[#38BDF8] hover:-translate-x-1 shadow-lg relative z-[100] mb-8"
                >
                    <FaArrowLeft className="text-[#38BDF8]" /> Back to Home
                </motion.button>

                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-3">Exclusive Referral Opportunities</h1>
                        <p className="text-slate-500 font-medium max-w-xl">Refer your network and earn premium rewards on these exclusive hand-picked properties featured by Bada Builder.</p>
                    </div>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                    {properties.map((property, index) => (
                        <motion.div
                            key={property.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ReferEarnCard property={property} />
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
                    Bada Builder Premium Referral Protocol v2.0
                </div>
            </div>
        </div>
    );
};

export default PropertyShowcase;
