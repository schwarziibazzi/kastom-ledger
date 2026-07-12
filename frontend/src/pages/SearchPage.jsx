import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleProvider';
import api from '../services/api';
import { 
  Search, 
  FileText, 
  Users, 
  Package, 
  Clock,
  FolderOpen,
  User,
  Shield,
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SearchPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    assets: [],
    beneficiaries: [],
    documents: [],
    estates: [],
    users: []
  });
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ assets: [], beneficiaries: [], documents: [], estates: [], users: [] });
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data.results || { assets: [], beneficiaries: [], documents: [], estates: [], users: [] });

      // Save to recent searches
      const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ assets: [], beneficiaries: [], documents: [], estates: [], users: [] });
  };

  const getResultIcon = (type) => {
    const icons = {
      asset: Package,
      beneficiary: Users,
      document: FileText,
      estate: FolderOpen,
      user: User
    };
    return icons[type] || FileText;
  };

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Search</h1>
        <p className="text-kastom-muted mt-1">Find assets, beneficiaries, documents, and more</p>
      </div>

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kastom-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search your estate..."
            className="w-full pl-12 pr-12 py-4 bg-kastom-cream border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-kastom-green text-lg"
            autoFocus
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-kastom-border/30 transition-colors"
            >
              <X className="w-5 h-5 text-kastom-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
        </div>
      )}

      {/* Results */}
      {!loading && query && (
        <div>
          <p className="text-sm text-kastom-muted mb-4">
            {totalResults} result{totalResults !== 1 ? 's' : ''} found
          </p>

          {totalResults === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-kastom-muted" />
              </div>
              <p className="text-kastom-muted font-medium">No results found</p>
              <p className="text-sm text-kastom-muted/60 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Assets */}
              {results.assets.length > 0 && (
                <div>
                  <h3 className="font-semibold text-kastom-dark mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-kastom-green" />
                    Assets ({results.assets.length})
                  </h3>
                  <div className="space-y-2">
                    {results.assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-kastom-border/50">
                        <div>
                          <p className="font-medium text-kastom-dark">{asset.title}</p>
                          <p className="text-sm text-kastom-muted">{asset.type} • {asset.estate?.title}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-kastom-muted" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Beneficiaries */}
              {results.beneficiaries.length > 0 && (
                <div>
                  <h3 className="font-semibold text-kastom-dark mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-kastom-green" />
                    Beneficiaries ({results.beneficiaries.length})
                  </h3>
                  <div className="space-y-2">
                    {results.beneficiaries.map((beneficiary) => (
                      <div key={beneficiary.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-kastom-border/50">
                        <div>
                          <p className="font-medium text-kastom-dark">{beneficiary.user?.name}</p>
                          <p className="text-sm text-kastom-muted">{beneficiary.relationship} • {beneficiary.estate?.title}</p>
                        </div>
                        <span className={`badge ${beneficiary.status === 'accepted' ? 'badge-success' : 'badge-pending'}`}>
                          {beneficiary.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {results.documents.length > 0 && (
                <div>
                  <h3 className="font-semibold text-kastom-dark mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-kastom-green" />
                    Documents ({results.documents.length})
                  </h3>
                  <div className="space-y-2">
                    {results.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-kastom-border/50">
                        <div>
                          <p className="font-medium text-kastom-dark">{doc.title}</p>
                          <p className="text-sm text-kastom-muted">{doc.fileType} • {doc.estate?.title}</p>
                        </div>
                        <button className="text-kastom-green hover:underline text-sm">View</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users (Admin only) */}
              {role === 'ADMINISTRATOR' && results.users.length > 0 && (
                <div>
                  <h3 className="font-semibold text-kastom-dark mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-kastom-green" />
                    Users ({results.users.length})
                  </h3>
                  <div className="space-y-2">
                    {results.users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-kastom-border/50">
                        <div>
                          <p className="font-medium text-kastom-dark">{u.name}</p>
                          <p className="text-sm text-kastom-muted">{u.sevispassUid} • {u.role}</p>
                        </div>
                        <span className={`badge ${u.verificationStatus === 'verified' ? 'badge-success' : 'badge-pending'}`}>
                          {u.verificationStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-kastom-dark mb-4">Recent Searches</h3>
          <div className="space-y-2">
            {recentSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(term);
                  handleSearch(term);
                }}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-kastom-cream transition-colors"
              >
                <Clock className="w-4 h-4 text-kastom-muted" />
                <span className="text-kastom-dark">{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;