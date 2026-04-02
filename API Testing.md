# API Testing Documentation

## Authentication
**API Key:** `my-secure-api-key-12345` (from .env file)

**Base URL:** `http://localhost:3000`

**Swagger UI:** `http://localhost:3000/api-docs`

---

## BOOKS ENDPOINTS

 1. Create a Book (Authenticated)

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

 2. List All Books (Public)

curl http://localhost:3000/api/books

 3. List Books with Pagination (Public)

curl "http://localhost:3000/api/books?page=1&limit=10"

4. Search Books (Public)
# Search by title
curl "http://localhost:3000/api/books/search?q=Gatsby"

# Search by author
curl "http://localhost:3000/api/books/search?q=Fitzgerald"

# Search by ISBN
curl "http://localhost:3000/api/books/search?q=9780743273565"

5. Update a Book (Authenticated)
curl -X PUT http://localhost:3000/api/books/BOOK_UUID_HERE \
  -H "x-api-key: my-secure-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby Updated",
    "availableQuantity": 3,
    "shelfLocation": "B-20"
  }'

6. Delete a Book (Authenticated)
curl -X DELETE http://localhost:3000/api/books/BOOK_UUID_HERE \
  -H "x-api-key: my-secure-api-key-12345"

### BORROWERS ENDPOINTS

7. Register a Borrower (Authenticated)
curl -X POST http://localhost:3000/api/borrowers \
  -H "x-api-key: my-secure-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'

8. Register Multiple Borrowers (Authenticated)
# Borrower 2
curl -X POST http://localhost:3000/api/borrowers \
  -H "x-api-key: my-secure-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com"
  }'

# Borrower 3
curl -X POST http://localhost:3000/api/borrowers \
  -H "x-api-key: my-secure-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Johnson",
    "email": "bob@example.com"
  }'

9. List All Borrowers (Public)
curl http://localhost:3000/api/borrowers

10. List Borrowers with Search (Public)
curl "http://localhost:3000/api/borrowers?search=John"
curl "http://localhost:3000/api/borrowers?page=1&limit=5"

11. Update a Borrower (Authenticated)
curl -X PUT http://localhost:3000/api/borrowers/BORROWER_UUID_HERE \
  -H "x-api-key: my-secure-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }'

12. Delete a Borrower (Authenticated)
curl -X DELETE http://localhost:3000/api/borrowers/BORROWER_UUID_HERE \
  -H "x-api-key: my-secure-api-key-12345"

### BORROWING PROCESS ENDPOINTS

13. Checkout a Book (Authenticated)
# Replace UUIDs with actual IDs from creating a book and borrower
curl -X POST http://localhost:3000/api/borrowings/checkout \
  -H "x-api-key: my-secure-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "borrowerId": "BORROWER_UUID_HERE",
    "bookId": "BOOK_UUID_HERE",
    "daysToReturn": 14
  }'

14. Return a Book (Authenticated)
curl -X POST http://localhost:3000/api/borrowings/return/BORROWING_UUID_HERE \
  -H "x-api-key: my-secure-api-key-12345"

15. Get Borrower's Current Books (Public)
curl http://localhost:3000/api/borrowings/borrower/BORROWER_UUID_HERE

16. Get All Overdue Books (Public)
curl http://localhost:3000/api/borrowings/overdue

### EXPORT & REPORT ENDPOINTS

17. Export Overdue Books from Last Month (Authenticated)
# Export as CSV
curl -X GET "http://localhost:3000/api/borrowings/export/overdue-last-month?format=csv" \
  -H "x-api-key: my-secure-api-key-12345" \
  --output overdue_books_last_month.csv

# Export as Excel
curl -X GET "http://localhost:3000/api/borrowings/export/overdue-last-month?format=xlsx" \
  -H "x-api-key: my-secure-api-key-12345" \
  --output overdue_books_last_month.xlsx

18. Export All Borrowings from Last Month (Authenticated)
# Export as CSV
curl -X GET "http://localhost:3000/api/borrowings/export/all-last-month?format=csv" \
  -H "x-api-key: my-secure-api-key-12345" \
  --output borrowings_last_month.csv

# Export as Excel
curl -X GET "http://localhost:3000/api/borrowings/export/all-last-month?format=xlsx" \
  -H "x-api-key: my-secure-api-key-12345" \
  --output borrowings_last_month.xlsx

19. Export Custom Date Range Report (Authenticated)
# Export January 2026 as CSV
curl -X GET "http://localhost:3000/api/borrowings/export/custom-report?startDate=2026-01-01&endDate=2024-01-31&format=csv" \
  -H "x-api-key: my-secure-api-key-12345" \
  --output custom_report_january.csv

# Export as Excel
curl -X GET "http://localhost:3000/api/borrowings/export/custom-report?startDate=2026-01-01&endDate=2024-01-31&format=xlsx" \
  -H "x-api-key: my-secure-api-key-12345" \
  --output custom_report_january.xlsx

# Export last 30 days as Excel
curl -X GET "http://localhost:3000/api/borrowings/export/custom-report?startDate=2026-03-01&endDate=2024-03-31&format=xlsx" \
  -H "x-api-key: my-secure-api-key-12345" \
  --output march_report.xlsx

### UTILITY ENDPOINTS

20. Health Check (Public)
curl http://localhost:3000/health

21. Swagger Documentation (Public)
# Open in browser
open http://localhost:3000/api-docs

# Or get JSON spec
curl http://localhost:3000/api-docs.json