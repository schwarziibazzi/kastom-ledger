import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { 
  FolderOpen, 
  Upload, 
  File, 
  FileImage, 
  FileText, 
  FileAudio, 
  Grid3x3, 
  List,
  Search,
  Download,
  Trash2,
  Eye,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Documents() {
  const [view, setView] = useState('grid');
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Family Tree.pdf', type: 'pdf', size: '2.4 MB', date: '2026-07-01', category: 'Family' },
    { id: 2, name: 'Land Titles.pdf', type: 'pdf', size: '1.8 MB', date: '2026-06-28', category: 'Property' },
    { id: 3, name: 'Cultural Practices.pdf', type: 'pdf', size: '3.2 MB', date: '2026-06-25', category: 'Cultural' },
    { id: 4, name: 'Family Photo.jpg', type: 'image', size: '4.1 MB', date: '2026-06-20', category: 'Photos' },
    { id: 5, name: 'Recording.mp3', type: 'audio', size: '8.5 MB', date: '2026-06-18', category: 'Audio' },
  ]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newDocs = acceptedFiles.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        type: file.type.includes('image') ? 'image' : 
              file.type.includes('pdf') ? 'pdf' : 
              file.type.includes('audio') ? 'audio' : 'file',
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        date: new Date().toISOString().split('T')[0],
        category: 'Uploaded'
      }));
      setDocuments([...newDocs, ...documents]);
      setUploading(false);
      toast.success(`${acceptedFiles.length} document(s) uploaded`);
    }, 1500);
  }, [documents]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'text/*': ['.txt', '.csv']
    },
    maxSize: 10485760
  });

  const getFileIcon = (type) => {
    const icons = {
      'pdf': FileText,
      'image': FileImage,
      'audio': FileAudio,
      'file': File
    };
    const Icon = icons[type] || File;
    return Icon;
  };

  const getFileColor = (type) => {
    const colors = {
      'pdf': 'text-red-500',
      'image': 'text-blue-500',
      'audio': 'text-purple-500',
      'file': 'text-kastom-muted'
    };
    return colors[type] || 'text-kastom-muted';
  };

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Documents</h1>
          <p className="text-kastom-muted mt-1">Manage your legacy documents and files</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-kastom-green-bg text-kastom-green' : 'text-kastom-muted hover:bg-kastom-cream'}`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-kastom-green-bg text-kastom-green' : 'text-kastom-muted hover:bg-kastom-cream'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`card border-2 border-dashed transition-all duration-200 cursor-pointer mb-8
          ${isDragActive ? 'border-kastom-green bg-kastom-green-bg' : 'border-kastom-border hover:border-kastom-green/30'}`}
      >
        <input {...getInputProps()} />
        <div className="text-center py-12">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
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

      {/* Document Grid/List */}
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
            const Icon = getFileIcon(doc.type);
            const color = getFileColor(doc.type);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card card-hover"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center ${color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <p className="font-medium text-kastom-dark mt-3 text-sm line-clamp-2">{doc.name}</p>
                  <p className="text-xs text-kastom-muted mt-1">{doc.size} • {doc.date}</p>
                  {doc.category && (
                    <span className="badge badge-muted mt-2 text-xs">{doc.category}</span>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
                      <Eye className="w-4 h-4 text-kastom-muted" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
                      <Download className="w-4 h-4 text-kastom-muted" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
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
            const Icon = getFileIcon(doc.type);
            const color = getFileColor(doc.type);
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
                    <p className="font-medium text-kastom-dark">{doc.name}</p>
                    <p className="text-sm text-kastom-muted">{doc.size} • {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.category && (
                    <span className="badge badge-muted text-xs">{doc.category}</span>
                  )}
                  <button className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
                    <Download className="w-4 h-4 text-kastom-muted" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
                    <Trash2 className="w-4 h-4 text-kastom-danger" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Documents;