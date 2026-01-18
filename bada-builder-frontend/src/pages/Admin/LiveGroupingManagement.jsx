import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { liveGroupDynamicAPI } from '../../services/api';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Download
} from 'lucide-react';

const LiveGroupingManagement = () => {
  const navigate = useNavigate();
  const [groupings, setGroupings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGroupings, setSelectedGroupings] = useState([]);

  useEffect(() => {
    fetchLiveGroupings();
  }, []);

  const fetchLiveGroupings = async () => {
    try {
      setLoading(true);
      const data = await liveGroupDynamicAPI.getAll();
      const projects = data.projects || [];

      const processed = projects.map(p => ({
        ...p,
        target_participants: p.total_slots || 50,
        current_participants: p.filled_slots || 0,
        total_revenue: `₹${((p.filled_slots || 0) * (parseFloat(p.group_price?.replace(/[^0-9.]/g, '') || 4000) * 1500 / 10000000)).toFixed(2)} Cr`,
        completion_percentage: p.total_slots > 0 ? Math.round((p.filled_slots / p.total_slots) * 100) : 0,
        days_remaining: p.status === 'live' ? 15 : 0,
        inquiries: 0,
        conversions: p.filled_slots || 0,
        price_per_unit: p.group_price,
        images: p.images || [p.image || 'https://via.placeholder.com/400'],
      }));

      setGroupings(processed);
    } catch (error) {
      console.error('Error fetching live groupings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroupings = groupings.filter(grouping => {
    const matchesSearch = grouping.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grouping.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grouping.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || grouping.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (groupingId, newStatus) => {
    setGroupings(groupings.map(grouping =>
      grouping.id === groupingId
        ? { ...grouping, status: newStatus }
        : grouping
    ));
  };

  const handleDelete = (groupingId) => {
    if (window.confirm('Are you sure you want to delete this live grouping?')) {
      setGroupings(groupings.filter(grouping => grouping.id !== groupingId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Grouping Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage group buying campaigns and bulk purchases</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => navigate('/admin/live-grouping-management')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Grouping (Wizard)</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{groupings.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">{groupings.filter(g => g.status === 'active').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{groupings.filter(g => g.status === 'completed').length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{groupings.reduce((sum, g) => sum + parseFloat(g.total_revenue.replace(' Cr', '')), 0).toFixed(1)}Cr
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search live groupings..."
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
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Groupings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGroupings.map((grouping) => (
          <div key={grouping.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <img
                src={grouping.images[0]}
                alt={grouping.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(grouping.status)}`}>
                  {grouping.status}
                </span>
              </div>
              {grouping.days_remaining > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  {grouping.days_remaining} days left
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{grouping.title}</h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {grouping.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  {grouping.current_participants}/{grouping.target_participants} participants
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ₹{grouping.price_per_unit} ({grouping.discount_percentage}% off)
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{grouping.completion_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(grouping.completion_percentage)}`}
                    style={{ width: `${grouping.completion_percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{grouping.inquiries}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Inquiries</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{grouping.conversions}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Conversions</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{grouping.total_revenue}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                <button className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <select
                  value={grouping.status}
                  onChange={(e) => handleStatusChange(grouping.id, e.target.value)}
                  className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => handleDelete(grouping.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGroupings.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No live groupings found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default LiveGroupingManagement;