import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Globe,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

function SettingsPage() {
  const { user } = useAuth();
  const { role, isAdmin } = useRole();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    occupation: '',
    province: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phone || '',
        occupation: user.occupation || '',
        province: user.province || ''
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', profile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Settings</h1>
        <p className="text-kastom-muted mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-kastom-dark mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-kastom-green" />
            Profile Settings
          </h2>

          <form onSubmit={handleSave}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="input-field"
                  placeholder="675 7123 4567"
                />
              </div>

              <div>
                <label className="input-label">Occupation</label>
                <input
                  type="text"
                  value={profile.occupation}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  className="input-field"
                  placeholder="Community Leader"
                />
              </div>

              <div>
                <label className="input-label">Province</label>
                <input
                  type="text"
                  value={profile.province}
                  onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-kastom-dark mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-kastom-green" />
            Security
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl">
              <div>
                <p className="font-medium text-kastom-dark">SevisPass Authentication</p>
                <p className="text-sm text-kastom-muted">Your identity is verified through PNG government</p>
              </div>
              <span className="badge badge-success flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl">
              <div>
                <p className="font-medium text-kastom-dark">Two-Factor Authentication</p>
                <p className="text-sm text-kastom-muted">Add an extra layer of security</p>
              </div>
              <button className="btn-secondary text-sm px-4 py-2">
                Enable
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl">
              <div>
                <p className="font-medium text-kastom-dark">Session Management</p>
                <p className="text-sm text-kastom-muted">Active sessions: 1</p>
              </div>
              <button className="text-kastom-danger hover:underline text-sm">
                Logout All Devices
              </button>
            </div>
          </div>
        </div>

        {/* Role & Permissions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-kastom-dark mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-kastom-green" />
            Role & Permissions
          </h2>

          <div className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl">
            <div>
              <p className="font-medium text-kastom-dark">Current Role</p>
              <p className="text-sm text-kastom-muted">
                {role} {isAdmin && '(Administrator)'}
              </p>
            </div>
            <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-success'}`}>
              {isAdmin ? 'Admin Access' : 'Standard User'}
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="text-xl font-semibold text-kastom-dark mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-kastom-green" />
            Notifications
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-kastom-dark">Email Notifications</p>
                <p className="text-sm text-kastom-muted">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-kastom-border rounded-full peer peer-checked:bg-kastom-green transition-colors">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 peer-checked:translate-x-5 transition-transform"></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-kastom-dark">Witness Request Alerts</p>
                <p className="text-sm text-kastom-muted">Get notified when witness action is needed</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-kastom-border rounded-full peer peer-checked:bg-kastom-green transition-colors">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 peer-checked:translate-x-5 transition-transform"></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-kastom-dark">Estate Updates</p>
                <p className="text-sm text-kastom-muted">Get notified about estate changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-kastom-border rounded-full peer peer-checked:bg-kastom-green transition-colors">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 peer-checked:translate-x-5 transition-transform"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;