const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowingController');
const auth = require('../middleware/auth');
// const { checkoutRateLimiter } = require('../middleware/rateLimiter');

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

// ============= BONUS: EXPORT ENDPOINTS =============

/**
 * @swagger
 * /borrowings/export/overdue-last-month:
 *   get:
 *     summary: Export all overdue books from last month
 *     tags: [Borrowings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *           default: csv
 *         description: Export format (CSV or Excel)
 *     responses:
 *       200:
 *         description: Export file downloaded successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No overdue books found
 */
router.get('/borrowings/export/overdue-last-month', auth, borrowingController.exportOverdueBooksLastMonth);

/**
 * @swagger
 * /borrowings/export/all-last-month:
 *   get:
 *     summary: Export all borrowing processes from last month
 *     tags: [Borrowings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *           default: csv
 *         description: Export format (CSV or Excel)
 *     responses:
 *       200:
 *         description: Export file downloaded successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No borrowing records found
 */
router.get('/borrowings/export/all-last-month', auth, borrowingController.exportAllBorrowingsLastMonth);

/**
 * @swagger
 * /borrowings/export/custom-report:
 *   get:
 *     summary: Export borrowing report for custom date range
 *     tags: [Borrowings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-01"
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-31"
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *           default: csv
 *         description: Export format
 *     responses:
 *       200:
 *         description: Export file downloaded successfully
 *       400:
 *         description: Missing date parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/borrowings/export/custom-report', auth, borrowingController.exportCustomReport);

module.exports = router;