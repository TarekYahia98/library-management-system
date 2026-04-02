const bookService = require('../../src/services/bookService');
const Book = require('../../src/models/Book');
const Borrowing = require('../../src/models/Borrowing');

// Mock the models
jest.mock('../../src/models/Book');
jest.mock('../../src/models/Borrowing');

describe('BookService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBook', () => {
    it('should create a new book successfully', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        availableQuantity: 5,
        shelfLocation: 'A-12'
      };

      const expectedBook = { id: '123-uuid', ...bookData };

      Book.findOne.mockResolvedValue(null);
      Book.create.mockResolvedValue(expectedBook);

      const result = await bookService.createBook(bookData);

      expect(result).toEqual(expectedBook);
      expect(Book.findOne).toHaveBeenCalledWith({ where: { isbn: bookData.isbn } });
      expect(Book.create).toHaveBeenCalledWith(bookData);
    });

    it('should throw error if ISBN already exists', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        availableQuantity: 5,
        shelfLocation: 'A-12'
      };

      Book.findOne.mockResolvedValue({ id: 'existing', isbn: '1234567890123' });

      await expect(bookService.createBook(bookData))
        .rejects
        .toThrow('Book with this ISBN already exists');
    });

    it('should throw error if required fields are missing', async () => {
      const invalidBookData = {
        title: 'Test Book'
        // Missing required fields
      };

      Book.create.mockRejectedValue(new Error('Validation error'));

      await expect(bookService.createBook(invalidBookData))
        .rejects
        .toThrow();
    });
  });

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const bookId = '123-uuid';
      const updateData = { title: 'Updated Title', availableQuantity: 3 };
      const existingBook = {
        id: bookId,
        title: 'Original Title',
        update: jest.fn().mockResolvedValue({ ...updateData, id: bookId })
      };

      Book.findByPk.mockResolvedValue(existingBook);

      const result = await bookService.updateBook(bookId, updateData);

      expect(existingBook.update).toHaveBeenCalledWith(updateData);
      expect(result).toBeDefined();
    });

    it('should throw error if book not found', async () => {
      const bookId = 'non-existent-id';
      const updateData = { title: 'Updated Title' };

      Book.findByPk.mockResolvedValue(null);

      await expect(bookService.updateBook(bookId, updateData))
        .rejects
        .toThrow('Book not found');
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully when no active borrowings', async () => {
      const bookId = '123-uuid';
      const mockBook = {
        id: bookId,
        destroy: jest.fn().mockResolvedValue(true)
      };

      Book.findByPk.mockResolvedValue(mockBook);
      Borrowing.count.mockResolvedValue(0);

      const result = await bookService.deleteBook(bookId);

      expect(result.message).toBe('Book deleted successfully');
      expect(mockBook.destroy).toHaveBeenCalled();
    });

    it('should throw error if book has active borrowings', async () => {
      const bookId = '123-uuid';
      const mockBook = {
        id: bookId,
        destroy: jest.fn()
      };

      Book.findByPk.mockResolvedValue(mockBook);
      Borrowing.count.mockResolvedValue(2); // 2 active borrowings

      await expect(bookService.deleteBook(bookId))
        .rejects
        .toThrow('Cannot delete book with active borrowings');
      expect(mockBook.destroy).not.toHaveBeenCalled();
    });

    it('should throw error if book not found', async () => {
      const bookId = 'non-existent-id';

      Book.findByPk.mockResolvedValue(null);

      await expect(bookService.deleteBook(bookId))
        .rejects
        .toThrow('Book not found');
    });
  });

  describe('listBooks', () => {
    it('should return paginated books without search', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1' },
        { id: '2', title: 'Book 2' }
      ];

      Book.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockBooks
      });

      const result = await bookService.listBooks(1, 10);

      expect(result.books).toEqual(mockBooks);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return paginated books with search', async () => {
      const searchTerm = 'Test';
      const mockBooks = [
        { id: '1', title: 'Test Book 1' },
        { id: '2', title: 'Test Book 2' }
      ];

      Book.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockBooks
      });

      const result = await bookService.listBooks(1, 10, searchTerm);

      expect(result.books).toEqual(mockBooks);
      expect(Book.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object)
        })
      );
    });

    it('should handle empty results', async () => {
      Book.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const result = await bookService.listBooks(1, 10);

      expect(result.books).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('searchBook', () => {
    it('should search books by title', async () => {
      const searchTerm = 'JavaScript';
      const mockBooks = [
        { id: '1', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford' }
      ];

      Book.findAll.mockResolvedValue(mockBooks);

      const result = await bookService.searchBook(searchTerm);

      expect(result).toEqual(mockBooks);
      expect(Book.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no books found', async () => {
      const searchTerm = 'NonExistentBook';
      Book.findAll.mockResolvedValue([]);

      const result = await bookService.searchBook(searchTerm);

      expect(result).toEqual([]);
    });
  });
});