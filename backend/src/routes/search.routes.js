const router = require('express').Router();
const searchController = require('../controllers/search.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, searchController.search);

module.exports = router;