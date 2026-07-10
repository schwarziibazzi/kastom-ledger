import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Circle, 
  User, 
  Users, 
  FileText, 
  BookOpen, 
  MessageCircle,
  Upload,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CreateLegacy() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileId, setProfileId] = useState(null);
  
  const [profile, setProfile] = useState({
    title: '',
    description: '',
    culturalNotes: ''
  });

  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    category: '',
    title: '',
    description: '',
    visibility: 'private'
  });

  const totalSteps = 6;
  const steps = [
    { id: 1, label: 'Personal', icon: User },
    { id: 2, label: 'Family', icon: Users },
    { id: 3, label: 'Documents', icon: FileText },
    { id: 4, label: 'Cultural', icon: BookOpen },
    { id: 5, label: 'Messages', icon: MessageCircle },
    { id: 6, label: 'Review', icon: CheckCircle },
  ];

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const user = response.data.user;
      
      if (user.legacyProfile) {
        setHasProfile(true);
        setProfileId(user.legacyProfile.id);
        setProfile({
          title: user.legacyProfile.title || '',
          description: user.legacyProfile.description || '',
          culturalNotes: user.legacyProfile.culturalNotes || ''
        });
        const itemsRes = await api.get('/legacy/items');
        setItems(itemsRes.data.items || []);
      }
    } catch (error) {
      console.error('Check profile error:', error);
    }
  };

  const handleProfileSubmit = async () => {
    setLoading(true);
    try {
      if (hasProfile) {
        await api.put(`/legacy/profile/${profileId}`, profile);
        toast.success('Legacy profile updated');
      } else {
        const response = await api.post('/legacy/profile', profile);
        setProfileId(response.data.profile.id);
        setHasProfile(true);
        toast.success('Legacy profile created');
      }
      setStep(step + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!currentItem.title || !currentItem.category) {
      toast.error('Please fill in title and category');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/legacy/items', currentItem);
      setItems([...items, response.data.item]);
      setCurrentItem({ category: '', title: '', description: '', visibility: 'private' });
      toast.success('Legacy item added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Personal Message',
    'Family History',
    'Important Document',
    'Business Information',
    'Property Information',
    'Cultural Responsibility',
    'Audio Recording',
    'Other'
  ];

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="input-label">Profile Title *</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="input-field"
                placeholder="e.g., Kasi Family Legacy"
                required
              />
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Tell your story..."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <label className="input-label">Cultural Notes</label>
            <textarea
              value={profile.culturalNotes}
              onChange={(e) => setProfile({ ...profile, culturalNotes: e.target.value })}
              className="input-field"
              rows="6"
              placeholder="Important cultural context, traditions, and family history..."
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Category *</label>
                <select
                  value={currentItem.category}
                  onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Title *</label>
                <input
                  type="text"
                  value={currentItem.title}
                  onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                  className="input-field"
                  placeholder="Item title"
                  required
                />
              </div>
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea
                value={currentItem.description}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Describe this item..."
              />
            </div>
            <div>
              <label className="input-label">Visibility</label>
              <select
                value={currentItem.visibility}
                onChange={(e) => setCurrentItem({ ...currentItem, visibility: e.target.value })}
                className="input-field"
              >
                <option value="private">Private (only you)</option>
                <option value="successors">Successors only</option>
                <option value="public">Public</option>
              </select>
            </div>
            <button
              onClick={handleAddItem}
              disabled={loading}
              className="btn-secondary inline-flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Add Legacy Item
            </button>
            {items.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-kastom-dark mb-3">
                  {items.length} item{items.length > 1 ? 's' : ''} added
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm text-kastom-muted">
                      <CheckCircle className="w-4 h-4 text-kastom-success" />
                      {item.title} ({item.category})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-kastom-green-bg rounded-2xl p-6">
              <h3 className="font-semibold text-kastom-dark mb-2">Cultural Knowledge</h3>
              <p className="text-kastom-muted text-sm mb-4">
                Preserve important cultural practices, traditions, and responsibilities.
              </p>
              <textarea
                value={profile.culturalNotes}
                onChange={(e) => setProfile({ ...profile, culturalNotes: e.target.value })}
                className="input-field"
                rows="6"
                placeholder="Record cultural knowledge, customs, and traditions..."
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-kastom-border p-6">
              <h3 className="font-semibold text-kastom-dark mb-4">Personal Messages</h3>
              <p className="text-kastom-muted text-sm mb-4">
                Leave messages for your family and future generations.
              </p>
              <textarea
                className="input-field"
                rows="8"
                placeholder="Write a personal message to your family..."
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-kastom-green-bg rounded-2xl p-6 border border-kastom-green/20">
              <h3 className="font-semibold text-kastom-dark mb-2">Review Your Legacy</h3>
              <p className="text-kastom-muted text-sm mb-4">
                Review everything before saving to the ledger.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-kastom-border">
                <CheckCircle className="w-5 h-5 text-kastom-success mt-0.5" />
                <div>
                  <p className="font-medium text-kastom-dark">Profile</p>
                  <p className="text-sm text-kastom-muted">{profile.title || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-kastom-border">
                <CheckCircle className="w-5 h-5 text-kastom-success mt-0.5" />
                <div>
                  <p className="font-medium text-kastom-dark">Legacy Items</p>
                  <p className="text-sm text-kastom-muted">{items.length} item{items.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-kastom-border">
                <CheckCircle className="w-5 h-5 text-kastom-success mt-0.5" />
                <div>
                  <p className="font-medium text-kastom-dark">Cultural Notes</p>
                  <p className="text-sm text-kastom-muted">
                    {profile.culturalNotes ? 'Recorded' : 'Not recorded'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleProfileSubmit}
              disabled={loading}
              className="w-full btn-primary inline-flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Save to Ledger
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-kastom-dark mb-8 tracking-tight">
        My Legacy
      </h1>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, index) => {
            const isActive = s.id === step;
            const isComplete = s.id < step;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isComplete ? 'bg-kastom-green text-white' : ''}
                    ${isActive ? 'bg-kastom-green text-white ring-4 ring-kastom-green/20' : ''}
                    ${!isActive && !isComplete ? 'bg-kastom-cream text-kastom-muted' : ''}
                  `}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-sm font-medium hidden md:block
                    ${isActive ? 'text-kastom-dark' : 'text-kastom-muted'}
                  `}>
                    {s.label}
                  </span>
                </div>
                {index < totalSteps - 1 && (
                  <div className={`w-8 md:w-12 h-0.5 mx-2
                    ${isComplete ? 'bg-kastom-green' : 'bg-kastom-border'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="card">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-kastom-border/50">
          <button
            onClick={() => setStep(step - 1)}
            className={`btn-secondary ${step === 1 ? 'invisible' : ''}`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          {step < totalSteps && step !== 3 && (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-primary inline-flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === 3 && (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-primary inline-flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateLegacy;