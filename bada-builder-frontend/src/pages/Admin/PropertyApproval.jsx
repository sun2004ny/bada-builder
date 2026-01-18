import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Check,
  X,
  Clock,
  MapPin,
  DollarSign,
  Home,
  User,
  Calendar,
  XCircle
} from 'lucide-react';

const PropertyApproval = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Use mock data directly (no API calls)
      const mockProperties = [
        {
          id: 1,
          title: 'Luxury Villa in Gurgaon',
          type: 'Villa',
          price: '2.5 Cr',
          location: 'Sector 54, Gurgaon',
          status: 'pending',
          submitted_by: 'John Developer',
          submitted_at: '2024-01-20T10:30:00Z',
          images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'],
          description: 'Beautiful luxury villa with modern amenities and spacious rooms.',
          area: '2500 sq ft',
          bedrooms: 4,
          bathrooms: 3,
          amenities: ['Swimming Pool', 'Garden', 'Parking', 'Security']
        },
        {
          id: 2,
          title: 'Modern Apartment Complex',
          type: 'Apartment',
          price: '1.2 Cr',
          location: 'Sector 150, Noida',
          status: 'approved',
          submitted_by: 'Jane Builder',
          submitted_at: '2024-01-19T14:22:00Z',
          images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
          description: 'Contemporary apartment complex with excellent connectivity.',
          area: '1200 sq ft',
          bedrooms: 3,
          bathrooms: 2,
          amenities: ['Gym', 'Elevator', 'Parking', 'Power Backup']
        },
        {
          id: 3,
          title: 'Commercial Office Space',
          type: 'Commercial',
          price: '80 Lakh',
          location: 'Connaught Place, Delhi',
          status: 'rejected',
          submitted_by: 'Mike Properties',
          submitted_at: '2024-01-18T09:15:00Z',
          images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'],
          description: 'Prime commercial space in the heart of Delhi.',
          area: '500 sq ft',
          bedrooms: 0,
          bathrooms: 1,
          amenities: ['Elevator', 'Power Backup', 'Security', 'Parking'],
          rejection_reason: 'Incomplete documentation provided'
        }
      ];
      
      // Simulate loading delay
      setTimeout(() => {
        setProperties(mockProperties);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePropertyAction = async (propertyId, action, reason = '') => {
    try {
      setActionLoading(true);
      
      console.log(`${action} property ${propertyId}`, reason ? { reason } : {});
      
      // Update local state directly (no API calls)
      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { 
              ...property, 
              status: action,
              rejection_reason: action === 'rejected' ? reason : undefined
            }
          : property
      ));
      
      setShowModal(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error(`Error ${action} property:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const PropertyModal = ({ property, onClose }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);

    if (!property) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
          
          <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Property Review</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Images */}
              <div>
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
              {/* Property Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{property.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{property.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <p className="text-sm text-gray-900 dark:text-white">{property.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                    <p className="text-sm text-gray-900 dark:text-white">₹{property.price}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Area</label>
                    <p className="text-sm text-gray-900 dark:text-white">{property.area}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</label>
                    <p className="text-sm text-gray-900 dark:text-white">{property.bedrooms}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <p className="text-sm text-gray-900 dark:text-white">{property.location}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amenities</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {property.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted By</label>
                  <p className="text-sm text-gray-900 dark:text-white">{property.submitted_by}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted On</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(property.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                
                {property.status === 'rejected' && property.rejection_reason && (
                  <div>
                    <label className="text-sm font-medium text-red-700 dark:text-red-300">Rejection Reason</label>
                    <p className="text-sm text-red-900 dark:text-red-200">{property.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            {property.status === 'pending' && (
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {showRejectionForm ? (
                  <div className="flex-1 space-y-4">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter rejection reason..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePropertyAction(property.id, 'rejected', rejectionReason)}
                        disabled={!rejectionReason.trim() || actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectionForm(false);
                          setRejectionReason('');
                        }}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowRejectionForm(true)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handlePropertyAction(property.id, 'approved')}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading ? 'Approving...' : 'Approve'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Property Approval</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and approve property submissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span>{properties.filter(p => p.status === 'pending').length} pending</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  property.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : property.status === 'approved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {property.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{property.title}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {property.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ₹{property.price}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Home className="h-4 w-4 mr-2" />
                  {property.type} • {property.area}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4 mr-2" />
                  {property.submitted_by}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(property.submitted_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedProperty(property);
                    setShowModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Review</span>
                </button>
                
                {property.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handlePropertyAction(property.id, 'approved')}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowModal(true);
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No properties found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Property Modal */}
      {showModal && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => {
            setShowModal(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </div>
  );
};

export default PropertyApproval;