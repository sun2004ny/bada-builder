import { useState, useEffect } from 'react';
import {
  Users,
  Home,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react';
import { adminAPI } from '../../services/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    activeListings: 0,
    approvalRate: 0,
    avgResponseTime: 0,
    userSatisfaction: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {typeof value === 'number' && title.includes('Revenue')
              ? `₹${(value / 100000).toFixed(1)}L`
              : value.toLocaleString()}
          </p>
          {change && (
            <p className={`text-xs mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = (type) => {
      switch (type) {
        case 'user_registration': return <Users className="h-4 w-4 text-blue-500" />;
        case 'property_submitted': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'property_approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'complaint_resolved': return <AlertCircle className="h-4 w-4 text-purple-500" />;
        case 'subscription_purchased': return <DollarSign className="h-4 w-4 text-emerald-500" />;
        case 'site_visit_booked': return <Calendar className="h-4 w-4 text-orange-500" />;
        default: return <Activity className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-900 dark:text-white">{activity.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatTime(activity.time)}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-none space-y-4">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded-lg"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening.</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          change={12}
        />
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          icon={Home}
          color="bg-green-500"
          change={8}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={Clock}
          color="bg-yellow-500"
          change={-5}
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          color="bg-purple-500"
          change={15}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings || 0}
          icon={Calendar}
          color="bg-orange-500"
          change={20}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Active Listings</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.activeListings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Approval Rate</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.approvalRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Average Response Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.avgResponseTime} hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">User Satisfaction</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.userSatisfaction}/5</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {stats.recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                {stats.pendingApprovals} Properties Pending
              </span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Review and approve pending property submissions
            </p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-sm text-blue-800 dark:text-blue-200">
                3 Open Complaints
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Address user complaints and issues
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-sm text-green-800 dark:text-green-200">
                System Healthy
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              All systems operational and running smoothly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;