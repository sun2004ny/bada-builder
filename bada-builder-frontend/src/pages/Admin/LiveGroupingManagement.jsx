import { useState, useEffect } from 'react';
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
      
      // Mock data for live grouping management
      const mockGroupings = [
        {
          id: 1,
          title: 'Luxury Apartments in Gurgaon - Group Buy',
          location: 'Sector 54, Gurgaon',
          target_participants: 50,
          current_participants: 32,
          min_participants: 20,
          price_per_unit: '1.2 Cr',
          discount_percentage: 15,
          original_price: '1.41 Cr',
          status: 'active',
          start_date: '2024-01-15T00:00:00Z',
          end_date: '2024-02-15T23:59:59Z',
          created_at: '2024-01-10T10:30:00Z',
          images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
          description: 'Premium apartments with group buying benefits',
          amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security'],
          developer: 'Premium Builders',
          total_revenue: '38.4 Cr',
          completion_percentage: 64,
          days_remaining: 22,
          inquiries: 156,
          conversions: 32
        },
        {
          id: 2,
          title: 'Commercial Spaces - Bulk Investment',
          location: 'Connaught Place, Delhi',
          target_participants: 30,
          current_participants: 28,
          min_participants: 15,
          price_per_unit: '80 Lakh',
          discount_percentage: 20,
          original_price: '1 Cr',
          status: 'active',
          start_date: '2024-01-20T00:00:00Z',
          end_date: '2024-02-20T23:59:59Z',
          created_at: '2024-01-15T14:22:00Z',
          images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'],
          description: 'Prime commercial spaces with guaranteed returns',
          amenities: ['Elevator', 'Power Backup', 'Security', 'Parking'],
          developer: 'Metro Developers',
          total_revenue: '22.4 Cr',
          completion_percentage: 93,
          days_remaining: 8,
          inquiries: 89,
          conversions: 28
        },
        {
          id: 3,
          title: 'Villa Community - Group Purchase',
          location: 'Sector 89, Faridabad',
          target_participants: 25,
          current_participants: 12,
          min_participants: 10,
          price_per_unit: '2.5 Cr',
          discount_percentage: 12,
          original_price: '2.84 Cr',
          status: 'pending',
          start_date: '2024-01-25T00:00:00Z',
          end_date: '2024-03-25T23:59:59Z',
          created_at: '2024-01-20T09:15:00Z',
          images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'],
          description: 'Exclusive villa community with modern amenities',
          amenities: ['Private Garden', 'Swimming Pool', 'Club House', 'Security'],
          developer: 'Elite Homes',
          total_revenue: '30 Cr',
          completion_percentage: 48,
          days_remaining: 45,
          inquiries: 67,
          conversions: 12
        },
        {
          id: 4,
          title: 'Student Housing - Bulk Booking',
          location: 'Sector 150, Noida',
          target_participants: 100,
          current_participants: 85,
          min_participants: 50,
          price_per_unit: '25 Lakh',
          discount_percentage: 10,
          original_price: '27.5 Lakh',
          status: 'completed',
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-01-31T23:59:59Z',
          created_at: '2023-12-20T16:45:00Z',
          images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'],
          description: 'Modern student housing with all facilities',
          amenities: ['Wi-Fi', 'Cafeteria', 'Study Rooms', 'Recreation'],
          developer: 'Student Living Co.',
          total_revenue: '21.25 Cr',
          completion_percentage: 100,
          days_remaining: 0,
          inquiries: 234,
          conversions: 85
        }
      ];
      
      setTimeout(() => {
        setGroupings(mockGroupings);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching live groupings:', error);
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
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Grouping</span>
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