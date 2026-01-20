import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Building2, Layers, Info, Check, Lock, XCircle, ArrowUpRight } from 'lucide-react';

const TwoDView = ({ project, onUnitClick }) => {
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
                                    <h2 className="text-xl font-bold tracking-tight !text-white">{tower.tower_name}</h2>
                                    <p className="text-sm !text-slate-300 flex items-center gap-2">
                                        <Layers size={14} />
                                        {tower.total_floors} Floors • {tower.units?.length || 0} Units
                                    </p>
                                </div>
                            </div>
                            <div className="hidden sm:block text-xs font-medium bg-white/10 px-3 py-1 rounded-full border border-white/10 !text-white">
                                Premium Tower
                            </div>
                        </div>

                        {/* Floors Container */}
                        <div className="p-4 md:p-6 space-y-4">
                            {Object.entries(
                                tower.units.reduce((acc, unit) => {
                                    if (!acc[unit.floor_number]) acc[unit.floor_number] = [];
                                    acc[unit.floor_number].push(unit);
                                    return acc;
                                }, {})
                            ).map(([floor, units]) => (
                                <div key={floor} className="flex flex-col md:flex-row gap-4 items-start md:items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors rounded-xl px-3 group/floor">
                                    {/* Floor Label - Magazine Style */}
                                    <div className="flex flex-row md:flex-col items-center justify-center gap-3 md:gap-0 min-w-[80px] text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floor</span>
                                        <span className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{floor}</span>
                                    </div>

                                    {/* Units Grid */}
                                    <div className="flex-1 flex flex-wrap gap-2.5">
                                        {units.sort((a, b) => a.unit_number.localeCompare(b.unit_number)).map((unit) => {
                                            // Status Styles
                                            let statusClasses = "!bg-slate-100 text-slate-400 border border-slate-200";
                                            let icon = null;
                                            const unitNumShort = unit.unit_number.length > 3 ? unit.unit_number.slice(-3) : unit.unit_number;

                                            if (unit.status === 'available') {
                                                // Strong Green Background for Available (with !important)
                                                statusClasses = "!bg-emerald-500 text-white border-emerald-600 hover:!bg-emerald-600 hover:scale-105 shadow-md hover:shadow-lg cursor-pointer z-10 font-bold tracking-wide";
                                                // No icon needed for available in solid color mode
                                            } else if (unit.status === 'booked') {
                                                // Rose Tint for Sold Out
                                                statusClasses = "!bg-rose-50 text-rose-300 border-rose-100 opacity-80 cursor-not-allowed";
                                                icon = <XCircle size={12} className="absolute top-1 right-1 opacity-50" />;
                                            } else if (unit.status === 'locked') {
                                                // Amber Background for Locked
                                                statusClasses = "!bg-amber-400 text-amber-950 border-amber-500 cursor-wait font-semibold";
                                                icon = <Lock size={12} className="absolute top-1 right-1 opacity-60 text-amber-900" />;
                                            }

                                            return (
                                                <motion.button
                                                    key={unit.id}
                                                    className={`relative group/unit w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-xl transition-all duration-300 ease-out text-sm border ${statusClasses}`}
                                                    onClick={() => onUnitClick(unit)}
                                                    whileHover={unit.status === 'available' ? { scale: 1.15 } : {}}
                                                    whileTap={unit.status === 'available' ? { scale: 0.95 } : {}}
                                                    disabled={unit.status !== 'available'}
                                                >
                                                    {unitNumShort}
                                                    {icon}

                                                    {/* Premium Tooltip */}
                                                    {unit.status === 'available' && (
                                                        <div className="absolute bottom-[130%] left-1/2 -translate-x-1/2 min-w-[140px] bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl opacity-0 group-hover/unit:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-2xl flex flex-col items-center border border-white/10 ring-1 ring-black/50">
                                                            <div className="flex items-center gap-2 mb-2 w-full border-b border-white/10 pb-1.5">
                                                                <span className="font-bold text-sm tracking-tight">Unit {unit.unit_number}</span>
                                                                <span className="ml-auto text-[10px] bg-emerald-500 text-emerald-950 px-1.5 py-0.5 rounded font-bold uppercase">Open</span>
                                                            </div>
                                                            <div className="flex justify-between w-full text-xs items-baseline">
                                                                <span className="text-slate-400 font-medium">Price</span>
                                                                <span className="text-emerald-300 font-bold text-sm">₹{(unit.price / 100000).toFixed(2)} L</span>
                                                            </div>
                                                            <div className="flex justify-between w-full text-xs mt-1">
                                                                <span className="text-slate-400 font-medium">Area</span>
                                                                <span className="text-slate-200">{unit.area} sq ft</span>
                                                            </div>
                                                            <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-white/10 ring-1 ring-black/50"></div>
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default TwoDView;
