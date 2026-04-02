const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management System API',
      version: '1.0.0',
      description: 'A comprehensive Library Management System API with book management, borrower management, and borrowing process features.',
      contact: {
        name: 'API Support',
        email: 'support@library.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.library.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication',
        },
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Book ID',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            title: {
              type: 'string',
              description: 'Book title',
              example: 'The Great Gatsby',
            },
            author: {
              type: 'string',
              description: 'Book author',
              example: 'F. Scott Fitzgerald',
            },
            isbn: {
              type: 'string',
              description: 'ISBN number (10-13 digits)',
              example: '9780743273565',
            },
            availableQuantity: {
              type: 'integer',
              description: 'Available copies',
              example: 5,
              minimum: 0,
            },
            shelfLocation: {
              type: 'string',
              description: 'Shelf location',
              example: 'A-12',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
          required: ['title', 'author', 'isbn', 'shelfLocation'],
        },
        Borrower: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Borrower ID',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            name: {
              type: 'string',
              description: 'Borrower name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john@example.com',
            },
            registeredDate: {
              type: 'string',
              format: 'date-time',
              description: 'Registration date',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['name', 'email'],
        },
        Borrowing: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Borrowing record ID',
            },
            bookId: {
              type: 'string',
              format: 'uuid',
              description: 'Book ID',
            },
            borrowerId: {
              type: 'string',
              format: 'uuid',
              description: 'Borrower ID',
            },
            checkoutDate: {
              type: 'string',
              format: 'date-time',
              description: 'Checkout date',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Due date',
            },
            returnDate: {
              type: 'string',
              format: 'date-time',
              description: 'Return date (null if not returned)',
            },
            status: {
              type: 'string',
              enum: ['active', 'returned', 'overdue'],
              description: 'Borrowing status',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            status: {
              type: 'integer',
              description: 'HTTP status code',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
            },
          },
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;