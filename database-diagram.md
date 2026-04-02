# Database Schema Diagram

## Entity Relationship Diagram (ERD)

┌─────────────────────────────────────────────────────────────────┐
│ BOOKS │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id │ UUID │
│ │ title │ VARCHAR(255) NOT NULL │
│ │ author │ VARCHAR(255) NOT NULL │
│ │ isbn │ VARCHAR(13) NOT NULL UNIQUE │
│ │ availableQuantity │ INTEGER NOT NULL DEFAULT 1 │
│ │ shelfLocation │ VARCHAR(255) NOT NULL │
│ │ createdAt │ TIMESTAMP │
│ │ updatedAt │ TIMESTAMP │
├─────────────────────────────────────────────────────────────────┤
│ INDEXES: idx_books_title, idx_books_author, idx_books_isbn │
└─────────────────────────────────────────────────────────────────┘
│
│ 1
│
│ HAS MANY
│
│ N
▼
┌─────────────────────────────────────────────────────────────────┐
│ BORROWINGS │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id │ UUID │
│ FK │ bookId │ UUID NOT NULL │
│ FK │ borrowerId │ UUID NOT NULL │
│ │ checkoutDate │ TIMESTAMP NOT NULL │
│ │ dueDate │ TIMESTAMP NOT NULL │
│ │ returnDate │ TIMESTAMP │
│ │ status │ ENUM('active','returned','overdue') │
│ │ createdAt │ TIMESTAMP │
│ │ updatedAt │ TIMESTAMP │
├─────────────────────────────────────────────────────────────────┤
│ INDEXES: idx_borrowings_status, idx_borrowings_duedate, │
│ idx_borrowings_bookid, idx_borrowings_borrowerid │
└─────────────────────────────────────────────────────────────────┘
│
│ N
│
│ BELONGS TO
│
│ 1
▼
┌─────────────────────────────────────────────────────────────────┐
│ BORROWERS │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id │ UUID │
│ │ name │ VARCHAR(100) NOT NULL │
│ │ email │ VARCHAR(255) NOT NULL UNIQUE │
│ │ registeredDate │ TIMESTAMP DEFAULT NOW() │
│ │ createdAt │ TIMESTAMP │
│ │ updatedAt │ TIMESTAMP │
├─────────────────────────────────────────────────────────────────┤
│ INDEXES: idx_borrowers_email, idx_borrowers_name │
└─────────────────────────────────────────────────────────────────┘