import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import AdminPropertyModal from './AdminPropertyModal';
import { adminAPI } from '../../services/adminApi';
import { motion } from 'framer-motion';

const BadaBuilderManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchBadaBuilderProjects();
  }, []);

  const fetchBadaBuilderProjects = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAdminProperties({ source: 'By Bada Builder' });
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Bada Builder projects:', error);
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = (projectId, newStatus) => {
    setProjects(projects.map(project =>
      project.id === projectId
        ? { ...project, status: newStatus }
        : project
    ));
  };

  const handleFeaturedToggle = (projectId) => {
    setProjects(projects.map(project =>
      project.id === projectId
        ? { ...project, featured: !project.featured }
        : project
    ));
  };

  const handleDelete = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(project => project.id !== projectId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pre-launch': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sold-out': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Residential': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Commercial': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Mixed-Use': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">By Bada Builder</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage exclusive Bada Builder projects and developments</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setSelectedProject(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'active').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Units</p>
              <p className="text-2xl font-bold text-blue-600">{projects.reduce((sum, p) => sum + (parseInt(p.metadata?.units) || 0), 0)}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sold Units</p>
              <p className="text-2xl font-bold text-purple-600">{projects.reduce((sum, p) => sum + (parseInt(p.metadata?.sold_units) || 0), 0)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{projects.reduce((sum, p) => sum + (parseFloat(p.metadata?.total_revenue) || 0), 0)}Cr
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
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
          <option value="pre-launch">Pre-Launch</option>
          <option value="sold-out">Sold Out</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Mixed-Use">Mixed-Use</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                {project.featured && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full font-semibold">
                    Featured
                  </span>
                )}
              </div>
              <div className="absolute top-4 left-4 flex space-x-1">
                {project.rera_approved && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full font-semibold">
                    RERA
                  </span>
                )}
                {project.green_certified && (
                  <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded-full font-semibold">
                    Green
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{project.rating}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(project.category)}`}>
                    {project.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{project.type}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {project.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ₹{project.price}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Construction Progress</span>
                  <span>{project.metadata?.completion_percentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${project.metadata?.completion_percentage || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Units Info */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{project.metadata?.units || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                  <div className="text-sm font-semibold text-green-600">{project.metadata?.sold_units || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Sold</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                  <div className="text-sm font-semibold text-blue-600">{(parseInt(project.metadata?.units) || 0) - (parseInt(project.metadata?.sold_units) || 0)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Available</div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{project.views || 0}</div>
                  <div className="text-gray-500 dark:text-gray-400">Views</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{project.inquiries || 0}</div>
                  <div className="text-gray-500 dark:text-gray-400">Inquiries</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{project.bookings_count || 0}</div>
                  <div className="text-gray-500 dark:text-gray-400">Bookings</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleFeaturedToggle(project.id)}
                  className={`px-3 py-2 rounded-lg transition-colors ${project.featured
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(project.id, e.target.value)}
                  className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="pre-launch">Pre-Launch</option>
                  <option value="sold-out">Sold Out</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSource="By Bada Builder"
        property={selectedProject}
        onSave={async (data) => {
          try {
            if (selectedProject) {
              await adminAPI.updateAdminProperty(selectedProject.id, data);
            } else {
              await adminAPI.addAdminProperty(data);
            }
            setIsModalOpen(false);
            fetchBadaBuilderProjects(); // Refresh list
          } catch (error) {
            console.error('Error saving property:', error);
            alert('Failed to save property. Please try again.');
          }
        }}
      />
    </div>
  );
};

export default BadaBuilderManagement;