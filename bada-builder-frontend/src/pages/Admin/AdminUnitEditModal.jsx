import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calculator, Home, Tag, Layers, Maximize } from 'lucide-react';
import { liveGroupDynamicAPI } from '../../services/api';

const AdminUnitEditModal = ({ isOpen, onClose, unit, onUpdate, projectType }) => {
    const [formData, setFormData] = useState({
        unit_number: '',
        unit_type: '',
        floor_number: '',
        area: '',
        carpet_area: '',
        price_per_sqft: '',
        discount_price_per_sqft: '',
        status: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (unit) {
            setFormData({
                unit_number: unit.unit_number || '',
                unit_type: unit.unit_type || '',
                floor_number: (unit.floor_number !== undefined && unit.floor_number !== null) ? unit.floor_number : '',
                area: unit.area || '',
                carpet_area: unit.carpet_area || '',
                price_per_sqft: unit.price_per_sqft || '',
                discount_price_per_sqft: unit.discount_price_per_sqft || '',
                status: unit.status || ''
            });
        }
    }, [unit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateFinalPrice = () => {
        const area = parseFloat(formData.area) || 0;

        const reg = parseFloat(formData.price_per_sqft) || 0;
        const disc = (formData.discount_price_per_sqft !== '' && formData.discount_price_per_sqft !== null)
            ? parseFloat(formData.discount_price_per_sqft)
            : null;

        const effective = disc !== null ? disc : reg;
        const total = area * effective;

        if (total === 0) return '₹0';

        if (total >= 10000000) {
            return `₹${(total / 10000000).toFixed(2)} Cr`;
        } else if (total >= 100000) {
            return `₹${(total / 100000).toFixed(2)} L`;
        }

        return total.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (parseFloat(formData.carpet_area) > parseFloat(formData.area)) {
                throw new Error('Carpet Area cannot be greater than SBUA (Super Built-up Area)');
            }

            const submissionData = { ...formData };

            // Fix for Bungalows: Floor number might be empty string since input is hidden
            if (projectType === 'Bungalow') {
                submissionData.floor_number = submissionData.floor_number || 0;
            }

            const response = await liveGroupDynamicAPI.updateUnit(unit.id, submissionData);
            onUpdate(response.unit);
            onClose();
        } catch (err) {
            console.error('Update unit error:', err);
            setError(err.message || 'Failed to update unit');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden border border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Fixed */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Edit Unit Details</h2>
                                <p className="text-xs text-slate-500 font-medium">Configure properties for {unit?.unit_number}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Unit Number */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                        <Tag size={14} className="text-slate-400" />
                                        Unit Number
                                    </label>
                                    <input
                                        type="text"
                                        name="unit_number"
                                        value={formData.unit_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                                        required
                                    />
                                </div>

                                {/* Unit Type */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                        <Layers size={14} className="text-slate-400" />
                                        Unit Type
                                    </label>
                                    <select
                                        name="unit_type"
                                        value={formData.unit_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                                        required
                                    >
                                        {projectType === 'Bungalow' ? (
                                            <>
                                                <option value="Villa">Villa</option>
                                                <option value="Bungalow">Bungalow</option>
                                                <option value="Row House">Row House</option>
                                                <option value="Twin Villa">Twin Villa</option>
                                                <option value="Plot">Plot</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Flat">Flat</option>
                                                <option value="Penthouse">Penthouse</option>
                                                <option value="Shop">Shop</option>
                                                <option value="Office">Office</option>
                                                <option value="Showroom">Showroom</option>
                                                <option value="Parking">Parking</option>
                                                <option value="Storage">Storage</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                {/* Floor Number - Hidden for Bungalows */}
                                {projectType !== 'Bungalow' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                            <Layers size={14} className="text-slate-400" />
                                            Floor Number
                                        </label>
                                        <input
                                            type="number"
                                            name="floor_number"
                                            value={formData.floor_number}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                                            required
                                        />
                                    </div>
                                )}



                                {/* Area & Carpet Area */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                        <Maximize size={14} className="text-slate-400" />
                                        SBUA (Sq. Ft.)
                                    </label>
                                    <input
                                        type="number"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                        <Maximize size={14} className="text-slate-400" />
                                        Carpet Area (Sq. Ft.)
                                    </label>
                                    <input
                                        type="number"
                                        name="carpet_area"
                                        value={formData.carpet_area}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 text-sm ${parseFloat(formData.carpet_area) > parseFloat(formData.area)
                                            ? 'border-rose-300 focus:ring-rose-500 bg-rose-50'
                                            : 'border-slate-200 focus:ring-blue-500 focus:bg-white'
                                            }`}
                                    />
                                </div>

                                {/* Regular Price per Sqft */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Regular Price per Sqft</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            name="price_per_sqft"
                                            value={formData.price_per_sqft}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Discount Price per Sqft */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Discount Price per Sqft</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            name="discount_price_per_sqft"
                                            value={formData.discount_price_per_sqft}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold text-slate-800 text-sm"
                                            placeholder="No discount"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Price Preview */}
                            <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                                        <Calculator className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest !text-white/60">Estimated Total Price</p>
                                        <p className="text-xl font-black text-white">{calculateFinalPrice()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg uppercase tracking-wider">Auto Calculated</span>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-2 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AdminUnitEditModal;
