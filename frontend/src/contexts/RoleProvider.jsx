import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const { user } = useAuth();
  const [role, setRole] = useState('OWNER');
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    if (user) {
      fetchRole();
    } else {
      setRole('OWNER');
      setLoading(false);
    }
  }, [user]);

  const fetchRole = async () => {
    try {
      const response = await api.get('/auth/role');
      const userRole = response.data.role || user?.role || 'OWNER';
      setRole(userRole);
      setMenuItems(getMenuItems(userRole));
      setPermissions(getPermissions(userRole));
    } catch (error) {
      console.error('Fetch role error:', error);
      const fallbackRole = user?.role || 'OWNER';
      setRole(fallbackRole);
      setMenuItems(getMenuItems(fallbackRole));
      setPermissions(getPermissions(fallbackRole));
    } finally {
      setLoading(false);
    }
  };

  const getMenuItems = (role) => {
    const menus = {
      OWNER: [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'My Estate', path: '/estate', icon: 'Home' },
        { label: 'Asset Registry', path: '/assets', icon: 'Package' },
        { label: 'Beneficiaries', path: '/beneficiaries', icon: 'Users' },
        { label: 'Digital Will', path: '/will', icon: 'FileText' },
        { label: 'Witness Requests', path: '/witness-requests', icon: 'UserCheck' },
        { label: 'Ledger Timeline', path: '/ledger', icon: 'Clock' },
        { label: 'Documents', path: '/documents', icon: 'FolderOpen' },
        { label: 'Settings', path: '/settings', icon: 'Settings' }
      ],
      BENEFICIARY: [
        { label: 'Dashboard', path: '/my-estates', icon: 'LayoutDashboard' },
        { label: 'Inherited Assets', path: '/inherited-assets', icon: 'Package' },
        { label: 'Documents', path: '/beneficiary/documents', icon: 'FolderOpen' },
        { label: 'Messages', path: '/messages', icon: 'MessageSquare' }
      ],
      WITNESS: [
        { label: 'Dashboard', path: '/witness-dashboard', icon: 'LayoutDashboard' },
        { label: 'Pending Reviews', path: '/witness-requests', icon: 'Clock' },
        { label: 'Approved', path: '/witness-approved', icon: 'CheckCircle' },
        { label: 'Rejected', path: '/witness-rejected', icon: 'XCircle' }
      ],
      ADMINISTRATOR: [
        { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
        { label: 'Users', path: '/users', icon: 'Users' },
        { label: 'Activity Logs', path: '/logs', icon: 'Activity' },
        { label: 'Audit', path: '/audit', icon: 'Shield' },
        { label: 'Reports', path: '/reports', icon: 'FileBarChart' }
      ]
    };
    return menus[role] || menus.OWNER;
  };

  const getPermissions = (role) => {
    const permissionsMap = {
      OWNER: {
        canCreateEstate: true,
        canEditEstate: true,
        canDeleteEstate: true,
        canManageAssets: true,
        canManageBeneficiaries: true,
        canManageWitnesses: true,
        canViewTimeline: true,
        canEditWill: true
      },
      BENEFICIARY: {
        canViewEstates: true,
        canViewAssets: true,
        canViewDocuments: true,
        canViewMessages: true,
        canEditEstate: false,
        canManageAssets: false,
        canManageBeneficiaries: false,
        canEditWill: false
      },
      WITNESS: {
        canViewRequests: true,
        canApproveRequests: true,
        canRejectRequests: true
      },
      ADMINISTRATOR: {
        canManageUsers: true,
        canViewAuditLogs: true,
        canViewSystemStats: true,
        canVerifyRequests: true
      }
    };
    return permissionsMap[role] || permissionsMap.OWNER;
  };

  const hasPermission = (action) => {
    return permissions[action] || false;
  };

  const value = {
    role,
    loading,
    menuItems,
    permissions,
    hasPermission,
    isOwner: role === 'OWNER',
    isBeneficiary: role === 'BENEFICIARY',
    isWitness: role === 'WITNESS',
    isAdmin: role === 'ADMINISTRATOR'
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}