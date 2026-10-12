const express = require('express');
const router = express.Router();
const { getPortfolio, updatePortfolio } = require('../controllers/portfolio');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPortfolio)
  .put(updatePortfolio);

module.exports = router;
