const chatbotService = require('../services/chatbot.service');

// Process a chat message
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user || null;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = chatbotService.processQuery(message, user);

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat',
      error: error.message
    });
  }
};

// Get chat suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { category } = req.query;
    const suggestions = chatbotService.getSuggestions(category);
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
};

// Get knowledge base summary
exports.getKnowledgeSummary = async (req, res) => {
  try {
    const summary = chatbotService.getKnowledgeSummary();
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get knowledge summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get knowledge summary'
    });
  }
};

// Get all FAQs
exports.getFAQs = async (req, res) => {
  try {
    const faqs = chatbotService.getAllFAQs();
    res.json({
      success: true,
      faqs
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get FAQs'
    });
  }
};