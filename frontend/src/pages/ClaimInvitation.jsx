import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function ClaimInvitation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [beneficiary, setBeneficiary] = useState(null);

  useEffect(() => {
    claimInvitation();
  }, []);

  const claimInvitation = async () => {
    try {
      // Check if we're already logged in
      const storedToken = localStorage.getItem('kastom_token');
      if (!storedToken) {
        // Redirect to login with redirect back to this page
        toast.info('Please login with SevisPass to claim your invitation');
        navigate(`/login?redirect=/claim/${token}`);
        return;
      }

      // Claim the invitation
      const response = await api.post(`/beneficiaries/claim/${token}`);
      setBeneficiary(response.data.beneficiary);
      setStatus('success');
      toast.success('Beneficiary invitation claimed successfully!');
    } catch (error) {
      console.error('Claim invitation error:', error);
      setStatus('error');
      toast.error(error.response?.data?.message || 'Failed to claim invitation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kastom-cream">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-kastom-green animate-spin mx-auto" />
          <p className="mt-4 text-kastom-muted">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-kastom-cream px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full card shadow-premium-lg"
      >
        {status === 'success' ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-kastom-success" />
            </div>
            <h2 className="text-2xl font-bold text-kastom-dark">Invitation Claimed! 🎉</h2>
            <p className="text-kastom-muted mt-2">
              You have successfully claimed your beneficiary invitation for:
            </p>
            <p className="font-semibold text-kastom-dark mt-2">
              {beneficiary?.estate?.title || 'Estate'}
            </p>
            <p className="text-sm text-kastom-muted">
              Relationship: {beneficiary?.relationship}
            </p>
            <button
              onClick={() => navigate('/my-estates')}
              className="mt-6 btn-primary w-full"
            >
              Go to Dashboard
            </button>
          </div>
        ) : status === 'error' ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-kastom-dark">Invalid Invitation</h2>
            <p className="text-kastom-muted mt-2">
              This invitation link is invalid or has already been claimed.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 btn-primary w-full"
            >
              Go Home
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-kastom-dark">Processing</h2>
            <p className="text-kastom-muted mt-2">
              Please wait while we process your invitation...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ClaimInvitation;