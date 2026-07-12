import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleProvider';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Package, 
  Home, 
  Car, 
  Landmark, 
  Building, 
  PiggyBank, 
  Coins, 
  FileText,
  Eye,
  MapPin,
  DollarSign,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

function BeneficiaryAssets() {
  const { user } = useAuth();
  const { isBeneficiary } = useRole();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!isBeneficiary) {
      return;
    }
    fetchAssets();
  }, [isBeneficiary]);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/beneficiary/assets');
      setAssets(response.data.assets || []);
    } catch (error) {
      console.error('Fetch assets error:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const getAssetIcon = (type) => {
    const icons = {
      'HOUSE': Home,
      'LAND': Landmark,
      'VEHICLE': Car,
      'BUSINESS': Building,
      'LIVESTOCK': PiggyBank,
      'SAVINGS': Coins,
      'INVESTMENT': Coins,
      'SHARES': Coins,
      'DIGITAL_ASSETS': Package,
      'FAMILY_HEIRLOOM': Package,
      'DOCUMENTS': FileText,
      'OTHER': Package
    };
    return icons[type] || Package;
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 0
    }).format(value);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  const assetTypes = ['all', ...new Set(assets.map(a => a.type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Inherited Assets</h1>
        <p className="text-kastom-muted mt-1">Assets allocated to you as a beneficiary</p>
        {assets.length > 0 && (
          <p className="text-sm text-kastom-muted/60 mt-1">
            View-only access • {assets.length} asset{assets.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-kastom-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-kastom-border rounded-xl focus:outline-none focus:ring-2 focus:ring-kastom-green focus:border-transparent text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field md:w-48"
        >
          {assetTypes.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-kastom-muted" />
          </div>
          <p className="text-kastom-muted font-medium">No assets found</p>
          <p className="text-sm text-kastom-muted/60 mt-1">
            {searchQuery || filterType !== 'all' ? 'Try adjusting your filters' : 'No assets have been assigned to you yet'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const Icon = getAssetIcon(asset.type);
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card card-hover"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-kastom-green-bg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-kastom-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-kastom-dark">{asset.title}</h4>
                      <p className="text-sm text-kastom-muted">{asset.type}</p>
                    </div>
                  </div>
                  <span className="badge badge-muted text-xs">View Only</span>
                </div>

                {asset.description && (
                  <p className="text-sm text-kastom-muted mt-2 line-clamp-2">
                    {asset.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {asset.estimatedValue && (
                    <span className="text-sm font-medium text-kastom-green">
                      {formatCurrency(asset.estimatedValue)}
                    </span>
                  )}
                  {asset.location && (
                    <span className="text-xs text-kastom-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {asset.location}
                    </span>
                  )}
                </div>

                {asset.estate && (
                  <p className="text-xs text-kastom-muted/60 mt-2">
                    From: {asset.estate.title}
                  </p>
                )}

                {asset.beneficiary && asset.beneficiary.sharePercentage && (
                  <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full inline-block">
                    {asset.beneficiary.sharePercentage}% share
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BeneficiaryAssets;