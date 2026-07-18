// Complete knowledge base for the chatbot
const knowledgeBase = {
  categories: {
    general: {
      name: 'General Information',
      questions: [
        {
          keywords: ['what is kastom ledger', 'about kastom ledger', 'purpose', 'overview', 'what does it do'],
          answer: 'Kastom Ledger is a secure digital platform designed to preserve family legacy, inheritance intentions, and important personal records for Papua New Guinea. It allows individuals to record their wishes, nominate successors, manage assets, and create a digital will in a tamper-evident system that respects customary practices.',
          detailedAnswer: 'The platform operates within PNG\'s Sevis Digital Public Infrastructure (DPI). It authenticates through SevisPass and communicates with government agencies through SevisDEx. Kastom Ledger never replaces customary law, legal processes, or family decision-making - it preserves evidence and intent, recording who created what, when, and with whom.'
        },
        {
          keywords: ['who can use', 'users', 'audience', 'target users', 'who is it for'],
          answer: 'Anyone with a SevisPass digital identity can use Kastom Ledger. The platform supports four user roles: Inheritance Owners (creating estates), Beneficiaries/Heirs (receiving inheritance), Witnesses (verifying decisions), and Administrators (managing the system).',
          detailedAnswer: 'Inheritance Owners have full access to create and manage estates, add assets, nominate beneficiaries, and create digital wills. Beneficiaries have view-only access to inherited information. Witnesses verify important decisions. Administrators oversee system operations and government integrations.'
        },
        {
          keywords: ['free', 'cost', 'price', 'payment', 'money'],
          answer: 'Kastom Ledger is a government-backed digital service designed to serve all Papua New Guineans. There is no cost to create an account, record your legacy, or manage your estate.',
          detailedAnswer: 'The platform is funded through the government\'s digital transformation initiative and is provided as a free public service to all citizens with SevisPass authentication.'
        },
        {
          keywords: ['sevispass enabled', 'sevispass verification', 'identity verification'],
          answer: 'Kastom Ledger uses SevisPass, PNG\'s official digital identity system, to verify your identity. This ensures that only you can access and manage your estate information.',
          detailedAnswer: 'When you log in through SevisPass, you authenticate using your SevisWallet. The system receives a verified identity token that includes your name, UID, and verification status. Kastom Ledger never stores your password - it only receives verified identity information from SevisPass.'
        }
      ]
    },
    estate: {
      name: 'Estate Management',
      questions: [
        {
          keywords: ['estate', 'what is an estate', 'define estate', 'estate meaning'],
          answer: 'An estate is a collection of all your assets, properties, and important records that you want to pass on to your loved ones. This includes land, houses, vehicles, businesses, savings, investments, and family heirlooms.',
          detailedAnswer: 'In Kastom Ledger, an estate serves as the container for all your legacy planning. You can create multiple estates, each with its own assets, beneficiaries, and digital will. The estate tracks completion status and provides a visual workflow from creation to completion.'
        },
        {
          keywords: ['create estate', 'how to create estate', 'add estate', 'new estate'],
          answer: 'To create an estate, go to your Dashboard and click "Create Estate" or navigate to the "My Estate" page. You\'ll need to provide a title and description for your estate.',
          detailedAnswer: 'After creating an estate, you can add assets, nominate beneficiaries, and create your Digital Will. The system tracks your completion percentage and guides you through each step of the estate planning process.'
        },
        {
          keywords: ['add asset', 'asset registry', 'property', 'land title', 'register asset'],
          answer: 'You can add assets through the "Asset Registry" in your dashboard. For land assets, you can verify ownership through SevisDEx which connects to the Department of Lands. Simply enter the title number and the system will verify it with the government registry.',
          detailedAnswer: 'The asset registry supports multiple types including House, Land, Vehicle, Business, Livestock, Savings, Investment, Shares, Digital Assets, and Family Heirlooms. Each asset can include description, estimated value, location, and supporting documents.'
        },
        {
          keywords: ['edit asset', 'remove asset', 'delete asset', 'update asset', 'modify asset'],
          answer: 'Yes. You can edit or remove assets at any time. However, changes are recorded in the tamper-evident ledger, ensuring a complete audit trail of all modifications.',
          detailedAnswer: 'Every change to an asset creates a new ledger entry with a SHA-256 hash, making the modification history tamper-proof and verifiable.'
        },
        {
          keywords: ['estate status', 'completion', 'progress', 'workflow', 'estate progress'],
          answer: 'The estate workflow guides you from creation to completion: Estate Created → Assets Added → Beneficiaries Assigned → Witness Approval → Digital Will Finalised → Death Verification → Executor Activated → Beneficiaries Notified → Estate Completed.',
          detailedAnswer: 'The system calculates a completion percentage to help you track your progress. Each step in the workflow must be completed before moving to the next, ensuring your estate is comprehensive and legally sound.'
        },
        {
          keywords: ['public curator', 'curator review', 'estate administration'],
          answer: 'The Public Curator is a government official who reviews estates after death to ensure proper administration. When death is verified, the Public Curator is automatically notified through SevisDEx.',
          detailedAnswer: 'The Public Curator can view the estate details, verify the digital will, check witness approvals, and confirm the asset inventory. They provide final verification before assets are transferred to beneficiaries.'
        }
      ]
    },
    beneficiaries: {
      name: 'Beneficiaries & Heirs',
      questions: [
        {
          keywords: ['beneficiary', 'heir', 'who is a beneficiary', 'beneficiary meaning'],
          answer: 'A beneficiary is an individual nominated by the Inheritance Owner to receive assets or responsibilities from the estate.',
          detailedAnswer: 'Beneficiaries can be family members, trusted friends, community leaders, or any individual you wish to inherit from your estate. Each beneficiary can be assigned specific assets and a share percentage.'
        },
        {
          keywords: ['how do I know if I\'m a beneficiary', 'beneficiary notification', 'beneficiary invitation', 'beneficiary claim'],
          answer: 'You will receive a notification in your dashboard and an email invitation. When you log in, you\'ll see the estate details under "My Inherited Estates".',
          detailedAnswer: 'If you don\'t have a SevisPass account, the system will send an invitation via email. Once you create your SevisPass account and log in, you can claim your beneficiary invitation and access your inherited information.'
        },
        {
          keywords: ['beneficiary view', 'what can beneficiaries see', 'beneficiary access', 'beneficiary permissions'],
          answer: 'As a beneficiary, you can view the estate details, see the assets allocated to you, access shared documents, and receive messages from the estate owner. You cannot edit or delete any information.',
          detailedAnswer: 'Beneficiaries have view-only access to ensure the integrity of the estate. You can see your relationship, share percentage, and status. All access is read-only and tracked in the audit log.'
        },
        {
          keywords: ['add beneficiary', 'nominate beneficiary', 'beneficiary management', 'add heir'],
          answer: 'You can add beneficiaries through the "Beneficiaries" page in your dashboard. If a beneficiary doesn\'t have a SevisPass account, the system will send them an invitation via email.',
          detailedAnswer: 'When adding a beneficiary, you can specify their relationship, share percentage, and access level. The system will automatically detect if the person already has a SevisPass account and handle the invitation process accordingly.'
        },
        {
          keywords: ['beneficiary share', 'share percentage', 'inheritance share'],
          answer: 'You can assign a share percentage to each beneficiary. This determines what portion of the estate they will receive. The total share percentage across all beneficiaries should equal 100%.',
          detailedAnswer: 'Share percentages can be customized for each beneficiary. If you have specific assets for specific beneficiaries, you can assign assets directly rather than using a percentage-based distribution.'
        }
      ]
    },
    digitalWill: {
      name: 'Digital Will',
      questions: [
        {
          keywords: ['digital will', 'what is a digital will', 'will', 'online will'],
          answer: 'A Digital Will is a legally-informed document that records your wishes for the distribution of your assets after your passing. It includes asset distribution, beneficiary assignments, personal messages, and audio recordings.',
          detailedAnswer: 'The Digital Will is created through a multi-step process: Introduction → Executor Notes → Assets → Beneficiaries → Personal Messages → Witnesses. It is cryptographically signed and includes a tamper-evident seal, making it suitable for official use.'
        },
        {
          keywords: ['is digital will legal', 'legal validity', 'legally binding', 'will valid'],
          answer: 'The Digital Will serves as a record of your intentions and provides strong evidence of your wishes. While it is designed to be legally robust, we always recommend consulting with a legal professional for formal legal advice.',
          detailedAnswer: 'Kastom Ledger does not replace legal advice or formal legal processes. The platform preserves evidence of your intentions through cryptographic signatures, witness verification, and the tamper-evident ledger. This provides a strong evidentiary foundation for your wishes.'
        },
        {
          keywords: ['audio messages', 'record audio', 'voice recording', 'audio will'],
          answer: 'Yes! You can record personal audio messages for each section of your will - Introduction, Executor Notes, and Personal Messages. These recordings are stored securely and can be listened to by your beneficiaries.',
          detailedAnswer: 'Audio recordings add a personal and emotional dimension to your will that text alone cannot convey. They are stored as base64 data in the database and can be played back through the Digital Will interface. The PDF version includes a note that audio recordings are attached.'
        },
        {
          keywords: ['witnesses', 'will witnesses', 'how many witnesses', 'witness requirements'],
          answer: 'At least 2 witnesses are required for a Digital Will. Witnesses must be added and verified before the will can be submitted.',
          detailedAnswer: 'Witnesses can be family members, community leaders, or trusted individuals who can confirm your identity and the authenticity of your will. Each witness must review and approve the will through their own SevisPass account.'
        },
        {
          keywords: ['change will', 'update will', 'modify will', 'edit will'],
          answer: 'Yes. You can update your will at any time. Each update creates a new version, and the ledger records all changes, providing a complete history of your decisions.',
          detailedAnswer: 'When you update your will, the previous version remains in the ledger as a historical record. This creates a complete audit trail of your decisions and ensures that all versions are verifiable and tamper-proof.'
        },
        {
          keywords: ['pdf will', 'download will', 'will pdf', 'print will'],
          answer: 'When you submit your Digital Will, the system automatically generates a professional PDF document. This PDF includes all will information, asset lists, beneficiary details, and a tamper-evident seal.',
          detailedAnswer: 'The PDF is cryptographically signed and includes a verification code. It can be downloaded from the Documents page. The PDF also indicates that audio recordings are attached to the will.'
        }
      ]
    },
    sevis: {
      name: 'Sevis Ecosystem',
      questions: [
        {
          keywords: ['sevispass', 'what is sevispass', 'digital identity', 'sevis pass'],
          answer: 'SevisPass is Papua New Guinea\'s official digital identity system. It provides a secure way to verify your identity when using government digital services like Kastom Ledger.',
          detailedAnswer: 'SevisPass uses a Decentralized Identifier (DID) format: did:sevis:pngext1:{uid}. It supports tiered verification (Tier-1, Tier-2, Minor) and provides cryptographic authentication without storing passwords on central servers.'
        },
        {
          keywords: ['sevisdex', 'what is sevisdex', 'data exchange', 'sevis dex'],
          answer: 'SevisDEx is the data exchange bridge that connects Kastom Ledger to government agencies like the Department of Lands. When you verify a land title, Kastom Ledger sends a request through SevisDEx, which securely queries the government registry and returns verified information.',
          detailedAnswer: 'SevisDEx operates on a peer-to-peer model. Instead of storing citizen data on central servers, it establishes encrypted direct connections between the citizen\'s SevisWallet and the requesting institution. No data is stored on any intermediate server.'
        },
        {
          keywords: ['seviswallet', 'what is seviswallet', 'digital wallet', 'sevis wallet'],
          answer: 'SevisWallet is the mobile application that stores your SevisPass and other digital credentials. It is securely bound to your verified phone number and acts as your digital identity hub.',
          detailedAnswer: 'SevisWallet does not have its own ID - it is bound to your phone number during setup. It can store multiple credentials including SevisPass, driver\'s license, academic records, and Nasfund membership cards. All data is encrypted and only shared with your explicit consent.'
        },
        {
          keywords: ['connect government services', 'government integration', 'connected services', 'service connection'],
          answer: 'The Connected Services page allows you to connect various government services to your estate. This includes Department of Lands, MVIL, IPA, Civil Registry, and more. Connections are made through SevisDEx with your consent.',
          detailedAnswer: 'Each government service connection allows you to import verified assets, verify identities, and streamline the estate administration process. The system uses SevisPass for identity verification and SevisDEx for secure data exchange.'
        },
        {
          keywords: ['sevisdex verification', 'asset verification', 'verify land', 'verify asset'],
          answer: 'Asset verification through SevisDEx checks government registries to confirm asset ownership. For land, it queries the Department of Lands registry and returns verified information about the property.',
          detailedAnswer: 'The verification process: 1) You enter the title number, 2) Kastom Ledger sends a request through SevisDEx, 3) SevisDEx queries the Department of Lands, 4) Verified information is returned, 5) The asset is marked as verified. This creates a government-verified record of ownership.'
        }
      ]
    },
    security: {
      name: 'Security & Privacy',
      questions: [
        {
          keywords: ['security', 'is it safe', 'data protection', 'encryption', 'secure'],
          answer: 'Yes. All data is encrypted and stored securely. Every action is recorded in a tamper-evident ledger using SHA-256 hashing. Your personal information is protected and only shared with authorized individuals you designate.',
          detailedAnswer: 'The system uses multiple layers of security: SHA-256 hashing for ledger entries, digital signatures for documents, JWT authentication for sessions, role-based access control, rate limiting, and CORS protection. All data exchanges through SevisDEx are end-to-end encrypted.'
        },
        {
          keywords: ['tamper-evident ledger', 'how does ledger work', 'blockchain', 'hash', 'SHA-256'],
          answer: 'The ledger uses blockchain-inspired technology. Every action creates a hash (like a digital fingerprint) that is linked to the previous action. If anyone tries to change a record, the hash would change and the tampering would be immediately detectable.',
          detailedAnswer: 'The SHA-256 hash chain works as follows: Each new entry contains the hash of the previous entry, creating a chain. The current hash is calculated from the action data plus the previous hash. Any modification of a previous entry would change its hash and break the entire chain, making tampering immediately obvious.'
        },
        {
          keywords: ['who can access my data', 'privacy', 'data sharing', 'access control'],
          answer: 'Only you (the estate owner) have full access. Beneficiaries can only see what you have explicitly shared with them. Witnesses can only see verification requests. Administrators cannot view or edit your estate content.',
          detailedAnswer: 'The system follows the principle of least privilege. Each role has strictly defined permissions: Owners manage everything, Beneficiaries read-only, Witnesses verify, Administrators manage system operations but cannot view or modify user estates.'
        },
        {
          keywords: ['digital signature', 'document verification', 'verify document', 'verify pdf'],
          answer: 'Digital signatures are used to cryptographically sign documents. Each PDF includes a tamper-evident seal with a verification code and digital signature. Documents can be verified through the API or by clicking the Shield icon in the Documents page.',
          detailedAnswer: 'The verification process: 1) The system calculates a SHA-256 hash of the document, 2) This hash is stored in the database, 3) The document includes a visual verification seal, 4) When verified, the system recalculates the hash and compares it with the stored value. If they match, the document is authentic.'
        },
        {
          keywords: ['audit trail', 'ledger history', 'view history', 'activity log'],
          answer: 'Every action in the system is recorded in the tamper-evident ledger. You can view your complete ledger history on the Ledger Timeline page, which shows all actions in chronological order.',
          detailedAnswer: 'The ledger includes: action type, actor UID, timestamp, previous hash, current hash, and metadata. This creates a complete, verifiable history of all actions taken on your estate. The chain integrity can be verified at any time.'
        }
      ]
    },
    death: {
      name: 'Death & Succession',
      questions: [
        {
          keywords: ['death verification', 'death certificate', 'death registered', 'verify death'],
          answer: 'When the estate owner passes away, the executor or beneficiary can upload the death certificate to initiate the succession process. The system verifies the death through SevisDEx and Civil Registry.',
          detailedAnswer: 'The process: 1) Death certificate is uploaded, 2) SevisDEx verifies with Civil Registry, 3) Public Curator is notified, 4) Estate is flagged for administration, 5) Assets are transferred to designated beneficiaries according to the Digital Will.'
        },
        {
          keywords: ['succession', 'inheritance', 'asset transfer', 'when owner dies', 'what happens when'],
          answer: 'The succession process transfers assets to designated beneficiaries according to the Digital Will. This is done through SevisDEx with the relevant government departments (DLPP, MVIL, IPA, etc.).',
          detailedAnswer: 'The system does not execute the legal transfer itself. Instead, it generates official request packages for each government department (Bank Request, Land Registry Request, IPA Business Request, etc.). Each package contains only the documents relevant to that department. The legal transfer is executed by the respective government department.'
        },
        {
          keywords: ['executor', 'who is executor', 'executor role', 'executor duties'],
          answer: 'The executor is appointed by the estate owner to manage estate administration after death. Their responsibilities include uploading the death certificate, notifying beneficiaries, and managing the estate progress.',
          detailedAnswer: 'Executors are nominated by the estate owner and can be family members, lawyers, or trusted individuals. The executor has administrative access to the estate after death verification but cannot change the will or asset distribution.'
        },
        {
          keywords: ['death certificate upload', 'upload death certificate', 'certificate'],
          answer: 'Death certificates can be uploaded through the estate management page. The system accepts PDF and image files (JPEG, PNG, GIF). The certificate is stored securely and used for verification with Civil Registry.',
          detailedAnswer: 'When a death certificate is uploaded, the system generates a SHA-256 hash of the certificate for tamper-evident verification. The certificate is then sent to Civil Registry through SevisDEx for official verification.'
        }
      ]
    },
    admin: {
      name: 'Administration',
      questions: [
        {
          keywords: ['admin login', 'administrator portal', 'admin access', 'admin dashboard'],
          answer: 'Administrators use a separate login portal at /admin/login. This portal is not accessible from the public login page for security reasons.',
          detailedAnswer: 'Admin credentials are separate from regular user credentials. In production, additional security measures include IP whitelisting, two-factor authentication, session timeouts, and comprehensive audit logging of all admin actions.'
        },
        {
          keywords: ['government integrations', 'admin integrations', 'service management', 'integration dashboard'],
          answer: 'Administrators manage government service integrations through the Government Integrations dashboard. This includes monitoring connection health, testing connections, and managing API configurations.',
          detailedAnswer: 'The integration dashboard shows real-time status of all government services: SevisPass, SevisWallet, SevisDEx, Civil Registry, Department of Lands, IPA, MVIL, and Banking Gateway. Administrators can test connections, view sync logs, and configure API endpoints.'
        },
        {
          keywords: ['admin stats', 'system statistics', 'user statistics', 'admin reports'],
          answer: 'The Administrator Dashboard provides comprehensive system statistics including total users, total estates, pending verifications, ledger entries, and connected integrations.',
          detailedAnswer: 'Administrators can also view activity logs, audit trails, and generate reports on system usage. All administrative actions are logged for accountability.'
        }
      ]
    },
    documents: {
      name: 'Documents & Files',
      questions: [
        {
          keywords: ['upload document', 'document management', 'upload file', 'add document'],
          answer: 'You can upload documents through the Documents page. Supported file types include PDF, Images (JPG, PNG, GIF, WEBP), and Audio (MP3, WAV, OGG). Files are organized by category for easy access.',
          detailedAnswer: 'Documents are automatically categorized as Legacy Documents, Estate Documents, Asset Documents, Will Audio Recordings, Profile Photos, or General Documents. Each file includes metadata and can be previewed, downloaded, or deleted.'
        },
        {
          keywords: ['document categories', 'file organization', 'document types'],
          answer: 'Documents are organized into categories: Legacy Documents (from Legacy section), Estate Documents, Asset Documents, Will Audio Recordings, Profile Photos, and General Documents. This makes it easy to find and manage your files.',
          detailedAnswer: 'When you upload a document, you can assign it to a specific category or it will be automatically categorized based on where you upload it from. This organization system ensures all your files are easily accessible.'
        },
        {
          keywords: ['document preview', 'preview document', 'view document'],
          answer: 'You can preview documents directly in the Documents page. Images display inline, PDFs open in a viewer, and audio files include a player. For other file types, you can download them to view.',
          detailedAnswer: 'The preview feature supports: images (JPG, PNG, GIF), PDFs (in-browser viewer), audio files (MP3, WAV with player controls), and other files (download button provided).'
        },
        {
          keywords: ['download document', 'save document', 'export document'],
          answer: 'You can download any document by clicking the download button (arrow icon) next to the document. The file will be saved to your device with its original name.',
          detailedAnswer: 'Documents are downloaded from the server with proper file headers. The download button is available for all file types and works on both mobile and desktop devices.'
        }
      ]
    }
  },

  // Search function to find matching question
  search(query) {
    const lowerQuery = query.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    // Search through all categories and questions
    for (const [categoryKey, category] of Object.entries(this.categories)) {
      for (const q of category.questions) {
        // Check if any keyword matches
        for (const keyword of q.keywords) {
          if (lowerQuery.includes(keyword) || keyword.includes(lowerQuery.split(' ')[0])) {
            // Calculate relevance score
            const score = keyword.length / lowerQuery.length;
            if (score > highestScore) {
              highestScore = score;
              bestMatch = {
                ...q,
                category: category.name,
                categoryKey: categoryKey
              };
            }
          }
        }

        // Check if the entire question matches partially
        const questionWords = q.keywords[0].split(' ');
        const queryWords = lowerQuery.split(' ');
        let matchCount = 0;
        for (const word of queryWords) {
          if (questionWords.some(kw => kw.includes(word) || word.includes(kw))) {
            matchCount++;
          }
        }
        const score = matchCount / queryWords.length;
        if (score > highestScore && score > 0.3) {
          highestScore = score;
          bestMatch = {
            ...q,
            category: category.name,
            categoryKey: categoryKey
          };
        }
      }
    }

    // Check for general help
    if (!bestMatch || highestScore < 0.2) {
      return null;
    }

    return bestMatch;
  },

  // Get all categories for UI
  getCategories() {
    return Object.values(this.categories).map(c => c.name);
  },

  // Get all questions for a category
  getQuestionsByCategory(categoryName) {
    const category = Object.values(this.categories).find(c => c.name === categoryName);
    return category ? category.questions : [];
  },

  // Get all questions with answers for FAQ page
  getAllFAQs() {
    const faqs = [];
    for (const [categoryKey, category] of Object.entries(this.categories)) {
      for (const q of category.questions) {
        faqs.push({
          id: `faq-${categoryKey}-${faqs.length + 1}`,
          category: category.name,
          categoryKey: categoryKey,
          question: q.keywords[0].charAt(0).toUpperCase() + q.keywords[0].slice(1),
          answer: q.answer,
          detailedAnswer: q.detailedAnswer || null
        });
      }
    }
    return faqs;
  }
};

module.exports = knowledgeBase;