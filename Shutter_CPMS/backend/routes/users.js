const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser, updateProfile, updatePassword } = require('../controllers/users');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/profile')
  .put(updateProfile);

router.route('/password')
  .put(updatePassword);

router.route('/')
  .get(getUsers);

router.route('/:id/role')
  .put(updateUserRole);

router.route('/:id')
  .delete(deleteUser);

module.exports = router;
