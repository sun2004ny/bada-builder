import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

const AdminPropertyModal = ({ isOpen, onClose, onSave, property = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'Apartment',
        property_source: 'Individual',
        location: '',
        price: '',
        bhk: '',
        area: '',
        description: '',
        facilities: [''],
        images: [''],
        status: 'active',
        is_featured: false,
        rera_number: '',
        metadata: {}
    });

    useEffect(() => {
        if (property) {
            setFormData({
                ...property,
                facilities: property.facilities?.length ? property.facilities : [''],
                images: property.images?.length ? property.images : [''],
                metadata: property.metadata || {}
            });
        } else {
            setFormData({
                title: '',
                type: 'Apartment',
                property_source: 'Individual',
                location: '',
                price: '',
                bhk: '',
                area: '',
                description: '',
                facilities: [''],
                images: [''],
                status: 'active',
                is_featured: false,
                rera_number: '',
                metadata: {}
            });
        }
    }, [property, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('metadata.')) {
            const metaKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                metadata: { ...prev.metadata, [metaKey]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleArrayChange = (index, value, field) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayItem = (index, field) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArray.length ? newArray : [''] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Clean up empty strings from arrays
        const submissionData = {
            ...formData,
            facilities: formData.facilities.filter(f => f.trim() !== ''),
            images: formData.images.filter(img => img.trim() !== '')
        };
        onSave(submissionData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={onClose} />

                <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {property ? 'Edit Property' : 'Add New Property'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="Apartment">Apartment</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Plot">Plot</option>
                                            <option value="Studio">Studio</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                                        <select
                                            name="property_source"
                                            value={formData.property_source}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="Individual">Individual</option>
                                            <option value="Developer">Developer</option>
                                            <option value="Live Grouping">Live Grouping</option>
                                            <option value="By Bada Builder">By Bada Builder</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                                        <input
                                            type="text"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="e.g. 1.2 Cr or 80 Lakh"
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area</label>
                                        <input
                                            type="text"
                                            name="area"
                                            value={formData.area}
                                            onChange={handleChange}
                                            placeholder="e.g. 1200 sq ft"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Dynamic Metadata & Options */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="pending">Pending</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            checked={formData.is_featured}
                                            onChange={handleChange}
                                            id="is_featured"
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured Property</label>
                                    </div>
                                </div>

                                {formData.property_source === 'Live Grouping' && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 space-y-4">
                                        <h4 className="font-semibold text-red-800 dark:text-red-200 text-sm">Live Grouping Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Group Price</label>
                                                <input
                                                    type="text"
                                                    name="metadata.group_price"
                                                    value={formData.metadata.group_price || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1 text-sm rounded bg-white dark:bg-gray-800 border-red-200 dark:border-red-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Total Slots</label>
                                                <input
                                                    type="number"
                                                    name="metadata.total_slots"
                                                    value={formData.metadata.total_slots || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1 text-sm rounded bg-white dark:bg-gray-800 border-red-200 dark:border-red-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Facilities */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                                        Facilities
                                        <button type="button" onClick={() => addArrayItem('facilities')} className="text-blue-600 text-xs flex items-center">
                                            <Plus className="h-3 w-3 mr-1" /> Add
                                        </button>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                        {formData.facilities.map((fac, idx) => (
                                            <div key={idx} className="flex space-x-1">
                                                <input
                                                    type="text"
                                                    value={fac}
                                                    onChange={(e) => handleArrayChange(idx, e.target.value, 'facilities')}
                                                    className="flex-1 px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                                />
                                                <button type="button" onClick={() => removeArrayItem(idx, 'facilities')} className="text-red-500">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                                        Images (URLs)
                                        <button type="button" onClick={() => addArrayItem('images')} className="text-blue-600 text-xs flex items-center">
                                            <Plus className="h-3 w-3 mr-1" /> Add
                                        </button>
                                    </label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="flex space-x-1 items-center">
                                                <ImageIcon className="h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={img}
                                                    onChange={(e) => handleArrayChange(idx, e.target.value, 'images')}
                                                    placeholder="https://..."
                                                    className="flex-1 px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                                />
                                                <button type="button" onClick={() => removeArrayItem(idx, 'images')} className="text-red-500">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                {property ? 'Update Property' : 'Create Property'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminPropertyModal;
