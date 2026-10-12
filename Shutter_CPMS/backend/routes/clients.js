const express = require('express');
const router = express.Router();
const { getClients, addClient, updateClient, deleteClient } = require('../controllers/clients');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getClients);
router.post('/', protect, authorize('admin', 'photographer'), addClient);
router.put('/:id', protect, authorize('admin', 'photographer'), updateClient);
router.delete('/:id', protect, authorize('admin', 'photographer'), deleteClient);

module.exports = router;
