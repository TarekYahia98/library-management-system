const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowingController');
const auth = require('../middleware/auth');

// Public routes
router.get('/borrowings/borrower/:borrowerId', borrowingController.getBorrowerBooks);
router.get('/borrowings/overdue', borrowingController.getOverdueBooks);

// Protected routes
router.post('/borrowings/checkout', auth, borrowingController.checkoutBook);
router.post('/borrowings/return/:id', auth, borrowingController.returnBook);

module.exports = router;