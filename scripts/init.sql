-- Create database
CREATE DATABASE IF NOT EXISTS library_db;
-- Connect to database
\ c library_db;
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create tables
CREATE TABLE IF NOT EXISTS "Books" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13) NOT NULL UNIQUE,
    "availableQuantity" INTEGER NOT NULL DEFAULT 1,
    "shelfLocation" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "Borrowers" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    "registeredDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "Borrowings" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bookId" UUID NOT NULL REFERENCES "Books"(id) ON DELETE RESTRICT,
    "borrowerId" UUID NOT NULL REFERENCES "Borrowers"(id) ON DELETE RESTRICT,
    "checkoutDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "returnDate" TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes
CREATE INDEX idx_books_title ON "Books"(title);
CREATE INDEX idx_books_author ON "Books"(author);
CREATE INDEX idx_books_isbn ON "Books"(isbn);
CREATE INDEX idx_borrowers_email ON "Borrowers"(email);
CREATE INDEX idx_borrowings_status ON "Borrowings"(status);
CREATE INDEX idx_borrowings_duedate ON "Borrowings"("dueDate");
-- Insert sample data
INSERT INTO "Books" (
        title,
        author,
        isbn,
        "availableQuantity",
        "shelfLocation"
    )
VALUES (
        'The Great Gatsby',
        'F. Scott Fitzgerald',
        '9780743273565',
        3,
        'A-12'
    ),
    (
        'To Kill a Mockingbird',
        'Harper Lee',
        '9780061120084',
        2,
        'B-05'
    ),
    (
        '1984',
        'George Orwell',
        '9780451524935',
        5,
        'C-08'
    ),
    (
        'Pride and Prejudice',
        'Jane Austen',
        '9780141439518',
        4,
        'D-03'
    ),
    (
        'The Catcher in the Rye',
        'J.D. Salinger',
        '9780316769488',
        1,
        'E-15'
    );
INSERT INTO "Borrowers" (name, email)
VALUES ('Tarek Yahia', 'tarek.yahia@gmail.com'),
    ('Ahmed', 'Ahmed@gmail.com'),
    ('Ali', 'Ali@gmail.com');