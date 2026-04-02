const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowingController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Borrowings
 *   description: Borrowing process endpoints
 */

/**
 * @swagger
 * /borrowings/checkout:
 *   post:
 *     summary: Checkout a book
 *     tags: [Borrowings]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - borrowerId
 *               - bookId
 *             properties:
 *               borrowerId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440001"
 *               bookId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               daysToReturn:
 *                 type: integer
 *                 default: 14
 *                 description: Number of days until due
 *     responses:
 *       201:
 *         description: Book checked out successfully
 *       400:
 *         description: No copies available or max books reached
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book or borrower not found
 */
router.post('/borrowings/checkout', auth, borrowingController.checkoutBook);

/**
 * @swagger
 * /borrowings/return/{id}:
 *   post:
 *     summary: Return a book
 *     tags: [Borrowings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Borrowing record ID
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Borrowing record not found
 *       400:
 *         description: Book already returned
 */
router.post('/borrowings/return/:id', auth, borrowingController.returnBook);

/**
 * @swagger
 * /borrowings/borrower/{borrowerId}:
 *   get:
 *     summary: Get all books currently borrowed by a borrower
 *     tags: [Borrowings]
 *     parameters:
 *       - in: path
 *         name: borrowerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of borrowed books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Borrowing'
 *                 count:
 *                   type: integer
 */
router.get('/borrowings/borrower/:borrowerId', borrowingController.getBorrowerBooks);

/**
 * @swagger
 * /borrowings/overdue:
 *   get:
 *     summary: Get all overdue books
 *     tags: [Borrowings]
 *     responses:
 *       200:
 *         description: List of overdue books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Borrowing'
 *                 count:
 *                   type: integer
 */
router.get('/borrowings/overdue', borrowingController.getOverdueBooks);

module.exports = router;