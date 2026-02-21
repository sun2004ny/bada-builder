import { useState, useEffect } from 'react';
import { liveGroupDynamicAPI, referEarnAPI } from '../../services/api';
import {
    Search,
    CheckCircle,
    Home,
    MapPin,
    DollarSign,
    Award,
    Loader2,
    Save,
    Image as ImageIcon,
    Eye,
    EyeOff,
    Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReferEarnManagement = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);
    const [postedProperties, setPostedProperties] = useState([]);
    const [addingProperty, setAddingProperty] = useState(false);
    const [newProperty, setNewProperty] = useState({
        property_name: '',
        price: '',
        location: '',
        property_type: '',
        description: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchData();
        fetchPostedProperties();
    }, []);

    const fetchPostedProperties = async () => {
        try {
            const data = await referEarnAPI.getPostedProperties();
            setPostedProperties(data || []);
        } catch (error) {
            console.error('Error fetching posted properties:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddPostedProperty = async (e) => {
        e.preventDefault();
        try {
            setAddingProperty(true);
            await referEarnAPI.postProperty(newProperty, selectedImage);
            toast.success('Property posted successfully!');
            setNewProperty({
                property_name: '',
                price: '',
                location: '',
                property_type: '',
                description: ''
            });
            setSelectedImage(null);
            setImagePreview(null);
            fetchPostedProperties();
        } catch (error) {
            console.error('Error posting property:', error);
            toast.error(error.response?.data?.error || 'Failed to post property');
        } finally {
            setAddingProperty(false);
        }
    };

    const handleToggleVisibility = async (id, currentVisibility) => {
        try {
            await referEarnAPI.updateVisibility(id, !currentVisibility);
            toast.success(`Property ${!currentVisibility ? 'visible' : 'hidden'} successfully!`);
            fetchPostedProperties();
        } catch (error) {
            console.error('Error toggling visibility:', error);
            toast.error('Failed to update visibility');
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch all available properties
            const data = await liveGroupDynamicAPI.getAll();
            setProperties(data.projects || []);

            // Fetch current referral settings (returning array of IDs)
            const settingsData = await referEarnAPI.getSettings();
            setSelectedPropertyIds(settingsData.referral_property_ids || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load properties or settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleProperty = (id) => {
        setSelectedPropertyIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await referEarnAPI.updateSettings({ referral_property_ids: selectedPropertyIds });
            toast.success('Referral properties updated successfully!');
        } catch (error) {
            console.error('Error saving setting:', error);
            toast.error(error.response?.data?.error || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const filteredProperties = properties.filter(prop =>
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const selectedCount = selectedPropertyIds.length;

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Refer & Earn Selection</h1>
                    <p className="text-gray-600 dark:text-gray-400">Select properties to be featured in the Refer & Earn program</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 !bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white rounded-lg font-bold hover:!from-blue-700 hover:!to-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Selection ({selectedCount})
                </button>
            </div>

            {/* Current Active Property Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Active Selections</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-white">
                                {selectedCount > 0
                                    ? `${selectedCount} Propert${selectedCount === 1 ? 'y' : 'ies'} Featured`
                                    : 'No properties selected'}
                            </p>
                        </div>
                    </div>
                    {selectedCount > 0 && (
                        <button
                            onClick={() => setSelectedPropertyIds([])}
                            className="px-4 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 border border-red-100 dark:border-red-800/30 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-6 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Home className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Isolated Posted Properties</p>
                            <p className="text-lg font-bold text-emerald-900 dark:text-white">
                                {postedProperties.length} Properties Added
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW: Add Property Form */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Save className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Referral Property</h2>
                        <p className="text-sm text-gray-500">This property will be completely isolated and only visible in Refer & Earn</p>
                    </div>
                </div>

                <form onSubmit={handleAddPostedProperty} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Property Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Luxury Penthouse"
                            value={newProperty.property_name}
                            onChange={(e) => setNewProperty({ ...newProperty, property_name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price (in numbers)</label>
                        <input
                            type="number"
                            required
                            placeholder="e.g. 5000000"
                            value={newProperty.price}
                            onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Location</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Mumbai, BKC"
                            value={newProperty.location}
                            onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Property Type</label>
                        <select
                            required
                            value={newProperty.property_type}
                            onChange={(e) => setNewProperty({ ...newProperty, property_type: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                        >
                            <option value="">Select Type</option>
                            <option value="1BHK">1BHK</option>
                            <option value="2BHK">2BHK</option>
                            <option value="3BHK">3BHK</option>
                            <option value="4BHK">4BHK</option>
                            <option value="Villa">Villa</option>
                            <option value="Plot">Plot</option>
                            <option value="Duplex">Duplex</option>
                            <option value="Penthouse">Penthouse</option>
                        </select>
                    </div>

                    <div className="lg:col-span-4 space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Property Description</label>
                        <textarea
                            required
                            placeholder="Describe the property highlights, amenities, etc."
                            value={newProperty.description}
                            onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm h-24 resize-none"
                        />
                    </div>

                    <div className="lg:col-span-4 space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Property Image</label>
                        <div className="flex items-center gap-4">
                            <div
                                onClick={() => document.getElementById('image-upload').click()}
                                className="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 transition-all bg-gray-50 dark:bg-gray-900/50"
                            >
                                {imagePreview ? (
                                    <div className="relative w-full h-32">
                                        <img src={imagePreview} className="w-full h-full object-contain rounded-lg" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-white text-xs font-bold">Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <p className="text-xs text-gray-500">Click to upload property image (Cloudinary)</p>
                                    </>
                                )}
                            </div>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={addingProperty}
                            className="flex items-center gap-2 px-8 py-3 !bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white rounded-xl font-bold hover:!from-emerald-600 hover:!to-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {addingProperty ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Submit & Add Property
                        </button>
                    </div>
                </form>
            </div >

            {/* NEW: Posted Isolated Properties List */}
            {
                postedProperties.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Posted Isolated Properties</h2>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                        <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">Property Name</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">Price</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">Location</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">Type</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-center">Visibility</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">Added On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {postedProperties.map((prop) => (
                                        <tr key={prop.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {prop.image_url ? (
                                                        <img src={prop.image_url} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                            <ImageIcon className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <p className="font-bold text-gray-900 dark:text-white">{prop.property_name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-emerald-600 font-bold">₹{(parseInt(prop.price)).toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>{prop.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-800/50">
                                                    {prop.property_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleVisibility(prop.id, prop.is_visible_to_users)}
                                                    className={`p-2 rounded-lg transition-all ${prop.is_visible_to_users
                                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'}`}
                                                    title={prop.is_visible_to_users ? 'Hide from users' : 'Show to users'}
                                                >
                                                    {prop.is_visible_to_users ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-xs text-gray-400 font-medium">
                                                    {new Date(prop.created_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* Separator */}
            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full !my-12" />

            {/* Search and Filters for Main Properties */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-600" />
                    Select from Existing Live Grouping Properties
                </h2>
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search properties by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    />
                </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                    <div
                        key={property.id}
                        onClick={() => handleToggleProperty(property.id)}
                        className={`group relative bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${selectedPropertyIds.includes(property.id)
                            ? 'border-blue-500 shadow-xl shadow-blue-500/10'
                            : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 shadow-sm'
                            }`}
                    >
                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={property.image || 'https://via.placeholder.com/400x300?text=Property'}
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            {selectedPropertyIds.includes(property.id) && (
                                <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] flex items-center justify-center">
                                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
                                        <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider">Active Referral Property</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{property.title}</h3>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="truncate">{property.location}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{property.group_price || property.original_price}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                    <Home className="w-4 h-4" />
                                    <span>{property.property_type || 'Property'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {
                filteredProperties.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No properties found matching your search.</p>
                    </div>
                )
            }
        </div >
    );
};

export default ReferEarnManagement;
