import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Activity,
  RefreshCw,
  Building,
  TrendingUp,
  MessageSquare,
  Users,
  Star
} from 'lucide-react';
import { adminAPI } from '../../services/adminApi';
import AdminPropertyModal from './AdminPropertyModal';

const PropertiesManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    featured: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const [selectedSource, setSelectedSource] = useState('Individual');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();

    // Real-time polling every 10 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [statusFilter, sourceFilter, searchTerm]);

  const fetchData = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      else setIsRefreshing(true);

      const [propertiesData, statsData] = await Promise.all([
        adminAPI.getAdminProperties({
          source: sourceFilter,
          status: statusFilter,
          search: searchTerm
        }),
        adminAPI.getAdminPropertyStats()
      ]);

      setProperties(propertiesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (!isPoll) setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await adminAPI.patchAdminProperty(propertyId, { status: newStatus });
      setProperties(properties.map(property =>
        property.id === propertyId
          ? { ...property, status: newStatus, updated_at: new Date().toISOString() }
          : property
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFeaturedToggle = async (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    try {
      await adminAPI.patchAdminProperty(propertyId, { is_featured: !property.is_featured });
      setProperties(properties.map(p =>
        p.id === propertyId
          ? { ...p, is_featured: !p.is_featured, updated_at: new Date().toISOString() }
          : p
      ));
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await adminAPI.deleteAdminProperty(propertyId);
        setProperties(properties.filter(property => property.id !== propertyId));
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const handleSave = async (propertyData) => {
    try {
      // Map source to strict types
      const sourceMap = {
        'Individual': { type: 'individual', credit: 'individual' },
        'Developer': { type: 'developer', credit: 'developer' },
        'Live Grouping': { type: 'live_grouping', credit: 'individual' },
        'By Bada Builder': { type: 'bada_builder', credit: 'developer' }
      };

      const mapped = sourceMap[propertyData.property_source] || { type: 'individual', credit: 'individual' };

      const finalData = {
        ...propertyData,
        property_type_strict: mapped.type,
        credit_used: mapped.credit
      };

      if (selectedProperty) {
        await adminAPI.updateAdminProperty(selectedProperty.id, finalData);
      } else {
        await adminAPI.addAdminProperty(finalData);
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedProperty(null);
      fetchData(); // Refresh list and stats
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProperties.length === 0) return;

    try {
      if (action === 'delete') {
        if (!window.confirm(`Are you sure you want to delete ${selectedProperties.length} properties?`)) return;
        await Promise.all(selectedProperties.map(id => adminAPI.deleteAdminProperty(id)));
      } else {
        const updateData = {};
        if (action === 'activate') updateData.status = 'active';
        if (action === 'deactivate') updateData.status = 'inactive';
        if (action === 'feature') updateData.is_featured = true;

        await Promise.all(selectedProperties.map(id => adminAPI.patchAdminProperty(id, updateData)));
      }
      setSelectedProperties([]);
      fetchData();
    } catch (error) {
      console.error('Error in bulk action:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Individual': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Developer': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Live Grouping': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'By Bada Builder': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all property listings and approvals</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setSelectedSource('By Bada Builder');
              setShowAddModal(true);
              setSelectedProperty(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Home className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Featured</p>
              <p className="text-2xl font-bold text-purple-600">{stats.featured}</p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Sources</option>
          <option value="Individual">Individual</option>
          <option value="Developer">Developer</option>
          <option value="Live Grouping">Live Grouping</option>
          <option value="By Bada Builder">By Bada Builder</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              {selectedProperties.length} properties selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('feature')}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
              >
                Feature
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProperties(properties.map(p => p.id));
                      } else {
                        setSelectedProperties([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProperties([...selectedProperties, property.id]);
                        } else {
                          setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{property.title}</div>
                          {property.is_featured && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.location}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {property.type} • {property.area}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(property.property_source)}`}>
                        {property.property_source}
                      </span>
                      {property.credit_used && (
                        <span className="text-[10px] text-gray-500 font-mono uppercase">
                          Credit: {property.credit_used}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">₹{property.price}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {property.bedrooms > 0 && `${property.bedrooms} BHK`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>Views: {property.views || 0}</div>
                    <div>Inquiries: {property.inquiries || 0}</div>
                    <div>Bookings: {property.bookings_count || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFeaturedToggle(property.id)}
                        className={`p-1 rounded ${property.is_featured ? 'text-yellow-600' : 'text-gray-400'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                        title={property.is_featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowEditModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Edit property"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="p-1 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Delete property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <select
                        value={property.status}
                        onChange={(e) => handleStatusChange(property.id, e.target.value)}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No properties found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AdminPropertyModal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedProperty(null);
        }}
        onSave={handleSave}
        property={selectedProperty}
        initialSource={selectedSource}
      />
    </div>
  );
};

export default PropertiesManagement;