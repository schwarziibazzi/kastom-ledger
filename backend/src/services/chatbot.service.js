const knowledgeBase = require('../data/chatbot-knowledge');

class ChatbotService {
  // Process user query and return response
  processQuery(query, user = null) {
    const lowerQuery = query.toLowerCase().trim();

    // Check for greeting
    if (lowerQuery.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup|yo|hey there)/)) {
      return {
        type: 'greeting',
        response: `Hello${user ? ' ' + user.name : ''}! 👋 I'm the Kastom Ledger assistant. I can help you with questions about estate planning, digital wills, beneficiaries, security, and more. What would you like to know?`,
        suggestions: this.getSuggestions()
      };
    }

    // Check for thank you
    if (lowerQuery.match(/^(thanks|thank you|thank|appreciate|thanks a lot|thank you very much)/)) {
      return {
        type: 'thankyou',
        response: 'You\'re welcome! 😊 Is there anything else I can help you with?',
        suggestions: this.getSuggestions()
      };
    }

    // Check for goodbye
    if (lowerQuery.match(/^(bye|goodbye|see you|farewell|see you later|bye bye)/)) {
      return {
        type: 'goodbye',
        response: 'Goodbye! 👋 If you have more questions, I\'m always here to help. Have a great day!',
        suggestions: []
      };
    }

    // Check for FAQ request
    if (lowerQuery.includes('faq') || lowerQuery.includes('frequently asked questions') || lowerQuery.includes('common questions')) {
      return {
        type: 'faq',
        response: 'You can find all our Frequently Asked Questions on the FAQ page! 📖\n\nClick here to visit: FAQ Page\n\nIs there a specific question you\'d like me to answer right now?',
        suggestions: [
          { label: 'What is Kastom Ledger?', value: 'what is kastom ledger' },
          { label: 'How do I create an estate?', value: 'how to create an estate' },
          { label: 'What is a Digital Will?', value: 'what is a digital will' },
          { label: 'How do beneficiaries work?', value: 'how do beneficiaries work' }
        ]
      };
    }

    // Check for help
    if (lowerQuery.match(/^(help|what can you do|how can you help|options)/)) {
      return {
        type: 'help',
        response: 'I can help you with questions about:\n\n📋 **Estate Management** - Creating estates, adding assets, tracking progress\n📝 **Digital Will** - Creating, updating, and submitting your will\n👤 **Beneficiaries** - Adding, managing, and understanding beneficiary roles\n🔐 **Security** - How your data is protected and the tamper-evident ledger\n🔗 **Sevis Ecosystem** - SevisPass, SevisDEx, and Connected Services\n📄 **Documents** - Uploading, organizing, and managing files\n⚰️ **Succession** - Death verification and asset transfer\n\nWhat would you like to know about?',
        suggestions: [
          { label: 'How do I create an estate?', value: 'how to create an estate' },
          { label: 'What is a Digital Will?', value: 'what is a digital will' },
          { label: 'How do beneficiaries work?', value: 'how do beneficiaries work' },
          { label: 'Is my data secure?', value: 'is my data secure' },
          { label: 'What is SevisPass?', value: 'what is sevispass' }
        ]
      };
    }

    // Search knowledge base
    const match = knowledgeBase.search(query);

    if (match && match.answer) {
      // Generate follow-up suggestions based on category
      const categorySuggestions = this.getCategorySuggestions(match.categoryKey);

      return {
        type: 'answer',
        response: match.answer,
        detailedAnswer: match.detailedAnswer || null,
        category: match.category,
        suggestions: categorySuggestions,
        confidence: 'high'
      };
    }

    // No match found - provide help with suggestions
    return {
      type: 'help',
      response: "I'm not sure I fully understand your question. Here are some topics I can help with:",
      suggestions: [
        { label: 'What is Kastom Ledger?', value: 'what is kastom ledger' },
        { label: 'How do I create an estate?', value: 'how to create an estate' },
        { label: 'What is a Digital Will?', value: 'what is a digital will' },
        { label: 'How do beneficiaries work?', value: 'how do beneficiaries work' },
        { label: 'Is my data secure?', value: 'is my data secure' },
        { label: 'What is SevisPass?', value: 'what is sevispass' },
        { label: 'How do I add assets?', value: 'how to add assets' },
        { label: 'What is SevisDEx?', value: 'what is sevisdex' }
      ]
    };
  }

  // Get suggestions based on category
  getSuggestions(category = null) {
    const allSuggestions = [
      { label: 'What is Kastom Ledger?', value: 'what is kastom ledger' },
      { label: 'How do I create an estate?', value: 'how to create an estate' },
      { label: 'What is a Digital Will?', value: 'what is a digital will' },
      { label: 'How do beneficiaries work?', value: 'how do beneficiaries work' },
      { label: 'Is my data secure?', value: 'is my data secure' },
      { label: 'What is SevisPass?', value: 'what is sevispass' },
      { label: 'How do I add assets?', value: 'how to add assets' },
      { label: 'What is SevisDEx?', value: 'what is sevisdex' },
      { label: 'What happens when the owner dies?', value: 'what happens when owner dies' },
      { label: 'Who can access my data?', value: 'who can access my data' }
    ];

    if (category) {
      const categorySuggestions = {
        'General Information': [
          { label: 'What is Kastom Ledger?', value: 'what is kastom ledger' },
          { label: 'Who can use Kastom Ledger?', value: 'who can use kastom ledger' },
          { label: 'Is Kastom Ledger free?', value: 'is kastom ledger free' }
        ],
        'Estate Management': [
          { label: 'How do I create an estate?', value: 'how to create an estate' },
          { label: 'How do I add assets?', value: 'how to add assets' },
          { label: 'What is estate status?', value: 'what is estate status' },
          { label: 'How do I edit an asset?', value: 'how to edit an asset' }
        ],
        'Beneficiaries & Heirs': [
          { label: 'What is a beneficiary?', value: 'what is a beneficiary' },
          { label: 'How do I add a beneficiary?', value: 'how to add a beneficiary' },
          { label: 'What can beneficiaries see?', value: 'what can beneficiaries see' }
        ],
        'Digital Will': [
          { label: 'What is a Digital Will?', value: 'what is a digital will' },
          { label: 'How do I create a will?', value: 'how to create a will' },
          { label: 'What about witnesses?', value: 'what about witnesses' },
          { label: 'Can I update my will?', value: 'can I update my will' }
        ],
        'Sevis Ecosystem': [
          { label: 'What is SevisPass?', value: 'what is sevispass' },
          { label: 'What is SevisDEx?', value: 'what is sevisdex' },
          { label: 'What is SevisWallet?', value: 'what is seviswallet' },
          { label: 'How do I verify an asset?', value: 'how to verify an asset' }
        ],
        'Security & Privacy': [
          { label: 'Is my data secure?', value: 'is my data secure' },
          { label: 'How does the ledger work?', value: 'how does the ledger work' },
          { label: 'Who can access my data?', value: 'who can access my data' }
        ],
        'Death & Succession': [
          { label: 'What happens when the owner dies?', value: 'what happens when owner dies' },
          { label: 'What is an executor?', value: 'what is an executor' },
          { label: 'How does succession work?', value: 'how does succession work' }
        ],
        'Documents & Files': [
          { label: 'How do I upload a document?', value: 'how to upload a document' },
          { label: 'What file types are supported?', value: 'what file types are supported' },
          { label: 'How do I download a document?', value: 'how to download a document' }
        ]
      };

      const suggestions = categorySuggestions[category] || allSuggestions;
      return suggestions;
    }

    return allSuggestions;
  }

  // Get category-specific suggestions
  getCategorySuggestions(categoryKey) {
    const categoryMap = {
      'general': 'General Information',
      'estate': 'Estate Management',
      'beneficiaries': 'Beneficiaries & Heirs',
      'digitalWill': 'Digital Will',
      'sevis': 'Sevis Ecosystem',
      'security': 'Security & Privacy',
      'death': 'Death & Succession',
      'documents': 'Documents & Files'
    };

    const categoryName = categoryMap[categoryKey] || null;
    return this.getSuggestions(categoryName);
  }

  // Get knowledge base summary
  getKnowledgeSummary() {
    const categories = knowledgeBase.getCategories();
    const summary = categories.map(category => {
      const questions = knowledgeBase.getQuestionsByCategory(category);
      return {
        category,
        questionCount: questions.length,
        topics: questions.map(q => q.keywords[0])
      };
    });
    return summary;
  }

  // Get all FAQs for the FAQ page
  getAllFAQs() {
    return knowledgeBase.getAllFAQs();
  }
}

module.exports = new ChatbotService();