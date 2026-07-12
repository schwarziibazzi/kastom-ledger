import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, 
  User, 
  Users, 
  Package, 
  MessageCircle, 
  UserCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Circle,
  Shield,
  Loader2,
  Plus,
  X,
  Trash2,
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  File
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function DigitalWillPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [estates, setEstates] = useState([]);
  const [selectedEstate, setSelectedEstate] = useState(null);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [newWitness, setNewWitness] = useState({
    name: '',
    email: '',
    relationship: ''
  });
  const [willData, setWillData] = useState({
    estateId: '',
    introduction: '',
    introductionAudio: null,
    executorNotes: '',
    executorAudio: null,
    personalMessages: '',
    messagesAudio: null,
    witnesses: []
  });

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentField, setCurrentField] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchEstates();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const fetchEstates = async () => {
    try {
      const response = await api.get('/estates');
      setEstates(response.data.estates || []);
    } catch (error) {
      console.error('Fetch estates error:', error);
      toast.error('Failed to load estates');
    }
  };

  const startRecording = async (field) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result;
          setWillData(prev => ({
            ...prev,
            [field]: base64Audio
          }));
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentField(field);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Unable to access microphone. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      toast.success('Recording stopped');
    }
  };

  const togglePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearAudio = (field) => {
    setWillData(prev => ({
      ...prev,
      [field]: null
    }));
    setAudioUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    toast.success('Audio removed');
  };

  const handleSubmit = async () => {
    if (!willData.estateId) {
      toast.error('Please select an estate');
      return;
    }
    if (willData.witnesses.length < 2) {
      toast.error('Please add at least 2 witnesses');
      return;
    }
    
    setSubmitting(true);
    try {
      const submitData = {
        estateId: willData.estateId,
        introduction: willData.introduction,
        introductionAudio: willData.introductionAudio,
        executorNotes: willData.executorNotes,
        executorAudio: willData.executorAudio,
        personalMessages: willData.personalMessages,
        messagesAudio: willData.messagesAudio,
        witnesses: willData.witnesses
      };
      
      const response = await api.post('/will', submitData);
      
      // If submission successful, generate PDF
      if (response.data.will) {
        await generatePDF(response.data.will.id);
      }
      
      toast.success('Digital Will created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Create will error:', error);
      toast.error(error.response?.data?.message || 'Failed to create will');
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = async (willId) => {
    setGeneratingPdf(true);
    try {
      const response = await api.post(`/will/${willId}/generate-pdf`);
      if (response.data.success) {
        toast.success('PDF generated successfully!');
      }
    } catch (error) {
      console.error('Generate PDF error:', error);
      toast.error('Failed to generate PDF, but will was created.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const removeWitness = (index) => {
    const updatedWitnesses = willData.witnesses.filter((_, i) => i !== index);
    setWillData({ ...willData, witnesses: updatedWitnesses });
  };

  const steps = [
    { id: 1, label: 'Introduction', icon: FileText },
    { id: 2, label: 'Executor', icon: User },
    { id: 3, label: 'Assets', icon: Package },
    { id: 4, label: 'Beneficiaries', icon: Users },
    { id: 5, label: 'Messages', icon: MessageCircle },
    { id: 6, label: 'Witnesses', icon: UserCheck }
  ];

  const renderAudioRecorder = (field, label) => {
    const audioData = willData[field];
    const isActive = currentField === field && isRecording;

    return (
      <div className="mt-3 p-4 bg-kastom-cream rounded-xl border border-kastom-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-kastom-dark">Audio Recording</span>
          {audioData && (
            <button
              onClick={() => clearAudio(field)}
              className="text-xs text-kastom-danger hover:underline"
            >
              Remove
            </button>
          )}
        </div>
        
        {audioData ? (
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayAudio}
              className="w-10 h-10 rounded-full bg-kastom-green text-white flex items-center justify-center hover:bg-kastom-green-light transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex-1">
              <audio
                ref={audioRef}
                src={audioUrl || URL.createObjectURL(new Blob([audioData]))}
                onEnded={handleAudioEnded}
                onTimeUpdate={(e) => setAudioDuration(e.target.currentTime)}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-kastom-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-kastom-green transition-all duration-300"
                    style={{ width: `${(audioDuration / (audioRef.current?.duration || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-kastom-muted font-mono">
                  {formatTime(Math.floor(audioDuration))} / {formatTime(Math.floor(audioRef.current?.duration || 0))}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-kastom-muted" /> : <Volume2 className="w-4 h-4 text-kastom-muted" />}
            </button>
          </div>
        ) : isActive ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-medium text-red-500">Recording...</span>
            </div>
            <span className="text-sm font-mono text-kastom-muted">{formatTime(recordingTime)}</span>
            <button
              onClick={stopRecording}
              className="ml-auto w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => startRecording(field)}
            className="inline-flex items-center gap-2 text-sm text-kastom-green hover:text-kastom-green-light transition-colors"
          >
            <Mic className="w-4 h-4" />
            Record {label}
          </button>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="input-label">Select Estate *</label>
              <select
                value={willData.estateId}
                onChange={(e) => {
                  const estate = estates.find(est => est.id === e.target.value);
                  setSelectedEstate(estate);
                  setWillData({ ...willData, estateId: e.target.value });
                }}
                className="input-field"
                required
              >
                <option value="">Select an estate</option>
                {estates.map((estate) => (
                  <option key={estate.id} value={estate.id}>
                    {estate.title} ({estate.status})
                  </option>
                ))}
              </select>
              {selectedEstate && (
                <div className="mt-2 text-sm text-kastom-muted">
                  <p>Assets: {selectedEstate.assets?.length || 0}</p>
                  <p>Beneficiaries: {selectedEstate.beneficiaries?.length || 0}</p>
                </div>
              )}
            </div>
            <div>
              <label className="input-label">Introduction</label>
              <textarea
                value={willData.introduction}
                onChange={(e) => setWillData({ ...willData, introduction: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Begin your will with a personal introduction..."
              />
              {renderAudioRecorder('introductionAudio', 'Introduction')}
              <p className="text-xs text-kastom-muted/60 mt-2">
                Record your introduction in your own voice for a personal touch.
              </p>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <label className="input-label">Executor Notes</label>
            <textarea
              value={willData.executorNotes}
              onChange={(e) => setWillData({ ...willData, executorNotes: e.target.value })}
              className="input-field"
              rows="6"
              placeholder="Instructions for your executor..."
            />
            {renderAudioRecorder('executorAudio', 'Executor Notes')}
            <p className="text-xs text-kastom-muted/60 mt-2">
              The executor is responsible for carrying out your wishes after your passing.
            </p>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-sm text-kastom-muted">Your assets will be listed from your estate</p>
            {selectedEstate?.assets?.length > 0 ? (
              <div className="space-y-2">
                {selectedEstate.assets.map((asset) => (
                  <div key={asset.id} className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                    <CheckCircle className="w-5 h-5 text-kastom-green flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-kastom-dark">{asset.title}</p>
                      <p className="text-sm text-kastom-muted">
                        {asset.type} • {asset.estimatedValue ? `PGK ${asset.estimatedValue.toLocaleString()}` : 'No value'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-kastom-cream rounded-xl">
                <Package className="w-12 h-12 text-kastom-muted mx-auto mb-2" />
                <p className="text-kastom-muted font-medium">No assets found</p>
                <p className="text-sm text-kastom-muted/60 mt-1">Please add assets to your estate first</p>
                <button
                  onClick={() => navigate('/assets/create')}
                  className="mt-3 btn-primary text-sm px-4 py-2 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Asset
                </button>
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-sm text-kastom-muted">Your beneficiaries will be listed from your estate</p>
            {selectedEstate?.beneficiaries?.length > 0 ? (
              <div className="space-y-2">
                {selectedEstate.beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.id} className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                    <Users className="w-5 h-5 text-kastom-green flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-kastom-dark">{beneficiary.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-kastom-muted">
                        {beneficiary.relationship} • {beneficiary.sharePercentage || 'No'}% share
                      </p>
                    </div>
                    <span className={`badge ${beneficiary.status === 'accepted' ? 'badge-success' : 'badge-pending'}`}>
                      {beneficiary.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-kastom-cream rounded-xl">
                <Users className="w-12 h-12 text-kastom-muted mx-auto mb-2" />
                <p className="text-kastom-muted font-medium">No beneficiaries found</p>
                <p className="text-sm text-kastom-muted/60 mt-1">Please add beneficiaries to your estate first</p>
                <button
                  onClick={() => navigate('/beneficiaries/add')}
                  className="mt-3 btn-primary text-sm px-4 py-2 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Beneficiary
                </button>
              </div>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <label className="input-label">Personal Messages</label>
            <textarea
              value={willData.personalMessages}
              onChange={(e) => setWillData({ ...willData, personalMessages: e.target.value })}
              className="input-field"
              rows="8"
              placeholder="Leave a personal message for your family..."
            />
            {renderAudioRecorder('messagesAudio', 'Personal Message')}
            <p className="text-xs text-kastom-muted/60 mt-2">
              This message will be shared with your loved ones after your passing.
            </p>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-kastom-muted">Add witnesses to verify your will</p>
              <span className="text-sm font-medium text-kastom-dark">
                {willData.witnesses.length} witness{willData.witnesses.length !== 1 ? 'es' : ''}
              </span>
            </div>
            
            <button 
              onClick={() => setShowWitnessModal(true)}
              className="btn-secondary inline-flex items-center gap-2 text-sm w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Witness
            </button>
            
            {willData.witnesses.length === 0 ? (
              <div className="text-center py-8 bg-kastom-cream rounded-xl">
                <UserCheck className="w-12 h-12 text-kastom-muted mx-auto mb-2" />
                <p className="text-kastom-muted font-medium">No witnesses added yet</p>
                <p className="text-sm text-kastom-muted/60 mt-1">
                  Add at least 2 witnesses to verify your will
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {willData.witnesses.map((w, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                    <div>
                      <p className="font-medium text-kastom-dark">{w.name}</p>
                      <div className="flex items-center gap-2 text-sm text-kastom-muted">
                        <span>{w.email}</span>
                        {w.relationship && <span>• {w.relationship}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${w.status === 'verified' ? 'badge-success' : 'badge-pending'}`}>
                        {w.status || 'Pending'}
                      </span>
                      <button
                        onClick={() => removeWitness(index)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-kastom-danger" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {willData.witnesses.length > 0 && (
              <p className={`text-xs text-center ${willData.witnesses.length >= 2 ? 'text-kastom-success' : 'text-kastom-muted/60'}`}>
                {willData.witnesses.length < 2 ? 'Need at least 2 witnesses' : '✓ Minimum witnesses met'}
              </p>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Digital Will</h1>
        <p className="text-kastom-muted mt-1">Create your legally-binding digital will</p>
        {generatingPdf && (
          <div className="mt-2 inline-flex items-center gap-2 text-sm text-kastom-green">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating PDF...
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
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
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-12 h-0.5 mx-2
                    ${isComplete ? 'bg-kastom-green' : 'bg-kastom-border'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-kastom-border/50">
          <button
            onClick={() => setStep(step - 1)}
            className={`btn-secondary ${step === 1 ? 'invisible' : ''}`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          {step < steps.length ? (
            <button
              onClick={() => {
                if (step === 6 && willData.witnesses.length < 2) {
                  toast.error('Please add at least 2 witnesses');
                  return;
                }
                setStep(step + 1);
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || submitting || generatingPdf}
              className="btn-primary inline-flex items-center gap-2"
            >
              {submitting || generatingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {generatingPdf ? 'Generating PDF...' : 'Saving...'}
                </>
              ) : (
                <>
                  <File className="w-4 h-4" />
                  Submit & Generate PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showWitnessModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-premium-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-kastom-dark">Add Witness</h2>
              <button 
                onClick={() => setShowWitnessModal(false)} 
                className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
              >
                <X className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newWitness.name || !newWitness.email) {
                toast.error('Please fill in all required fields');
                return;
              }
              setWillData({
                ...willData,
                witnesses: [...willData.witnesses, { 
                  ...newWitness, 
                  status: 'pending',
                  id: Date.now().toString()
                }]
              });
              setNewWitness({ name: '', email: '', relationship: '' });
              setShowWitnessModal(false);
              toast.success('Witness added successfully');
            }}>
              <div className="mb-4">
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  value={newWitness.name}
                  onChange={(e) => setNewWitness({ ...newWitness, name: e.target.value })}
                  className="input-field"
                  placeholder="Witness full name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  value={newWitness.email}
                  onChange={(e) => setNewWitness({ ...newWitness, email: e.target.value })}
                  className="input-field"
                  placeholder="witness@email.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="input-label">Relationship (Optional)</label>
                <input
                  type="text"
                  value={newWitness.relationship}
                  onChange={(e) => setNewWitness({ ...newWitness, relationship: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Elder, Lawyer, Friend"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Add Witness
                </button>
                <button
                  type="button"
                  onClick={() => setShowWitnessModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default DigitalWillPage;