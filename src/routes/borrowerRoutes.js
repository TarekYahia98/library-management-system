const express = require('express');
const router = express.Router();
const borrowerController = require('../controllers/borrowerController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Borrowers
 *   description: Borrower management endpoints
 */

/**
 * @swagger
 * /borrowers:
 *   post:
 *     summary: Register a new borrower
 *     tags: [Borrowers]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       201:
 *         description: Borrower registered successfully
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Email already exists
 */
router.post('/borrowers', auth, borrowerController.registerBorrower);

/**
 * @swagger
 * /borrowers:
 *   get:
 *     summary: Get all borrowers
 *     tags: [Borrowers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of borrowers
 */
router.get('/borrowers', borrowerController.listBorrowers);

/**
 * @swagger
 * /borrowers/{id}:
 *   put:
 *     summary: Update borrower details
 *     tags: [Borrowers]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Borrower updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Borrower not found
 */
router.put('/borrowers/:id', auth, borrowerController.updateBorrower);

/**
 * @swagger
 * /borrowers/{id}:
 *   delete:
 *     summary: Delete a borrower
 *     tags: [Borrowers]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Borrower deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Borrower not found
 *       400:
 *         description: Cannot delete borrower with active borrowings
 */
router.delete('/borrowers/:id', auth, borrowerController.deleteBorrower);

module.exports = router;