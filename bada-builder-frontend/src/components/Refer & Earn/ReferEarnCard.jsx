import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiShare2 } from 'react-icons/fi';

const ReferEarnCard = ({ property }) => {
    // Utility to format price in Indian numbering system
    const formatPrice = (price) => {
        if (!price || price === 'Price on Request') return 'Price on Request';
        // Clean the price string from any existing symbols or commas
        const num = parseFloat(price.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return price;

        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    const formattedPrice = formatPrice(property.price);

    // Extract real ID
    const realId = property.id.toString().split('-').pop();
    const propertyLink = `${window.location.origin}/property-details/${realId}`;

    const handleShare = async (e) => {
        e.stopPropagation();

        // sharing ONLY the link to allow WhatsApp/Social Media to fetch rich OG previews
        const shareData = {
            title: property.title,
            text: `Check out this amazing property: ${property.title}`,
            url: propertyLink,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Web Share not supported');
            }
        } catch (err) {
            console.error('Share failed:', err);
            try {
                // Fallback: Copy link to clipboard
                await navigator.clipboard.writeText(propertyLink);
                alert('Property link copied to clipboard!');
            } catch (copyErr) {
                console.error('Fallback copy failed:', copyErr);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{
                y: -6,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full max-w-[340px] mx-auto"
        >
            {/* 1️⃣ Image Section (Compact - 160px height) */}
            <div className="relative h-40 w-full overflow-hidden">
                <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />

                {/* Property Type Badge (Top-Left) */}
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-slate-800 text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                        {property.type.split(' ')[0]}
                    </span>
                </div>
            </div>

            {/* 2️⃣ Content Section (Minimal & Clean) - 16px Padding */}
            <div className="p-4 flex flex-col flex-grow bg-white">
                {/* Row 1: Inline Layout (Name + Small Tag) */}
                <div className="mb-1">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {property.title}
                    </h3>
                </div>

                {/* Row 2: Location (Muted) */}
                <div className="flex items-center gap-1 text-slate-500 mb-2.5">
                    <FiMapPin size={10} className="text-emerald-500" />
                    <span className="text-[11px] uppercase tracking-wider font-bold italic opacity-70">{property.location}</span>
                </div>

                {/* Row 3: Price Only (Big & Bold - The Highlight) */}
                <div className="mb-4">
                    <p className="text-2xl font-black text-emerald-600 tracking-tight">
                        {formattedPrice}
                    </p>
                </div>

                {/* 3️⃣ CTA Button (Modern Style - Slightly smaller) */}
                <motion.button
                    whileHover={{
                        scale: 1.02,
                        filter: "brightness(1.05)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-auto"
                >
                    <FiShare2 size={13} className="text-white" />
                    <span>Refer & Earn</span>
                </motion.button>
            </div>

            {/* Internal spacing adjustment to reach ~35% whitespace reduction */}
            {/* The layout is now extremely tight and data-focused */}
        </motion.div>
    );
};

export default ReferEarnCard;
