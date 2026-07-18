import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Shield, 
  HelpCircle,
  MessageCircle,
  Mail,
  ArrowRight,
  CheckCircle,
  BookOpen,
  FileText,
  Users,
  Landmark,
  Lock,
  Smartphone,
  Database,
  Home,
  Package,
  UserCheck,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

function FAQPage() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await api.get('/chatbot/faqs');
      setFaqs(response.data.faqs || []);
    } catch (error) {
      console.error('Fetch FAQs error:', error);
      // Fallback to local data if API fails
      setFaqs(getLocalFAQs());
    } finally {
      setLoading(false);
    }
  };

  const getLocalFAQs = () => {
    return [
      {
        id: 'faq-general-1',
        category: 'General Information',
        categoryKey: 'general',
        question: 'What is Kastom Ledger?',
        answer: 'Kastom Ledger is a secure digital platform designed to preserve family legacy, inheritance intentions, and important personal records for Papua New Guinea.',
        detailedAnswer: 'The platform operates within PNG\'s Sevis Digital Public Infrastructure (DPI). It authenticates through SevisPass and communicates with government agencies through SevisDEx.'
      },
      {
        id: 'faq-general-2',
        category: 'General Information',
        categoryKey: 'general',
        question: 'Who can use Kastom Ledger?',
        answer: 'Anyone with a SevisPass digital identity can use Kastom Ledger. The platform supports four user roles: Inheritance Owners, Beneficiaries, Witnesses, and Administrators.',
        detailedAnswer: 'Inheritance Owners have full access to create and manage estates. Beneficiaries have view-only access to inherited information. Witnesses verify important decisions. Administrators oversee system operations.'
      },
      {
        id: 'faq-estate-1',
        category: 'Estate Management',
        categoryKey: 'estate',
        question: 'What is an estate?',
        answer: 'An estate is a collection of all your assets, properties, and important records that you want to pass on to your loved ones.',
        detailedAnswer: 'This includes land, houses, vehicles, businesses, savings, investments, and family heirlooms. You can create multiple estates with different assets and beneficiaries.'
      },
      {
        id: 'faq-estate-2',
        category: 'Estate Management',
        categoryKey: 'estate',
        question: 'How do I create an estate?',
        answer: 'Go to your Dashboard and click "Create Estate" or navigate to the "My Estate" page. Provide a title and description for your estate.',
        detailedAnswer: 'After creating an estate, you can add assets, nominate beneficiaries, and create your Digital Will. The system tracks your completion percentage and guides you through each step.'
      },
      {
        id: 'faq-estate-3',
        category: 'Estate Management',
        categoryKey: 'estate',
        question: 'How do I add assets to my estate?',
        answer: 'You can add assets through the "Asset Registry" in your dashboard. For land assets, you can verify ownership through SevisDEx.',
        detailedAnswer: 'The asset registry supports multiple types including House, Land, Vehicle, Business, Livestock, Savings, Investment, Shares, and Digital Assets.'
      },
      {
        id: 'faq-beneficiary-1',
        category: 'Beneficiaries & Heirs',
        categoryKey: 'beneficiaries',
        question: 'What is a beneficiary?',
        answer: 'A beneficiary is an individual nominated by the Inheritance Owner to receive assets or responsibilities from the estate.',
        detailedAnswer: 'Beneficiaries can be family members, trusted friends, community leaders, or any individual you wish to inherit from your estate.'
      },
      {
        id: 'faq-beneficiary-2',
        category: 'Beneficiaries & Heirs',
        categoryKey: 'beneficiaries',
        question: 'How do I know if I\'ve been nominated as a beneficiary?',
        answer: 'You will receive a notification in your dashboard and an email invitation. When you log in, you\'ll see the estate details under "My Inherited Estates".',
        detailedAnswer: 'If you don\'t have a SevisPass account, the system will send an invitation via email. Once you create your SevisPass account, you can claim your beneficiary invitation.'
      },
      {
        id: 'faq-will-1',
        category: 'Digital Will',
        categoryKey: 'digitalWill',
        question: 'What is a Digital Will?',
        answer: 'A Digital Will is a legally-informed document that records your wishes for the distribution of your assets after your passing.',
        detailedAnswer: 'It includes asset distribution, beneficiary assignments, personal messages, and audio recordings. It is cryptographically signed and includes a tamper-evident seal.'
      },
      {
        id: 'faq-will-2',
        category: 'Digital Will',
        categoryKey: 'digitalWill',
        question: 'Can I record audio messages in my will?',
        answer: 'Yes! You can record personal audio messages for each section of your will - Introduction, Executor Notes, and Personal Messages.',
        detailedAnswer: 'Audio recordings add a personal and emotional dimension to your will. They are stored securely and can be listened to by your beneficiaries.'
      },
      {
        id: 'faq-will-3',
        category: 'Digital Will',
        categoryKey: 'digitalWill',
        question: 'How many witnesses do I need?',
        answer: 'At least 2 witnesses are required for a Digital Will. Witnesses must be added and verified before the will can be submitted.',
        detailedAnswer: 'Witnesses can be family members, community leaders, or trusted individuals who can confirm your identity and the authenticity of your will.'
      },
      {
        id: 'faq-sevis-1',
        category: 'Sevis Ecosystem',
        categoryKey: 'sevis',
        question: 'What is SevisPass?',
        answer: 'SevisPass is Papua New Guinea\'s official digital identity system. It provides a secure way to verify your identity when using government digital services.',
        detailedAnswer: 'SevisPass uses a Decentralized Identifier (DID) format and supports tiered verification (Tier-1, Tier-2, Minor).'
      },
      {
        id: 'faq-sevis-2',
        category: 'Sevis Ecosystem',
        categoryKey: 'sevis',
        question: 'What is SevisDEx?',
        answer: 'SevisDEx is the data exchange bridge that connects Kastom Ledger to government agencies like the Department of Lands.',
        detailedAnswer: 'SevisDEx operates on a peer-to-peer model. Instead of storing citizen data on central servers, it establishes encrypted direct connections between the citizen\'s SevisWallet and the requesting institution.'
      },
      {
        id: 'faq-sevis-3',
        category: 'Sevis Ecosystem',
        categoryKey: 'sevis',
        question: 'What is SevisWallet?',
        answer: 'SevisWallet is the mobile application that stores your SevisPass and other digital credentials. It is securely bound to your verified phone number.',
        detailedAnswer: 'SevisWallet does not have its own ID - it is bound to your phone number during setup. It can store multiple credentials including SevisPass, driver\'s license, and academic records.'
      },
      {
        id: 'faq-security-1',
        category: 'Security & Privacy',
        categoryKey: 'security',
        question: 'Is my data secure?',
        answer: 'Yes. All data is encrypted and stored securely. Every action is recorded in a tamper-evident ledger using SHA-256 hashing.',
        detailedAnswer: 'The system uses multiple layers of security: SHA-256 hashing, digital signatures, JWT authentication, role-based access control, rate limiting, and CORS protection.'
      },
      {
        id: 'faq-security-2',
        category: 'Security & Privacy',
        categoryKey: 'security',
        question: 'How does the tamper-evident ledger work?',
        answer: 'The ledger uses blockchain-inspired technology. Every action creates a hash linked to the previous action, making tampering immediately detectable.',
        detailedAnswer: 'Each new entry contains the hash of the previous entry. Any modification of a previous entry would change its hash and break the entire chain, making tampering immediately obvious.'
      },
      {
        id: 'faq-security-3',
        category: 'Security & Privacy',
        categoryKey: 'security',
        question: 'Who can access my data?',
        answer: 'Only you (the estate owner) have full access. Beneficiaries can only see what you have explicitly shared with them. Administrators cannot view or edit your estate content.',
        detailedAnswer: 'The system follows the principle of least privilege. Each role has strictly defined permissions based on their responsibilities.'
      },
      {
        id: 'faq-death-1',
        category: 'Death & Succession',
        categoryKey: 'death',
        question: 'What happens when the estate owner passes away?',
        answer: 'The executor or beneficiary uploads the death certificate to initiate the succession process. The system verifies the death and transfers assets to beneficiaries.',
        detailedAnswer: 'The process: Death certificate is uploaded → SevisDEx verifies with Civil Registry → Public Curator is notified → Estate is flagged for administration → Assets are transferred.'
      },
      {
        id: 'faq-death-2',
        category: 'Death & Succession',
        categoryKey: 'death',
        question: 'What is an executor?',
        answer: 'The executor is appointed by the estate owner to manage estate administration after death. They upload the death certificate and manage the estate progress.',
        detailedAnswer: 'Executors can be family members, lawyers, or trusted individuals. They have administrative access to the estate after death verification but cannot change the will.'
      },
      {
        id: 'faq-documents-1',
        category: 'Documents & Files',
        categoryKey: 'documents',
        question: 'What file types are supported?',
        answer: 'Supported file types include PDF, Images (JPG, PNG, GIF, WEBP), and Audio (MP3, WAV, OGG).',
        detailedAnswer: 'Documents are automatically categorized as Legacy Documents, Estate Documents, Asset Documents, Will Audio Recordings, Profile Photos, or General Documents.'
      },
      {
        id: 'faq-documents-2',
        category: 'Documents & Files',
        categoryKey: 'documents',
        question: 'How do I download a document?',
        answer: 'Click the download button (arrow icon) next to the document. The file will be saved to your device with its original name.',
        detailedAnswer: 'Documents are downloaded from the server with proper file headers. The download button is available for all file types and works on both mobile and desktop devices.'
      }
    ];
  };

  const categories = [
    { id: 'all', label: 'All Questions', icon: BookOpen },
    { id: 'general', label: 'General', icon: Shield },
    { id: 'estate', label: 'Estate', icon: Home },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    { id: 'digitalWill', label: 'Digital Will', icon: FileText },
    { id: 'sevis', label: 'Sevis Ecosystem', icon: Database },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'death', label: 'Succession', icon: Clock },
    { id: 'documents', label: 'Documents', icon: Package }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (faq.detailedAnswer && faq.detailedAnswer.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || faq.categoryKey === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kastom-cream">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin mx-auto"></div>
          <p className="mt-4 text-kastom-muted font-medium">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kastom-cream">
      {/* Hero Section */}
      <section className="bg-kastom-dark text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-kastom-green/20 text-kastom-green-bright px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How Can We Help?</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Find answers to commonly asked questions about Kastom Ledger
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kastom-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-kastom-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-kastom-green focus:border-transparent text-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                    ${activeCategory === category.id
                      ? 'bg-kastom-green text-white'
                      : 'bg-white text-kastom-muted hover:bg-kastom-cream border border-kastom-border/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-kastom-muted" />
              </div>
              <p className="text-kastom-muted font-medium">No results found</p>
              <p className="text-sm text-kastom-muted/60 mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-premium border border-kastom-border/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-kastom-cream/50 transition-colors"
                  >
                    <span className="font-medium text-kastom-dark text-lg">{faq.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-kastom-muted flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-kastom-muted flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-kastom-muted leading-relaxed border-t border-kastom-border/50 pt-4">
                          <p className="text-base">{faq.answer}</p>
                          {faq.detailedAnswer && (
                            <div className="mt-4 p-4 bg-kastom-green-bg rounded-xl border border-kastom-green/10">
                              <p className="text-sm text-kastom-dark">
                                <span className="font-medium">📖 More info:</span> {faq.detailedAnswer}
                              </p>
                            </div>
                          )}
                          {faq.categoryKey === 'sevis' && (
                            <div className="mt-4 p-4 bg-kastom-green-bg rounded-xl border border-kastom-green/10">
                              <p className="text-sm text-kastom-dark flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-kastom-green" />
                                <span className="font-medium">Learn more:</span>
                                <Link to="/connected-services" className="text-kastom-green hover:underline">
                                  Connected Services →
                                </Link>
                              </p>
                            </div>
                          )}
                          {faq.categoryKey === 'digitalWill' && isAuthenticated && (
                            <div className="mt-4 p-4 bg-kastom-green-bg rounded-xl border border-kastom-green/10">
                              <p className="text-sm text-kastom-dark flex items-center gap-2">
                                <FileText className="w-4 h-4 text-kastom-green" />
                                <span className="font-medium">Ready to create your will?</span>
                                <Link to="/will" className="text-kastom-green hover:underline">
                                  Get started →
                                </Link>
                              </p>
                            </div>
                          )}
                          {faq.categoryKey === 'estate' && isAuthenticated && (
                            <div className="mt-4 p-4 bg-kastom-green-bg rounded-xl border border-kastom-green/10">
                              <p className="text-sm text-kastom-dark flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-kastom-green" />
                                <span className="font-medium">Manage your estate:</span>
                                <Link to="/estate" className="text-kastom-green hover:underline">
                                  Go to My Estate →
                                </Link>
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help? */}
      <section className="px-4 py-16 bg-white border-t border-kastom-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-kastom-dark mb-4">Still Need Help?</h2>
          <p className="text-kastom-muted mb-8 max-w-2xl mx-auto">
            Our support team is ready to assist you with any questions about Kastom Ledger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary inline-flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </button>
            <button className="btn-secondary inline-flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Support
            </button>
            {!isAuthenticated && (
              <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
                Create Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default FAQPage;