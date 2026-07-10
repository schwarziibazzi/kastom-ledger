import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, 
  FileImage, 
  FileAudio, 
  File,
  Download,
  Eye,
  Search,
  FolderOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

function BeneficiaryDocuments() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/beneficiary/documents');
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Fetch documents error:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      'pdf': FileText,
      'image': FileImage,
      'audio': FileAudio
    };
    const Icon = icons[type] || File;
    return Icon;
  };

  const getFileColor = (type) => {
    const colors = {
      'pdf': 'text-red-500',
      'image': 'text-blue-500',
      'audio': 'text-purple-500'
    };
    return colors[type] || 'text-kastom-muted';
  };

  const filteredDocs = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.estate?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Documents</h1>
        <p className="text-kastom-muted mt-1">Documents shared with you as a beneficiary</p>
      </div>

      {/* Search */}
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

      <div className="card">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-kastom-muted" />
            </div>
            <p className="text-kastom-muted font-medium">No documents found</p>
            <p className="text-sm text-kastom-muted/60 mt-1">
              {searchQuery ? 'Try a different search term' : 'No documents have been shared with you yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const Icon = getFileIcon(doc.fileType);
              const color = getFileColor(doc.fileType);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-kastom-cream rounded-xl border border-kastom-border/50"
                >
                  <div className="flex items-center gap-4">
                    <Icon className={`w-6 h-6 ${color}`} />
                    <div>
                      <p className="font-medium text-kastom-dark">{doc.title}</p>
                      <p className="text-sm text-kastom-muted">
                        {doc.estate?.title} • {doc.fileType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white transition-colors">
                      <Eye className="w-4 h-4 text-kastom-muted" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white transition-colors">
                      <Download className="w-4 h-4 text-kastom-muted" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BeneficiaryDocuments;