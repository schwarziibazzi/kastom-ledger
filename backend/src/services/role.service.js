const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RoleService {
  async getUserRole(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      return user?.role || 'OWNER';
    } catch (error) {
      console.error('Get user role error:', error);
      return 'OWNER';
    }
  }

  async updateUserRole(userId, role) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role }
      });
      return user;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  checkPermission(role, action, resource) {
    const permissions = {
      OWNER: {
        'create_estate': true,
        'edit_estate': true,
        'delete_estate': true,
        'view_assets': true,
        'edit_assets': true,
        'delete_assets': true,
        'view_beneficiaries': true,
        'manage_beneficiaries': true,
        'view_witnesses': true,
        'manage_witnesses': true,
        'view_timeline': true,
        'view_documents': true,
        'upload_documents': true,
        'edit_will': true,
        'view_admin': false,
        'view_other_users': false
      },
      BENEFICIARY: {
        'view_estate': true,
        'view_assets': true,
        'view_beneficiaries': true,
        'view_documents': true,
        'view_messages': true,
        'edit_estate': false,
        'edit_assets': false,
        'edit_will': false,
        'manage_beneficiaries': false,
        'manage_witnesses': false,
        'view_admin': false,
        'view_other_users': false
      },
      WITNESS: {
        'view_requests': true,
        'approve_requests': true,
        'reject_requests': true,
        'view_estate': false,
        'view_assets': false,
        'view_beneficiaries': false,
        'view_admin': false,
        'view_other_users': false
      },
      ADMINISTRATOR: {
        'view_users': true,
        'manage_users': true,
        'view_audit_logs': true,
        'view_system_stats': true,
        'view_all_estates': true,
        'verify_requests': true,
        'view_admin': true,
        'edit_inheritance': false
      }
    };

    return permissions[role]?.[action] || false;
  }

  getMenuItems(role) {
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
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'My Estates', path: '/my-estates', icon: 'Home' },
        { label: 'Documents', path: '/documents', icon: 'FolderOpen' },
        { label: 'Messages', path: '/messages', icon: 'MessageSquare' }
      ],
      WITNESS: [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Witness Requests', path: '/witness-requests', icon: 'UserCheck' }
      ],
      ADMINISTRATOR: [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Users', path: '/users', icon: 'Users' },
        { label: 'Activity Logs', path: '/logs', icon: 'Activity' },
        { label: 'Audit', path: '/audit', icon: 'Shield' },
        { label: 'Reports', path: '/reports', icon: 'FileBarChart' }
      ]
    };

    return menus[role] || menus.OWNER;
  }
}

module.exports = new RoleService();