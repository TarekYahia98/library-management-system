API Testing
Get your API key from .env file: my-secure-api-key-12345
Test endpoints with curl:
bash
# Create a book
curl -X POST http://localhost:3000/api/books \
  -H "x-api-key: my-secure-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "availableQuantity": 5,
    "shelfLocation": "A-12"
  }'

# List all books
curl http://localhost:3000/api/books

# Search books
curl "http://localhost:3000/api/books/search?q=Gatsby"

# Register a borrower
curl -X POST http://localhost:3000/api/borrowers \
  -H "x-api-key: my-secure-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'

# Checkout a book (replace UUIDs with actual IDs)
curl -X POST http://localhost:3000/api/borrowings/checkout \
  -H "x-api-key: my-secure-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "borrowerId": "your-borrower-uuid",
    "bookId": "your-book-uuid",
    "daysToReturn": 14
  }'
Default API Key: my-secure-api-key-12345
text
