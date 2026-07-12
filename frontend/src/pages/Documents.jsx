import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
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
  Grid,
  List as ListIcon,
  Clock,
  Image,
  Music,
  FileArchive,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

function Documents() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [documents, setDocuments] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [categories, setCategories] = useState({});
  const [stats, setStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, statsRes] = await Promise.all([
        api.get('/documents'),
        api.get('/documents/stats')
      ]);

      const data = docsRes.data;
      setDocuments(data.documents || []);
      setAudioFiles(data.audioFiles || []);
      setAllFiles(data.allFiles || []);
      setCategories(data.categories || {});
      setStats(data.stats || {});
    } catch (error) {
      console.error('Fetch data error:', error);
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
      formData.append('category', selectedCategory === 'all' ? 'general' : selectedCategory);

      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Document uploaded successfully');
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  }, [selectedCategory]);

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

  const handleDelete = async (id, type) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      if (type === 'audio') {
        await api.delete(`/documents/audio/${id}`);
      } else {
        await api.delete(`/documents/${id}`);
      }
      toast.success('Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/documents/${file.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.title || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      'pdf': FileText,
      'image': Image,
      'audio': Music,
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
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const categoryLabels = {
    'legacy': 'Legacy Documents',
    'estate': 'Estate Documents',
    'asset': 'Asset Documents',
    'will_audio': 'Will Audio Recordings',
    'profile': 'Profile Photos',
    'general': 'General Documents',
    'all': 'All Documents'
  };

  const categoryIcons = {
    'legacy': FileArchive,
    'estate': Database,
    'asset': Grid,
    'will_audio': Music,
    'profile': Image,
    'general': FolderOpen,
    'all': FolderOpen
  };

  const filteredFiles = allFiles.filter(file => {
    const matchesSearch = file.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-kastom-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">My Documents</h1>
          <p className="text-kastom-muted mt-1">
            {stats.totalFiles || 0} files • {stats.totalSizeMB || '0'} MB used
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

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`card border-2 border-dashed transition-all duration-200 cursor-pointer mb-6
          ${isDragActive ? 'border-kastom-green bg-kastom-green-bg' : 'border-kastom-border hover:border-kastom-green/30'}`}
      >
        <input {...getInputProps()} />
        <div className="text-center py-8">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-kastom-green animate-spin" />
              <p className="mt-2 text-kastom-muted font-medium">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-kastom-green mx-auto mb-2" />
              <p className="text-sm font-medium text-kastom-dark">
                {isDragActive ? 'Drop your files here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-kastom-muted/60 mt-1">PDF, Images, Audio • Max 10MB</p>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-kastom-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-kastom-border rounded-xl focus:outline-none focus:ring-2 focus:ring-kastom-green focus:border-transparent text-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...Object.keys(categories)].map((cat) => {
          const Icon = categoryIcons[cat] || FolderOpen;
          const label = categoryLabels[cat] || cat;
          const count = cat === 'all' ? stats.totalFiles || 0 : categories[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
                ${selectedCategory === cat 
                  ? 'bg-kastom-green text-white shadow-md' 
                  : 'bg-white text-kastom-muted hover:bg-kastom-cream border border-kastom-border/50'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={`text-xs ${selectedCategory === cat ? 'text-white/80' : 'text-kastom-muted/60'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Files */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-kastom-muted mx-auto mb-4" />
          <p className="text-kastom-muted font-medium">No files found</p>
          <p className="text-sm text-kastom-muted/60 mt-1">Upload your first document</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.fileType);
            const color = getFileColor(file.fileType);
            const isImage = file.fileType === 'image';

            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card card-hover group overflow-hidden"
              >
                <div className="flex flex-col items-center text-center">
                  {isImage ? (
                    <div className="w-full h-28 rounded-lg overflow-hidden bg-kastom-cream mb-2">
                      <img 
                        src={file.fileUrl} 
                        alt={file.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-2xl bg-kastom-cream flex items-center justify-center ${color}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  )}
                  <p className="font-medium text-kastom-dark mt-2 text-sm line-clamp-2">{file.title}</p>
                  <p className="text-xs text-kastom-muted">{formatSize(file.fileSize || 0)}</p>
                  {file.category && (
                    <span className="text-xs text-kastom-muted/60 mt-1">{categoryLabels[file.category] || file.category}</span>
                  )}
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setSelectedDoc(file); setShowPreview(true); }}
                      className="p-1.5 rounded-lg hover:bg-kastom-cream"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-kastom-muted" />
                    </button>
                    <button 
                      onClick={() => handleDownload(file)}
                      className="p-1.5 rounded-lg hover:bg-kastom-cream"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-kastom-muted" />
                    </button>
                    <button 
                      onClick={() => handleDelete(file.id, file.type === 'audio' ? 'audio' : 'document')}
                      className="p-1.5 rounded-lg hover:bg-red-50"
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
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.fileType);
            const color = getFileColor(file.fileType);

            return (
              <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-kastom-border/50 hover:border-kastom-green/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <div>
                    <p className="font-medium text-kastom-dark text-sm">{file.title}</p>
                    <p className="text-xs text-kastom-muted">{formatSize(file.fileSize || 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelectedDoc(file); setShowPreview(true); }}><Eye className="w-4 h-4 text-kastom-muted" /></button>
                  <button onClick={() => handleDownload(file)}><Download className="w-4 h-4 text-kastom-muted" /></button>
                  <button onClick={() => handleDelete(file.id, file.type === 'audio' ? 'audio' : 'document')}><Trash2 className="w-4 h-4 text-kastom-danger" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-kastom-dark">{selectedDoc.title}</h2>
              <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg hover:bg-kastom-cream">
                <X className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>
            <div className="bg-kastom-cream rounded-xl p-4 min-h-[200px] flex items-center justify-center">
              {selectedDoc.fileType === 'image' ? (
                <img src={selectedDoc.fileUrl} alt={selectedDoc.title} className="max-w-full max-h-[400px] object-contain" />
              ) : selectedDoc.fileType === 'pdf' ? (
                <iframe src={selectedDoc.fileUrl} className="w-full h-[400px]" />
              ) : selectedDoc.fileType === 'audio' ? (
                <audio controls src={selectedDoc.fileUrl} className="w-full" />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-kastom-muted mx-auto" />
                  <p className="text-kastom-muted mt-2">Preview not available</p>
                  <button onClick={() => handleDownload(selectedDoc)} className="mt-4 btn-primary inline-flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              )}
            </div>
            {selectedDoc.description && <p className="text-kastom-muted mt-4">{selectedDoc.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;