const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/database');

describe('API Integration Tests', () => {
  let authToken = 'my-secure-api-key-12345';
  let testBookId;
  let testBorrowerId;
  let testBorrowingId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Books API', () => {
    it('should create a new book', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('x-api-key', authToken)
        .send({
          title: 'Integration Test Book',
          author: 'Test Author',
          isbn: '1234567890999',
          availableQuantity: 5,
          shelfLocation: 'TEST-01'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Integration Test Book');
      testBookId = response.body.data.id;
    });

    it('should list all books', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.books).toBeInstanceOf(Array);
    });

    it('should search books', async () => {
      const response = await request(app)
        .get('/api/books/search?q=Integration')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should update a book', async () => {
      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .set('x-api-key', authToken)
        .send({
          title: 'Updated Integration Test Book',
          availableQuantity: 3
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Integration Test Book');
    });
  });

  describe('Borrowers API', () => {
    it('should register a new borrower', async () => {
      const response = await request(app)
        .post('/api/borrowers')
        .set('x-api-key', authToken)
        .send({
          name: 'Integration Test User',
          email: 'integration@test.com'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('integration@test.com');
      testBorrowerId = response.body.data.id;
    });

    it('should list all borrowers', async () => {
      const response = await request(app)
        .get('/api/borrowers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.borrowers).toBeInstanceOf(Array);
    });
  });

  describe('Borrowing Process', () => {
    it('should checkout a book', async () => {
      const response = await request(app)
        .post('/api/borrowings/checkout')
        .set('x-api-key', authToken)
        .send({
          borrowerId: testBorrowerId,
          bookId: testBookId,
          daysToReturn: 14
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('active');
      testBorrowingId = response.body.data.id;
    });

    it('should get borrower books', async () => {
      const response = await request(app)
        .get(`/api/borrowings/borrower/${testBorrowerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return a book', async () => {
      const response = await request(app)
        .post(`/api/borrowings/return/${testBorrowingId}`)
        .set('x-api-key', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Book returned successfully');
    });
  });

  describe('Authentication', () => {
    it('should reject requests without API key', async () => {
      const response = await request(app)
        .post('/api/books')
        .send({
          title: 'Unauthorized Book',
          author: 'Test',
          isbn: '9999999999999',
          availableQuantity: 1,
          shelfLocation: 'A-01'
        })
        .expect(401);

      expect(response.body.error).toContain('API key is required');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('x-api-key', 'invalid-key')
        .send({
          title: 'Unauthorized Book',
          author: 'Test',
          isbn: '9999999999999',
          availableQuantity: 1,
          shelfLocation: 'A-01'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid API key');
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate ISBN error', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('x-api-key', authToken)
        .send({
          title: 'Duplicate Book',
          author: 'Test Author',
          isbn: '1234567890999', // Same ISBN as first book
          availableQuantity: 5,
          shelfLocation: 'TEST-02'
        })
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    it('should handle not found error', async () => {
      const response = await request(app)
        .get('/api/books/non-existent-id')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });
});