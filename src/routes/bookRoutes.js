const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

// Public routes
router.get('/books', bookController.listBooks);
router.get('/books/search', bookController.searchBook);

// Protected routes
router.post('/books', auth, bookController.createBook);
router.put('/books/:id', auth, bookController.updateBook);
router.delete('/books/:id', auth, bookController.deleteBook);

module.exports = router;