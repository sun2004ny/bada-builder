import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
    Building2, Layers, Info, Check, Lock, XCircle, ArrowUpRight,
    Home, ShoppingBag, Briefcase, Store, Box, Car, LayoutGrid,
    MoreVertical, Edit, QrCode, FileDown
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const TwoDView = ({ project, onUnitClick, onEditClick, isAdminView = false }) => {
    const [activeMenu, setActiveMenu] = React.useState(null);

    // Close menu when clicking elsewhere
    React.useEffect(() => {
        const handleClick = () => setActiveMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Icon & Color Mapping
    const getUnitConfig = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('flat') || t.includes('apartment')) return { icon: Home, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Flat' };
        if (t.includes('shop')) return { icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Shop' };
        if (t.includes('office')) return { icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Office' };
        if (t.includes('showroom')) return { icon: Store, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Showroom' };
        if (t.includes('basement') || t.includes('storage')) return { icon: Box, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Storage' };
        if (t.includes('parking')) return { icon: Car, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Parking' };
        if (t.includes('plot') || t.includes('land')) return { icon: LayoutGrid, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Plot' };
        return { icon: LayoutGrid, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', label: type || 'Unit' };
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                duration: 0.5
            }
        },
        exit: { opacity: 0 }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    return (
        <motion.div
            className="w-full h-full pb-20 px-4 md:px-8 overflow-y-auto scroll-smooth"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="max-w-7xl mx-auto space-y-8 pt-8">
                {project.towers.map((tower) => (
                    <motion.div
                        key={tower.id}
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                        {/* Tower Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between !text-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Building2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight !text-white">
                                        {(project.type === 'Bungalow' || project.type === 'Colony' || project.type === 'Plot')
                                            ? project.title
                                            : tower.tower_name}
                                    </h2>
                                    <p className="text-sm !text-slate-300 flex items-center gap-2">
                                        <Layers size={14} />
                                        {(project.type === 'Bungalow' || project.type === 'Plot')
                                            ? `${tower.units?.length || 0} ${project.type === 'Plot' ? 'Plots' : 'Bungalows'}`
                                            : `${tower.total_floors} Floors • ${tower.units?.length || 0} Units`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content Container */}
                        <div className="p-4 md:p-6 space-y-4">
                            {(project.type === 'Bungalow' || project.type === 'Plot') ? (
                                /* BUNGALOW/PLOT VIEW: Flat Grid */
                                <div className="flex flex-wrap gap-4">
                                    {tower.units
                                        .sort((a, b) => {
                                            // Numeric sort for B-1, B-2 etc.
                                            const numA = parseInt(a.unit_number.replace(/\D/g, '')) || 0;
                                            const numB = parseInt(b.unit_number.replace(/\D/g, '')) || 0;
                                            return numA - numB;
                                        })
                                        .map((unit) => {
                                            const config = getUnitConfig(unit.unit_type);
                                            return renderUnitCard(unit, config, onUnitClick, isAdminView, activeMenu, setActiveMenu, onEditClick);
                                        })}
                                </div>
                            ) : (
                                /* APARTMENT VIEW: Floor Grouped */
                                Object.entries(
                                    tower.units.reduce((acc, unit) => {
                                        if (!acc[unit.floor_number]) acc[unit.floor_number] = [];
                                        acc[unit.floor_number].push(unit);
                                        return acc;
                                    }, {})
                                ).sort((a, b) => b[0] - a[0]).map(([floor, units]) => (
                                    <div key={floor} className="flex flex-col md:flex-row gap-6 items-start py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors rounded-xl px-3 group/floor">
                                        {/* Floor Label */}
                                        <div className="flex flex-row md:flex-col items-center justify-center gap-3 md:gap-0 min-w-[70px] text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floor</span>
                                            <span className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
                                                {floor === '0' ? 'GF' : floor === '-1' ? 'B' : floor}
                                            </span>
                                        </div>

                                        {/* Units Grid */}
                                        <div className="flex-1 flex flex-wrap gap-4">
                                            {units.sort((a, b) => a.unit_number.localeCompare(b.unit_number)).map((unit) => {
                                                const config = getUnitConfig(unit.unit_type);
                                                return renderUnitCard(unit, config, onUnitClick, isAdminView, activeMenu, setActiveMenu, onEditClick);
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

// Extracted Unit Card Renderer for Reusability
const renderUnitCard = (unit, config, onUnitClick, isAdminView, activeMenu, setActiveMenu, onEditClick) => {
    const TypeIcon = config.icon;
    let statusOverlay = null;
    let interactivityClasses = "cursor-pointer hover:scale-105 shadow-sm hover:shadow-md";

    if (unit.status === 'booked') {
        statusOverlay = (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10">
                <div className="rotate-[-15deg] border-2 border-rose-500 text-rose-500 font-black text-[10px] px-1 rounded uppercase">Sold</div>
            </div>
        );
        interactivityClasses = "cursor-not-allowed opacity-60";
    } else if (unit.status === 'locked') {
        statusOverlay = (
            <div className="absolute top-1 right-1 bg-amber-500 text-white p-0.5 rounded-full z-10 shadow-sm">
                <Lock size={10} />
            </div>
        );
    }

    console.log(`🗂️ Rendering Unit Card: ${unit.unit_number}`, {
        hasImageUrl: !!unit.unit_image_url,
        imageUrl: unit.unit_image_url,
        status: unit.status
    });

    return (
        <motion.button
            key={unit.id}
            className={`relative group/unit w-24 h-28 md:w-28 md:h-32 flex flex-col items-center justify-between p-3 rounded-2xl transition-all duration-300 ease-out bg-white border-2 ${config.border} ${interactivityClasses}`}
            onClick={() => onUnitClick(unit)}
            whileHover={unit.status === 'available' ? { y: -4 } : {}}
            whileTap={unit.status === 'available' ? { scale: 0.98 } : {}}
            disabled={unit.status !== 'available' && !isAdminView} // Allow admin to click booked units
        >
            {statusOverlay}

            {isAdminView && (
                <div className="absolute top-1 left-1 z-[60]">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === unit.id ? null : unit.id);
                        }}
                        className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <MoreVertical size={14} />
                    </div>

                    <AnimatePresence>
                        {activeMenu === unit.id && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10, x: -5 }}
                                className="absolute top-full left-0 mt-1 w-max bg-white rounded-lg shadow-xl border border-slate-100 py-0.5 z-[60] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => {
                                        onEditClick(unit);
                                        setActiveMenu(null);
                                    }}
                                    className="w-full px-2 py-1 flex items-center justify-start gap-1.5 text-[9px] font-bold text-slate-700 hover:bg-slate-50 transition-all text-left whitespace-nowrap"
                                >
                                    <Edit size={10} className="text-blue-500" />
                                    Edit Unit
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Top Section */}
            <div className="w-full flex flex-col items-center gap-1.5">
                {(() => {
                    const imgUrl = unit.unit_image_url || unit.image_url || (unit.images && unit.images[0]);
                    if (imgUrl) {
                        return (
                            <div className="w-full h-12 mb-1 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                <img
                                    src={imgUrl}
                                    alt={`Unit ${unit.unit_number}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error('❌ TwoDView Image Load Error:', imgUrl);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        );
                    }
                    return (
                        <div className={`p-1 rounded-lg ${config.bg} ${config.color}`}>
                            <TypeIcon size={14} />
                        </div>
                    );
                })()}
                <span className={`w-full text-[7px] md:text-[8px] font-black uppercase px-1 py-0.5 rounded-md ${config.bg} ${config.color} border ${config.border} text-center leading-none truncate`}>
                    {config.label}
                </span>
            </div>

            {/* Middle Section */}
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-black text-slate-800 tracking-tight leading-none">{unit.unit_number}</span>
            </div>

            {/* Bottom Section */}
            <div className="w-full pt-2 border-t border-slate-100 flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {unit.area} ft²
                </span>
            </div>

            {/* Premium Tooltip */}
            {unit.status === 'available' && (
                <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 min-w-[160px] bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl opacity-0 group-hover/unit:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-2xl flex flex-col items-center border border-white/10 ring-1 ring-black/50">
                    <div className="flex items-center gap-2 mb-2 w-full border-b border-white/10 pb-1.5">
                        <TypeIcon size={14} className={config.color} />
                        <span className="font-bold text-sm tracking-tight">{unit.unit_type} {unit.unit_number}</span>
                    </div>
                    <div className="flex justify-between w-full text-[10px] items-baseline mb-0.5 border-b border-white/5 pb-1">
                        <span className="text-slate-400 font-medium">Rate</span>
                        <div className="text-right">
                            {unit.discount_price_per_sqft ? (
                                <>
                                    <span className="text-[9px] text-slate-500 line-through mr-1">₹{unit.price_per_sqft}</span>
                                    <span className="text-emerald-400 font-bold">₹{unit.discount_price_per_sqft}</span>
                                </>
                            ) : (
                                <span className="text-slate-200 font-bold">₹{unit.price_per_sqft || 0}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between w-full text-xs items-baseline mt-1 mb-1">
                        <span className="text-slate-400 font-medium">Total</span>
                        <div className="text-right flex flex-col items-end">
                            {/* Calculation handling: Use provided total prices if available (Bungalow), otherwise calculate */}
                            {(() => {
                                const isTotal = unit.price > 0 && (!unit.area || unit.price_per_sqft === 0);
                                const price = isTotal ? unit.price : (unit.area * (unit.discount_price_per_sqft || unit.price_per_sqft));
                                const originalPrice = isTotal ? (unit.price + (unit.discount_amount || 0)) : (unit.area * unit.price_per_sqft);
                                const hasDiscount = unit.discount_price_per_sqft || unit.discount_price;

                                return (
                                    <>
                                        {hasDiscount && (
                                            <span className="text-[9px] text-slate-500 line-through leading-none mb-0.5">
                                                {(() => {
                                                    const val = originalPrice;
                                                    if (val === 0) return '₹0';
                                                    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
                                                    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
                                                    return `₹${val.toLocaleString('en-IN')}`;
                                                })()}
                                            </span>
                                        )}
                                        <span className="text-emerald-400 font-black text-sm leading-none">
                                            {(() => {
                                                const val = price;
                                                if (val === 0) return '₹0';
                                                if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
                                                if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
                                                return `₹${val.toLocaleString('en-IN')}`;
                                            })()}
                                        </span>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                    <div className="flex justify-between w-full text-[10px] pt-1 border-t border-white/5">
                        <span className="text-slate-400 font-medium">SBUA</span>
                        <span className="text-slate-200 font-bold">{unit.area} Sq Ft</span>
                    </div>
                    {unit.carpet_area && (
                        <div className="flex justify-between w-full text-[10px]">
                            <span className="text-slate-400 font-medium">Carpet</span>
                            <span className="text-slate-200 font-bold">{unit.carpet_area} Sq Ft</span>
                        </div>
                    )}
                    <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-white/10 ring-1 ring-black/50"></div>
                </div>
            )}
        </motion.button>
    );
};

export default TwoDView;
