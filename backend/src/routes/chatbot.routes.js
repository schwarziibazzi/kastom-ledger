const router = require('express').Router();
const chatbotController = require('../controllers/chatbot.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes (authentication optional)
router.post('/chat', chatbotController.chat);
router.get('/suggestions', chatbotController.getSuggestions);
router.get('/faqs', chatbotController.getFAQs);
router.get('/knowledge', authenticate, chatbotController.getKnowledgeSummary);

module.exports = router;