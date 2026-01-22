import { useState, useEffect, Fragment } from 'react';
import {
    Calendar,
    User,
    MapPin,
    Clock,
    CreditCard,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Phone,
    Mail,
    Home as HomeIcon,
    Users as UsersIcon,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertCircle,
    X,
    RefreshCw
} from 'lucide-react';
import { adminAPI } from '../../services/adminApi';

const SiteVisitBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchBookings();
    }, [pagination.page, statusFilter, paymentFilter, appliedSearch]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: appliedSearch,
                status: statusFilter,
                payment_status: paymentFilter
            };

            const response = await adminAPI.getSiteVisitBookings(params);
            setBookings(response.bookings || []);
            setPagination(prev => ({
                ...prev,
                ...response.pagination
            }));
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setAppliedSearch(searchQuery);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleRefresh = () => {
        const isReset = searchQuery === '' && appliedSearch === '' && statusFilter === '' && paymentFilter === '' && pagination.page === 1;

        setSearchQuery('');
        setAppliedSearch('');
        setStatusFilter('');
        setPaymentFilter('');
        setPagination(prev => ({ ...prev, page: 1 }));

        // If already at reset state, useEffect won't trigger, so fetch manually
        if (isReset) {
            fetchBookings();
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
            confirmed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus, paymentMethod) => {
        const statusConfig = {
            completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
        };

        const config = statusConfig[paymentStatus] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className="flex flex-col gap-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1) || 'Pending'}
                </span>
                <span className="text-xs text-gray-500">
                    {paymentMethod === 'postvisit' ? 'Pay After Visit' : 'Prepaid'}
                </span>
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleExpand = (bookingId) => {
        setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
    };

    if (loading && bookings.length === 0) {
        return (
            <div className="w-full max-w-none space-y-4">
                <div className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-12 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-none space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Site Visit Bookings</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Manage and track all site visit bookings
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all shadow-sm font-medium"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, email, location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        handleSearch();
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Payment Filter */}
                    <div>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                            <option value="">All Payments</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="mt-3 flex justify-end">
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Booking ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User Details
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Property
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Visit Date & Time
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    People
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <Fragment key={booking.id}>
                                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                #{booking.id}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-gray-900 dark:text-white">{booking.person1_name}</span>
                                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {booking.user_email}
                                                    </span>
                                                    {booking.user_phone && (
                                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {booking.user_phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-gray-900 dark:text-white">{booking.property_title}</span>
                                                    {booking.property_location && (
                                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {booking.property_location}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(booking.visit_date)}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {booking.visit_time}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                <span className="flex items-center gap-1">
                                                    <UsersIcon className="w-4 h-4" />
                                                    {booking.number_of_people}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {getPaymentBadge(booking.payment_status, booking.payment_method)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => toggleExpand(booking.id)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                                                >
                                                    {expandedBooking === booking.id ? (
                                                        <>
                                                            <ChevronUp className="w-4 h-4" />
                                                            Hide
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-4 h-4" />
                                                            Details
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Details */}
                                        {expandedBooking === booking.id && (
                                            <tr>
                                                <td colSpan="8" className="px-4 py-4 bg-gray-50 dark:bg-gray-900">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Visitor Details */}
                                                        <div className="space-y-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Visitor Details</h4>
                                                            <div className="space-y-1 text-sm">
                                                                <p className="text-gray-700 dark:text-gray-300">
                                                                    <span className="font-medium">1st Person:</span> {booking.person1_name}
                                                                </p>
                                                                {booking.person2_name && (
                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">2nd Person:</span> {booking.person2_name}
                                                                    </p>
                                                                )}
                                                                {booking.person3_name && (
                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">3rd Person:</span> {booking.person3_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Pickup Details */}
                                                        <div className="space-y-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Pickup Details</h4>
                                                            <div className="space-y-1 text-sm">
                                                                <p className="text-gray-700 dark:text-gray-300">
                                                                    <span className="font-medium">Address:</span> {booking.pickup_address || 'N/A'}
                                                                </p>
                                                                {booking.location_from_map && (
                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">Map Location:</span> {booking.location_from_map}
                                                                    </p>
                                                                )}
                                                                {booking.pickup_latitude && booking.pickup_longitude && (
                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">Coordinates:</span> {Number(booking.pickup_latitude).toFixed(6)}, {Number(booking.pickup_longitude).toFixed(6)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Payment Details */}
                                                        {booking.payment_status === 'completed' && (
                                                            <div className="space-y-2">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Payment Details</h4>
                                                                <div className="space-y-1 text-sm">
                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">Amount:</span> ₹{booking.payment_amount || 300}
                                                                    </p>
                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">Method:</span> {booking.payment_method === 'postvisit' ? 'Pay After Visit' : 'Prepaid'}
                                                                    </p>
                                                                    {booking.razorpay_payment_id && (
                                                                        <p className="text-gray-700 dark:text-gray-300">
                                                                            <span className="font-medium">Payment ID:</span> {booking.razorpay_payment_id}
                                                                        </p>
                                                                    )}
                                                                    {booking.payment_timestamp && (
                                                                        <p className="text-gray-700 dark:text-gray-300">
                                                                            <span className="font-medium">Paid At:</span> {formatDateTime(booking.payment_timestamp)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Booking Metadata */}
                                                        <div className="space-y-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Booking Info</h4>
                                                            <div className="space-y-1 text-sm">
                                                                <p className="text-gray-700 dark:text-gray-300">
                                                                    <span className="font-medium">Created:</span> {formatDateTime(booking.created_at)}
                                                                </p>
                                                                {booking.updated_at && booking.updated_at !== booking.created_at && (
                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">Updated:</span> {formatDateTime(booking.updated_at)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                                    <span className="font-medium">{pagination.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteVisitBookings;
