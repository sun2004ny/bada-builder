import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Home,
  FileCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Building,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, logout, loading, profileLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user is admin
    // Wait for initial auth check to complete
    if (loading || profileLoading) return;

    // Check if user is admin
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check user_type from userProfile (more reliable) or currentUser
    const userType = userProfile?.user_type || userProfile?.userType || currentUser?.user_type || currentUser?.userType;
    if (userType !== 'admin') {
      navigate('/login');
      return;
    }

    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('adminDarkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [currentUser, userProfile, navigate]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('adminDarkMode', newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: location.pathname === '/admin'
    },
    {
      name: 'Properties',
      href: '/admin/properties',
      icon: Home,
      current: location.pathname === '/admin/properties'
    },
    {
      name: 'Live Grouping',
      href: '/admin/live-grouping-management',
      icon: Users,
      current: location.pathname === '/admin/live-grouping-management'
    },
    {
      name: 'By Bada Builder',
      href: '/admin/bada-builder',
      icon: Building,
      current: location.pathname === '/admin/bada-builder'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Reviews',
      href: '/admin/reviews',
      icon: MessageSquare,
      current: location.pathname === '/admin/reviews'
    },
    {
      name: 'Bookings',
      href: '/admin/bookings',
      icon: FileCheck,
      current: location.pathname === '/admin/bookings'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      current: location.pathname === '/admin/analytics'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname === '/admin/settings'
    }
  ];

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying administrator access...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You need admin privileges to access this area.</p>
        </div>
      </div>
    );
  }

  const userType = userProfile?.user_type || userProfile?.userType || currentUser?.user_type || currentUser?.userType;
  if (userType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You need admin privileges to access this area.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Current user type: {userType || 'unknown'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-white/10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
              <span className="text-white font-bold text-lg">BB</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Bada Builder</span>
              <p className="text-blue-100 text-xs font-medium">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 relative z-10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 flex-1 overflow-y-auto scrollbar-none pb-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${item.current
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-lg'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-all duration-200 ${item.current ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`} />
                  <span className="tracking-wide">{item.name}</span>
                  {item.current && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="space-y-2">
              <button
                onClick={toggleDarkMode}
                className="group flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
              >
                {darkMode ? (
                  <Sun className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-yellow-500 transition-colors duration-200" />
                ) : (
                  <Moon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                )}
                <span className="tracking-wide">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
                <span className="tracking-wide">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 shrink-0">
          <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {currentUser?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {currentUser?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {currentUser?.email}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between h-14 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  System Online • {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;