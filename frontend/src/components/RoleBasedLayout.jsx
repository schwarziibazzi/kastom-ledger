import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';
import { 
  LayoutDashboard, 
  Home,
  Package,
  Users,
  FileText,
  UserCheck,
  Clock,
  FolderOpen,
  Settings,
  LogOut,
  Search,
  Bell,
  Shield,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  Activity,
  FileBarChart,
  User,
  Eye,
  Gift,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
  'LayoutDashboard': LayoutDashboard,
  'Home': Home,
  'Package': Package,
  'Users': Users,
  'FileText': FileText,
  'UserCheck': UserCheck,
  'Clock': Clock,
  'FolderOpen': FolderOpen,
  'Settings': Settings,
  'MessageSquare': MessageSquare,
  'Activity': Activity,
  'FileBarChart': FileBarChart,
  'User': User,
  'Eye': Eye,
  'Gift': Gift,
  'CheckCircle': CheckCircle,
  'XCircle': XCircle,
  'AlertCircle': AlertCircle
};

function RoleBasedLayout() {
  const { user, logout } = useAuth();
  const { role, menuItems, isAdmin, isOwner, isBeneficiary, isWitness } = useRole();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // In production, fetch from API
      setUnreadCount(3);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    const badges = {
      OWNER: 'bg-kastom-green text-white',
      BENEFICIARY: 'bg-blue-600 text-white',
      WITNESS: 'bg-purple-600 text-white',
      ADMINISTRATOR: 'bg-red-600 text-white'
    };
    return badges[role] || 'bg-kastom-green text-white';
  };

  const getRoleLabel = () => {
    const labels = {
      OWNER: 'Inheritance Owner',
      BENEFICIARY: 'Beneficiary / Heir',
      WITNESS: 'Witness',
      ADMINISTRATOR: 'Administrator'
    };
    return labels[role] || 'User';
  };

  const getRoleIcon = () => {
    const icons = {
      OWNER: Shield,
      BENEFICIARY: Gift,
      WITNESS: UserCheck,
      ADMINISTRATOR: Shield
    };
    const Icon = icons[role] || Shield;
    return Icon;
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-kastom-cream">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-kastom-border/50 z-50 
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-kastom-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-kastom-green flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-kastom-dark tracking-tight">Kastom Ledger</h1>
                <p className="text-xs text-kastom-muted font-medium">Papua New Guinea</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadge()}`}>
                {getRoleLabel()}
              </span>
              {isAdmin && (
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-700">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = iconMap[item.icon] || LayoutDashboard;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-kastom-green-bg text-kastom-green' 
                        : 'text-kastom-muted hover:bg-kastom-cream hover:text-kastom-dark'
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <IconComponent className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Bottom */}
          <div className="px-4 py-4 border-t border-kastom-border/50">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-kastom-cream">
              <div className="w-10 h-10 rounded-full bg-kastom-green/10 flex items-center justify-center flex-shrink-0">
                <span className="text-kastom-green font-semibold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-kastom-dark truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-kastom-muted truncate">{user?.sevispassUid || 'UID'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-kastom-green-bg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-kastom-muted" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-kastom-border/50">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-kastom-cream transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-kastom-dark tracking-tight">
                  {menuItems.find(item => window.location.pathname.includes(item.path))?.label || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search - Only for Owner and Admin */}
              {(isOwner || isAdmin) && (
                <button 
                  className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
                  onClick={() => navigate('/search')}
                >
                  <Search className="w-5 h-5 text-kastom-muted" />
                </button>
              )}
              
              {/* Notifications - All users */}
              <button 
                className="p-2 rounded-lg hover:bg-kastom-cream transition-colors relative"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="w-5 h-5 text-kastom-muted" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-kastom-danger rounded-full"></span>
                )}
              </button>

              {/* User */}
              <div className="flex items-center gap-3 pl-3 border-l border-kastom-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-kastom-green flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-kastom-dark">{user?.name || 'User'}</p>
                    <div className="flex items-center gap-1.5">
                      <RoleIcon className="w-3 h-3 text-kastom-green" />
                      <span className="text-xs text-kastom-green font-medium">{getRoleLabel()}</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-kastom-muted" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default RoleBasedLayout;