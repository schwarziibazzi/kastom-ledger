import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FolderOpen, 
  Upload, 
  File, 
  FileImage, 
  FileText, 
  FileAudio, 
  LayoutGrid, 
  List,
  Search,
  Download,
  Trash2,
  Eye,
  X,
  Loader2,
  FileCheck,
  Shield,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

function Documents() {
  const { user } = useAuth();
  const [view, setView] = useState('grid');
  const [documents, setDocuments] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.documents || []);
      
      //const audioRes = await api.get('/documents/audio');
      //setAudioFiles(audioRes.data.audioFiles || []);
    } catch (error) {
      console.error('Fetch documents error:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      formData.append('title', acceptedFiles[0].name);
      formData.append('description', 'Uploaded document');

      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'text/*': ['.txt', '.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10485760
  });

  const handleView = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else {
      setSelectedDoc(doc);
      setShowPreview(true);
    }
  };

  const handleVerify = async (doc) => {
    setVerifying(true);
    setShowVerification(true);
    try {
      const response = await api.get(`/documents/${doc.id}/verify`);
      setVerificationResult(response.data.verification);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify document');
      setVerificationResult({ isValid: false, message: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      // If it's a URL, open in new tab
      if (doc.fileUrl) {
        window.open(doc.fileUrl, '_blank');
        return;
      }
      
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.title || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Downloading...');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.title}"?`)) return;
    
    try {
      await api.delete(`/documents/${doc.id}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      'pdf': FileText,
      'image': FileImage,
      'audio': FileAudio,
      'video': File,
      'document': FileText,
      'file': File
    };
    return icons[type] || File;
  };

  const getFileColor = (type) => {
    const colors = {
      'pdf': 'text-red-500',
      'image': 'text-blue-500',
      'audio': 'text-purple-500',
      'video': 'text-orange-500',
      'document': 'text-green-500',
      'file': 'text-kastom-muted'
    };
    return colors[type] || 'text-kastom-muted';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const isImage = (doc) => {
    return doc.fileType === 'image' || 
           doc.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
  };

 const getFileUrl = (doc) => {
  if (doc.fileUrl) {
    if (doc.fileUrl.startsWith('/')) {
      return `http://localhost:5000${doc.fileUrl}`;
    }
    return doc.fileUrl;
  }
  return null;
};

  const allFiles = [
    ...documents.map(d => ({ ...d, type: 'document' })),
    ...audioFiles.map(a => ({ ...a, type: 'audio' }))
  ];

  const filteredDocs = allFiles.filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-kastom-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Documents</h1>
          <p className="text-kastom-muted mt-1">
            {allFiles.length} files • Manage your documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-kastom-green-bg text-kastom-green' : 'text-kastom-muted hover:bg-kastom-cream'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-kastom-green-bg text-kastom-green' : 'text-kastom-muted hover:bg-kastom-cream'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`card border-2 border-dashed transition-all duration-200 cursor-pointer mb-8
          ${isDragActive ? 'border-kastom-green bg-kastom-green-bg' : 'border-kastom-border hover:border-kastom-green/30'}`}
      >
        <input {...getInputProps()} />
        <div className="text-center py-12">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-kastom-green animate-spin" />
              <p className="mt-4 text-kastom-muted font-medium">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-kastom-green-bg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-kastom-green" />
              </div>
              <p className="text-lg font-medium text-kastom-dark">
                {isDragActive ? 'Drop your files here' : 'Upload Documents'}
              </p>
              <p className="text-sm text-kastom-muted mt-1">
                Drag & drop or click to browse • PDF, Images, Audio
              </p>
              <p className="text-xs text-kastom-muted/60 mt-2">Max file size: 10MB</p>
            </>
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kastom-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-kastom-border rounded-xl focus:outline-none focus:ring-2 focus:ring-kastom-green focus:border-transparent"
        />
      </div>

      {filteredDocs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-kastom-muted" />
          </div>
          <p className="text-kastom-muted font-medium">No documents found</p>
          <p className="text-sm text-kastom-muted/60 mt-1">
            {searchQuery ? 'Try a different search term' : 'Upload your first document'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => {
            const Icon = getFileIcon(doc.fileType);
            const color = getFileColor(doc.fileType);
            const isImageFile = isImage(doc);
            const fileUrl = getFileUrl(doc);
            const isWill = doc.tags?.includes('digital_will');
            
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card card-hover overflow-hidden"
              >
                <div className="flex flex-col items-center text-center">
                  {isImageFile && fileUrl ? (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-kastom-cream mb-2">
                      <img 
                        src={fileUrl} 
                        alt={doc.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : doc.fileType === 'pdf' || doc.fileUrl?.endsWith('.pdf') ? (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-red-50 flex items-center justify-center mb-2">
                      <FileText className="w-12 h-12 text-red-500" />
                    </div>
                  ) : (
                    <div className={`w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center ${color}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  )}
                  
                  {isWill && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full mb-1">
                      <FileCheck className="w-3 h-3" />
                      Digital Will
                    </span>
                  )}
                  
                  <p className="font-medium text-kastom-dark mt-1 text-sm line-clamp-2">{doc.title}</p>
                  <p className="text-xs text-kastom-muted mt-1">
                    {formatSize(doc.fileSize)}
                  </p>
                  {doc.estate && (
                    <span className="text-xs text-kastom-muted/60 mt-1">{doc.estate.title}</span>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <button 
                      onClick={() => handleView(doc)}
                      className="p-1.5 rounded-lg hover:bg-kastom-cream transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-kastom-muted" />
                    </button>
                    <button 
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg hover:bg-kastom-cream transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-kastom-muted" />
                    </button>
                    {isWill && doc.checksum && (
                      <button 
                        onClick={() => handleVerify(doc)}
                        className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                        title="Verify"
                      >
                        <Shield className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(doc)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-kastom-danger" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const Icon = getFileIcon(doc.fileType);
            const color = getFileColor(doc.fileType);
            const isWill = doc.tags?.includes('digital_will');
            
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-kastom-border/50 hover:border-kastom-green/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-6 h-6 ${color}`} />
                  <div>
                    <p className="font-medium text-kastom-dark">{doc.title}</p>
                    <p className="text-sm text-kastom-muted">
                      {formatSize(doc.fileSize)}
                      {doc.estate && ` • ${doc.estate.title}`}
                      {isWill && ' • 📄 Digital Will'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleView(doc)}
                    className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-kastom-muted" />
                  </button>
                  <button 
                    onClick={() => handleDownload(doc)}
                    className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-kastom-muted" />
                  </button>
                  {isWill && doc.checksum && (
                    <button 
                      onClick={() => handleVerify(doc)}
                      className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                      title="Verify"
                    >
                      <Shield className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(doc)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-kastom-danger" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showPreview && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-kastom-dark">{selectedDoc.title}</h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
              >
                <X className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>
            <div className="bg-kastom-cream rounded-xl p-4 min-h-[200px] flex items-center justify-center">
              {selectedDoc.fileType === 'image' || isImage(selectedDoc) ? (
                <img 
                  src={getFileUrl(selectedDoc)} 
                  alt={selectedDoc.title} 
                  className="max-w-full max-h-[400px] object-contain"
                  onError={(e) => {
                    e.target.alt = 'Image failed to load';
                  }}
                />
              ) : selectedDoc.fileType === 'pdf' || selectedDoc.fileUrl?.endsWith('.pdf') ? (
                <iframe src={getFileUrl(selectedDoc)} className="w-full h-[400px]" />
              ) : selectedDoc.fileType === 'audio' ? (
                <audio controls src={getFileUrl(selectedDoc)} className="w-full" />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-kastom-muted mx-auto" />
                  <p className="text-kastom-muted mt-2">Preview not available</p>
                  <button 
                    onClick={() => handleDownload(selectedDoc)}
                    className="mt-4 btn-primary inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}
            </div>
            {selectedDoc.description && (
              <p className="text-kastom-muted mt-4">{selectedDoc.description}</p>
            )}
            {selectedDoc.checksum && (
              <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Document is signed and verified
                </p>
                <p className="text-xs text-green-600/60 mt-1 font-mono">
                  Hash: {selectedDoc.checksum.substring(0, 20)}...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showVerification && verificationResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-kastom-dark">Document Verification</h2>
              <button 
                onClick={() => {
                  setShowVerification(false);
                  setVerificationResult(null);
                }}
                className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
              >
                <X className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>
            {verifying ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-kastom-green animate-spin mx-auto" />
                <p className="mt-4 text-kastom-muted">Verifying document integrity...</p>
              </div>
            ) : (
              <div className="text-center">
                {verificationResult.isValid ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    <h3 className="text-xl font-bold text-green-600 mt-4">Document Verified ✓</h3>
                    <p className="text-kastom-muted mt-2">{verificationResult.message}</p>
                  </>
                ) : (
                  <>
                    <X className="w-16 h-16 text-red-600 mx-auto" />
                    <h3 className="text-xl font-bold text-red-600 mt-4">Verification Failed</h3>
                    <p className="text-kastom-muted mt-2">{verificationResult.message || 'Document has been tampered with'}</p>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowVerification(false);
                    setVerificationResult(null);
                  }}
                  className="mt-4 btn-primary w-full"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;