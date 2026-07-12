import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';

// Layout
import RoleBasedLayout from './components/RoleBasedLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Common
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

// Pages - Owner
import OwnerDashboard from './pages/owner/OwnerDashboard';
import EstatePage from './pages/owner/EstatePage';
import EstateDetailPage from './pages/owner/EstateDetailPage';
import EstateEditPage from './pages/owner/EstateEditPage';
import AssetsPage from './pages/owner/AssetsPage';
import AssetDetailPage from './pages/owner/AssetDetailPage';
import AssetEditPage from './pages/owner/AssetEditPage';
import BeneficiariesPage from './pages/owner/BeneficiariesPage';
import BeneficiaryDetailPage from './pages/owner/BeneficiaryDetailPage';
import BeneficiaryEditPage from './pages/owner/BeneficiaryEditPage';
import DigitalWillPage from './pages/owner/DigitalWillPage';
import WitnessRequestsPage from './pages/owner/WitnessRequestsPage';
import WitnessRequestDetailPage from './pages/owner/WitnessRequestDetailPage';

// Pages - Beneficiary
import BeneficiaryDashboard from './pages/beneficiary/BeneficiaryDashboard';
import BeneficiaryEstateView from './pages/beneficiary/BeneficiaryEstateView';
import BeneficiaryDocuments from './pages/beneficiary/BeneficiaryDocuments';
import BeneficiaryMessages from './pages/beneficiary/BeneficiaryMessages';

// Pages - Witness
import WitnessDashboard from './pages/witness/WitnessDashboard';
import WitnessRequestDetail from './pages/witness/WitnessRequestDetail';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import AuditPage from './pages/admin/AuditPage';
import ReportsPage from './pages/admin/ReportsPage';

// Legacy Pages
import Ledger from './pages/Ledger';
import Documents from './pages/Documents';
import Profile from './pages/Profile';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kastom-cream">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin mx-auto"></div>
          <p className="mt-4 text-kastom-muted font-medium">Loading Kastom Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#111827',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: {
              primary: '#16A34A',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <RoleProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleBasedLayout />}>
              {/* Common Routes */}
              <Route path="/search" element={<SearchPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<Profile />} />

              {/* Owner Routes */}
              <Route path="/dashboard" element={<OwnerDashboard />} />
              <Route path="/estate" element={<EstatePage />} />
              <Route path="/estate/create" element={<EstatePage />} />
              <Route path="/estate/:id" element={<EstateDetailPage />} />
              <Route path="/estate/edit/:id" element={<EstateEditPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/assets/create" element={<AssetsPage />} />
              <Route path="/assets/:id" element={<AssetDetailPage />} />
              <Route path="/assets/edit/:id" element={<AssetEditPage />} />
              <Route path="/beneficiaries" element={<BeneficiariesPage />} />
              <Route path="/beneficiaries/add" element={<BeneficiariesPage />} />
              <Route path="/beneficiaries/:id" element={<BeneficiaryDetailPage />} />
              <Route path="/beneficiaries/edit/:id" element={<BeneficiaryEditPage />} />
              <Route path="/will" element={<DigitalWillPage />} />
              <Route path="/witness-requests" element={<WitnessRequestsPage />} />
              <Route path="/witness-requests/:id" element={<WitnessRequestDetailPage />} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="/documents" element={<Documents />} />

              {/* Beneficiary Routes */}
              <Route path="/my-estates" element={<BeneficiaryDashboard />} />
              <Route path="/beneficiary/estate/:id" element={<BeneficiaryEstateView />} />
              <Route path="/beneficiary/documents" element={<BeneficiaryDocuments />} />
              <Route path="/messages" element={<BeneficiaryMessages />} />

              {/* Witness Routes */}
              <Route path="/witness-dashboard" element={<WitnessDashboard />} />
              <Route path="/witness-requests/:id" element={<WitnessRequestDetail />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/logs" element={<ActivityLogsPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </RoleProvider>
    </>
  );
}

export default App;