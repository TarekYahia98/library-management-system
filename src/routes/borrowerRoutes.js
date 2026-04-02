const express = require('express');
const router = express.Router();
const borrowerController = require('../controllers/borrowerController');
const auth = require('../middleware/auth');

// Public routes
router.get('/borrowers', borrowerController.listBorrowers);

// Protected routes
router.post('/borrowers', auth, borrowerController.registerBorrower);
router.put('/borrowers/:id', auth, borrowerController.updateBorrower);
router.delete('/borrowers/:id', auth, borrowerController.deleteBorrower);

module.exports = router;