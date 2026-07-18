import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shield, Smartphone, QrCode, Loader2, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function QRCodeLogin({ userId, onSuccess, onError }) {
  const [qrCode, setQrCode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, scanning, authenticated, expired
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (userId) {
      generateQRCode();
    }
  }, [userId]);

  useEffect(() => {
    if (sessionId && status === 'scanning') {
      pollSessionStatus();
    }
  }, [sessionId, status]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await api.post('/oidc4vp/authorize', {
        userId: userId,
        callback_url: `${window.location.origin}/auth/callback`
      });

      setQrCode(response.data.qrCode);
      setSessionId(response.data.sessionId);
      setStatus('scanning');
      toast.success('QR Code generated. Scan with SevisWallet.');
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR Code');
      onError && onError(error);
    } finally {
      setLoading(false);
    }
  };

  const pollSessionStatus = async () => {
    if (polling) return;
    setPolling(true);

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/oidc4vp/session/status?session=${sessionId}`);
        const data = response.data;

        if (data.authenticated) {
          clearInterval(pollInterval);
          setPolling(false);
          setStatus('authenticated');
          toast.success('Authentication successful!');
          
          // Get user info
          const userResponse = await api.get(`/oidc4vp/user?session=${sessionId}`);
          onSuccess && onSuccess(userResponse.data);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
        setPolling(false);
        setStatus('expired');
        toast.error('Session expired or failed');
        onError && onError(error);
      }
    }, 2000);

    // Cleanup after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
      if (status !== 'authenticated') {
        setStatus('expired');
        toast.error('Session expired. Please try again.');
      }
    }, 600000);
  };

  // Mock scan for demo (simulate wallet scanning)
  const simulateWalletScan = async () => {
    if (!sessionId || !userId) return;

    try {
      setLoading(true);
      const response = await api.post('/oidc4vp/mock-wallet-scan', {
        sessionId: sessionId,
        userId: userId
      });

      if (response.data.success) {
        setStatus('authenticated');
        toast.success('Authentication successful!');
        onSuccess && onSuccess(response.data);
      }
    } catch (error) {
      console.error('Mock scan error:', error);
      toast.error('Failed to simulate wallet scan');
    } finally {
      setLoading(false);
    }
  };

  const regenerateQR = () => {
    setQrCode(null);
    setSessionId(null);
    setStatus('idle');
    generateQRCode();
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* QR Code Display */}
      <div className="bg-white rounded-2xl shadow-premium-lg p-6 border border-kastom-border/50 w-full max-w-md">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-kastom-dark">Scan with SevisWallet</h3>
          <p className="text-sm text-kastom-muted">Use your SevisWallet app to scan the QR code</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-kastom-green animate-spin" />
          </div>
        ) : qrCode ? (
          <div className="flex flex-col items-center">
            <div 
              className="w-64 h-64 bg-white rounded-xl overflow-hidden"
              dangerouslySetInnerHTML={{ __html: qrCode }}
            />
            <p className="text-xs text-kastom-muted/60 mt-3">
              Session ID: {sessionId?.substring(0, 8)}...
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-kastom-cream rounded-xl">
            <p className="text-kastom-muted">Click to generate QR Code</p>
          </div>
        )}

        {/* Status indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {status === 'idle' && (
            <span className="text-sm text-kastom-muted">Ready to scan</span>
          )}
          {status === 'scanning' && (
            <span className="flex items-center gap-2 text-sm text-yellow-600">
              <Clock className="w-4 h-4 animate-pulse" />
              Waiting for scan...
            </span>
          )}
          {status === 'authenticated' && (
            <span className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Authenticated!
            </span>
          )}
          {status === 'expired' && (
            <span className="flex items-center gap-2 text-sm text-red-600">
              <Clock className="w-4 h-4" />
              Session expired
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {status === 'idle' && (
          <button
            onClick={generateQRCode}
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Generate QR Code
          </button>
        )}

        {/* Demo: Simulate wallet scan */}
        {status === 'scanning' && (
          <button
            onClick={simulateWalletScan}
            disabled={loading}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Simulate Wallet Scan (Demo)
          </button>
        )}

        {(status === 'expired' || status === 'authenticated') && (
          <button
            onClick={regenerateQR}
            className="btn-primary inline-flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            New QR Code
          </button>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-kastom-muted/60 text-center max-w-sm">
        <Shield className="w-4 h-4 inline mr-1" />
        Your identity is verified through SevisPass. No password required.
      </div>
    </div>
  );
}

export default QRCodeLogin;