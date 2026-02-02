import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
// TODO: Implement with liveGroupingAPI.getById()
import { liveGroupDynamicAPI } from '../../services/api';
import { calculateTokenAmount, formatCurrency, calculatePriceRange, formatPriceRange } from '../../utils/liveGroupingCalculations';
import PropertyMap from '../../components/Map/PropertyMap';
// import './LiveGroupingDetails.css'; // Removed in favor of Tailwind

const LiveGroupingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await liveGroupDynamicAPI.getFullHierarchy(id);
        const project = data.project;

        if (project) {
          const processedProject = {
            ...project,
            title: project.title || 'Untitled Project',
            location: project.location || project.map_address || 'Location not specified',
            images: project.images || (project.image ? [project.image] : ['/placeholder-property.jpg']),

            // Map Form Fields
            builder_name: project.builder_name || project.developer || '',
            property_type: project.property_type || project.type || '',
            unit_configuration: project.unit_configuration || '',
            description: project.description || 'No description available.',

            // Progress
            filledSlots: project.filled_slots || 0,
            totalSlots: project.total_slots || 0, // Using total_slots as target participants
            minBuyers: project.min_buyers || 0,

            // Timers & Status
            timeLeft: project.offer_expiry_datetime ? new Date(project.offer_expiry_datetime).toLocaleDateString() : (project.time_left || 'Limited Time'),
            status: project.status || 'live',

            // Plot Specifics
            road_width: project.road_width,
            plot_gap: project.plot_gap,

            // Pricing Mappings
            pricePerSqFt: parseFloat(project.regular_price_per_sqft) || parseFloat(project.price_min_reg) || 0,
            pricePerSqFtMax: parseFloat(project.regular_price_per_sqft_max) || parseFloat(project.price_max_reg) || null,
            groupPricePerSqFt: parseFloat(project.group_price_per_sqft) || parseFloat(project.price_min_disc) || 0,
            groupPricePerSqFtMax: parseFloat(project.group_price_per_sqft_max) || parseFloat(project.price_max_disc) || null,

            totalSavingsMin: parseFloat(project.total_savings_min) || null,
            totalSavingsMax: parseFloat(project.total_savings_max) || null,

            regular_price_min: project.regular_price_min,
            regular_price_max: project.regular_price_max,
            discounted_total_price_min: project.discounted_total_price_min,
            discounted_total_price_max: project.discounted_total_price_max,

            latitude: project.latitude,
            longitude: project.longitude,
            map_address: project.map_address,
          };
          setProperty(processedProject);
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading property details...</h2>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="not-found">
        <h2>Property Not Found</h2>
        <button onClick={() => navigate('/exhibition/live-grouping')}>
          Back to Live Grouping
        </button>
      </div>
    );
  }

  const getProgressPercentage = (filled, total) => {
    return (filled / total) * 100;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50, damping: 20 }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#16a34a';
      case 'closing':
        return '#f59e0b';
      case 'closed':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const handleJoinGroup = () => {
    // Navigate to 3D view to join the group
    navigate('/exhibition/3d-view', { state: { property: property } });
  };

  const handleDownloadBrochure = () => {
    if (property.brochure_url) {
      // Open in new tab for PDFs, more reliable across origins
      window.open(property.brochure_url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Brochure not available for this project.');
    }
  };

  const developerSection = property.builder_name && (
    <Motion.div
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
      variants={itemVariants}
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)" }}
    >
      <h2 className="text-xl font-bold text-slate-900 mb-4">Developer</h2>
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-slate-100 transition-colors">
        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-3xl border border-slate-100 group-hover:scale-110 transition-transform duration-300">🏢</div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{property.builder_name}</h3>
          <p className="text-slate-500 text-sm">Trusted Real Estate Developer</p>
        </div>
      </div>
    </Motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-all mb-6 shadow-sm"
          onClick={() => navigate('/exhibition/live-grouping')}
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Live Grouping
        </button>

        {/* Image Gallery */}
        <Motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative w-full h-64 md:h-[500px] rounded-2xl overflow-hidden shadow-xl mb-4 group cursor-pointer">
            <Motion.img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.8 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <Motion.span
                className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE GROUP
              </Motion.span>
              {property.discount && <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">{property.discount}</span>}
              <span className="bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 border border-white/10">⏰ {property.timeLeft}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {property.images.slice(1).map((img, idx) => (
              <Motion.img
                key={idx}
                src={img}
                alt={`View ${idx + 2}`}
                className="w-full h-20 md:h-24 object-cover rounded-xl cursor-pointer border border-slate-200 shadow-sm"
                whileHover={{ scale: 1.1, zIndex: 10, borderColor: "#7c3aed" }}
              />
            ))}
          </div>
        </Motion.div>

        {/* Main Content Grid */}
        <Motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Card */}
            <Motion.div
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200"
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)" }}
            >
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">{property.title}</h1>
              <p className="text-slate-500 text-lg mb-6 flex items-center gap-2">
                <span>📍</span> {property.location}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-slate-50 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 hover:bg-slate-100 transition-colors">{property.property_type}</span>
                {property.unit_configuration && <span className="bg-slate-50 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 hover:bg-slate-100 transition-colors">{property.unit_configuration}</span>}
                {property.area && <span className="bg-slate-50 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 hover:bg-slate-100 transition-colors">{property.area} Sq Ft</span>}
              </div>
            </Motion.div>

            {/* Progress Section */}
            <Motion.div
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200"
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)" }}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>🚀</span> Group Buying Progress
              </h2>
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                <div className="text-center p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-100 transform transition-transform hover:scale-105">
                  <span className="block text-lg md:text-2xl font-bold text-blue-700 mb-1">{property.filledSlots}/{property.totalSlots}</span>
                  <span className="text-[10px] md:text-xs text-blue-600 font-bold uppercase tracking-wider">Buyers Joined</span>
                </div>
                <div className="text-center p-3 md:p-4 bg-indigo-50 rounded-xl border border-indigo-100 transform transition-transform hover:scale-105">
                  <span className="block text-lg md:text-2xl font-bold text-indigo-700 mb-1">{property.minBuyers}</span>
                  <span className="text-[10px] md:text-xs text-indigo-600 font-bold uppercase tracking-wider">Min Required</span>
                </div>
                <div className="text-center p-3 md:p-4 bg-orange-50 rounded-xl border border-orange-100 transform transition-transform hover:scale-105">
                  <span className="block text-lg md:text-2xl font-bold text-orange-700 mb-1 break-words">{property.timeLeft}</span>
                  <span className="text-[10px] md:text-xs text-orange-600 font-bold uppercase tracking-wider">Time Left</span>
                </div>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-3 shadow-inner">
                <Motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    width: `${getProgressPercentage(property.filledSlots, property.totalSlots)}%`,
                    backgroundColor: getStatusColor(property.status)
                  }}
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${getProgressPercentage(property.filledSlots, property.totalSlots)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                </Motion.div>
              </div>
              <p className="text-center text-slate-500 font-medium text-sm">
                {property.totalSlots - property.filledSlots} slots remaining to close this group
              </p>
            </Motion.div>

            {/* Developer Section - Desktop Only */}
            <div className="hidden lg:block">
              {developerSection}
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 relative">
            <Motion.div
              className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 sticky top-24"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🏷️</span> Group Buying Price
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm" style={{ backgroundColor: getStatusColor(property.status) }}>
                  {property.status === 'closing' ? 'Closing Soon' : 'Active'}
                </span>
              </div>

              {/* VISUAL PRICING STACK */}
              <div className="space-y-4 mb-6">
                {/* Regular Price */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Regular Price (Per Sq Ft)</div>
                  <div className="flex justify-between items-center text-slate-400 line-through font-semibold text-sm">
                    <span>{property.pricePerSqFt ? `₹${property.pricePerSqFt.toLocaleString()}` : ''}</span>
                    <span>{property.pricePerSqFtMax ? `₹${property.pricePerSqFtMax.toLocaleString()}` : ''}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2"></div>
                </div>

                {/* Live Group Price -- Highlighted */}
                <Motion.div
                  className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 relative overflow-hidden shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-200">LIVE OFFER</div>
                  <div className="text-xs font-bold text-emerald-700 uppercase mb-2 flex items-center gap-1">
                    <span className="animate-pulse">●</span> Live Group Price (Per Sq Ft)
                  </div>
                  <div className="flex justify-between items-center text-emerald-800 font-extrabold text-xl tracking-tight">
                    <span>{property.groupPricePerSqFt ? `₹${property.groupPricePerSqFt.toLocaleString()}` : ''}</span>
                    <span>{property.groupPricePerSqFtMax ? `₹${property.groupPricePerSqFtMax.toLocaleString()}` : ''}</span>
                  </div>
                  <div className="h-2.5 w-full bg-emerald-200 rounded-full mt-3 overflow-hidden">
                    <Motion.div
                      className="h-full w-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </Motion.div>
              </div>


              {/* Total Range */}
              <div className="mb-6 space-y-3">
                {/* Regular Unit Price - Now with visual bar */}
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 opacity-90">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-1">
                    <span>Regular Unit Price:</span>
                    <span className="line-through decoration-slate-400">
                      {property.regular_price_min ? `₹${(parseFloat(property.regular_price_min) / 100000).toFixed(2)}L` : 'N/A'}
                      {property.regular_price_max ? ` - ${(parseFloat(property.regular_price_max) / 100000).toFixed(2)}L` : ''}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 w-full" />
                  </div>
                </div>

                {/* Group Total */}
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-800 mb-1">
                    <span>Live Group Price:</span>
                    <span className="text-emerald-700 text-lg">
                      {property.discounted_total_price_min ? `₹${(parseFloat(property.discounted_total_price_min) / 100000).toFixed(2)}L` : 'N/A'}
                      {property.discounted_total_price_max ? ` - ${(parseFloat(property.discounted_total_price_max) / 100000).toFixed(2)}L` : ''}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden">
                    <Motion.div
                      className="h-full bg-emerald-500"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Savings */}
                {(property.totalSavingsMin || property.totalSavingsMax) && (
                  <Motion.div
                    className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between text-sm font-bold mb-1">
                      <span>💰 Total Savings:</span>
                      <span className="text-lg">
                        {property.totalSavingsMin ? `₹${property.totalSavingsMin.toLocaleString()}` : ''}
                        {property.totalSavingsMax ? ` - ₹${property.totalSavingsMax.toLocaleString()}` : ''}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-blue-200 rounded-full overflow-hidden">
                      <Motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </Motion.div>
                )}
              </div>

              <div className="flex items-center justify-center p-2 mb-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs text-slate-500 italic">
                💡 Final price depends on unit & area selected
              </div>

              <div className="space-y-4 pt-2">
                <Motion.button
                  onClick={handleJoinGroup}
                  disabled={property.status === 'closed'}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] py-4 font-bold text-white shadow-xl shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundPosition: ["0% 0%", "200% 0%"]
                  }}
                  transition={{
                    backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 0.5 }
                  }}
                >
                  {/* Shimmer Effect Overlay */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />

                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <Motion.span
                      className="text-2xl"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      🏢
                    </Motion.span>
                    <span className="tracking-wide text-lg text-shadow-sm">
                      {property.status === 'closing' ? '⚡ Join Now - Closing Soon!' : property.status === 'closed' ? 'Group Closed' : 'Join This Group'}
                    </span>
                  </div>
                </Motion.button>

                <Motion.button
                  onClick={handleDownloadBrochure}
                  className="w-full rounded-xl border border-indigo-200 bg-indigo-100 py-3.5 font-bold text-indigo-800 transition-all hover:bg-indigo-200 hover:text-indigo-900 flex items-center justify-center gap-2 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>📥</span> Download Brochure
                </Motion.button>

                <Motion.button
                  onClick={() => navigate('/book-visit', { state: { property: { ...property, type: 'grouping-details' } } })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-200 py-3.5 font-semibold text-slate-800 transition-all hover:bg-slate-300 hover:text-slate-900 flex items-center justify-center gap-2 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>📞</span> Book Site Visit
                </Motion.button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6">
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-slate-50 rounded-lg">
                  <span className="text-lg">🔒</span>
                  <span className="text-[10px] font-bold text-slate-500 leading-tight">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-slate-50 rounded-lg">
                  <span className="text-lg">✅</span>
                  <span className="text-[10px] font-bold text-slate-500 leading-tight">RERA Verified</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-slate-50 rounded-lg">
                  <span className="text-lg">💯</span>
                  <span className="text-[10px] font-bold text-slate-500 leading-tight">100% Refund</span>
                </div>
              </div>

            </Motion.div>
          </div>

          {/* Developer Section - Mobile Only (Appears last) */}
          <div className="lg:hidden">
            {developerSection}
          </div>
        </Motion.div>
      </div>
    </div>
  );

};

export default LiveGroupingDetails;
