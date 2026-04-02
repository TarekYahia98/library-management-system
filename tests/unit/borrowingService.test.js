const borrowingService = require('../../src/services/borrowingService');
const Borrowing = require('../../src/models/Borrowing');
const Book = require('../../src/models/Book');
const Borrower = require('../../src/models/Borrower');

jest.mock('../../src/models/Borrowing');
jest.mock('../../src/models/Book');
jest.mock('../../src/models/Borrower');

describe('BorrowingService Unit Tests', () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };
    Borrowing.sequelize = {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    };
  });

  describe('checkoutBook', () => {
    it('should checkout a book successfully', async () => {
      const borrowerId = 'borrower-uuid';
      const bookId = 'book-uuid';
      const daysToReturn = 14;

      const mockBook = {
        id: bookId,
        availableQuantity: 5,
        update: jest.fn().mockResolvedValue(true)
      };

      const mockBorrower = {
        id: borrowerId,
        name: 'John Doe'
      };

      const mockBorrowing = {
        id: 'borrowing-uuid',
        borrowerId,
        bookId,
        status: 'active'
      };

      Book.findByPk.mockResolvedValue(mockBook);
      Borrower.findByPk.mockResolvedValue(mockBorrower);
      Borrowing.count.mockResolvedValue(0);
      Borrowing.create.mockResolvedValue(mockBorrowing);
      Borrowing.findByPk.mockResolvedValue(mockBorrowing);

      const result = await borrowingService.checkoutBook(borrowerId, bookId, daysToReturn);

      expect(result).toBeDefined();
      expect(mockBook.update).toHaveBeenCalledWith({ availableQuantity: 4 });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if book not found', async () => {
      Book.findByPk.mockResolvedValue(null);

      await expect(borrowingService.checkoutBook('borrower-id', 'book-id', 14))
        .rejects
        .toThrow('Book not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if no copies available', async () => {
      const mockBook = {
        id: 'book-id',
        availableQuantity: 0
      };

      Book.findByPk.mockResolvedValue(mockBook);

      await expect(borrowingService.checkoutBook('borrower-id', 'book-id', 14))
        .rejects
        .toThrow('No copies available');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if borrower not found', async () => {
      const mockBook = {
        id: 'book-id',
        availableQuantity: 5
      };

      Book.findByPk.mockResolvedValue(mockBook);
      Borrower.findByPk.mockResolvedValue(null);

      await expect(borrowingService.checkoutBook('borrower-id', 'book-id', 14))
        .rejects
        .toThrow('Borrower not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if borrower has reached max books limit', async () => {
      const mockBook = {
        id: 'book-id',
        availableQuantity: 5
      };

      const mockBorrower = {
        id: 'borrower-id'
      };

      Book.findByPk.mockResolvedValue(mockBook);
      Borrower.findByPk.mockResolvedValue(mockBorrower);
      Borrowing.count.mockResolvedValue(5); // Already has 5 books

      await expect(borrowingService.checkoutBook('borrower-id', 'book-id', 14))
        .rejects
        .toThrow('Borrower has reached maximum number of books');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('returnBook', () => {
    it('should return a book successfully', async () => {
      const borrowingId = 'borrowing-uuid';
      const mockBorrowing = {
        id: borrowingId,
        status: 'active',
        Book: {
          id: 'book-id',
          availableQuantity: 4,
          update: jest.fn().mockResolvedValue(true)
        },
        save: jest.fn().mockResolvedValue(true)
      };

      Borrowing.findByPk.mockResolvedValue(mockBorrowing);

      const result = await borrowingService.returnBook(borrowingId);

      expect(mockBorrowing.status).toBe('returned');
      expect(mockBorrowing.returnDate).toBeDefined();
      expect(mockBorrowing.Book.update).toHaveBeenCalledWith({ availableQuantity: 5 });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if borrowing record not found', async () => {
      Borrowing.findByPk.mockResolvedValue(null);

      await expect(borrowingService.returnBook('invalid-id'))
        .rejects
        .toThrow('Borrowing record not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if book already returned', async () => {
      const mockBorrowing = {
        id: 'borrowing-uuid',
        status: 'returned',
        Book: {}
      };

      Borrowing.findByPk.mockResolvedValue(mockBorrowing);

      await expect(borrowingService.returnBook('borrowing-uuid'))
        .rejects
        .toThrow('Book already returned');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getBorrowerBooks', () => {
    it('should return active books for a borrower', async () => {
      const borrowerId = 'borrower-uuid';
      const mockBooks = [
        { id: '1', Book: { title: 'Book 1' } },
        { id: '2', Book: { title: 'Book 2' } }
      ];

      Borrowing.findAll.mockResolvedValue(mockBooks);

      const result = await borrowingService.getBorrowerBooks(borrowerId);

      expect(result).toEqual(mockBooks);
      expect(Borrowing.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { borrowerId, status: 'active' }
        })
      );
    });

    it('should return empty array if no active books', async () => {
      Borrowing.findAll.mockResolvedValue([]);

      const result = await borrowingService.getBorrowerBooks('borrower-id');

      expect(result).toEqual([]);
    });
  });

  describe('getOverdueBooks', () => {
    it('should return overdue books', async () => {
      const mockOverdueBooks = [
        { id: '1', dueDate: new Date('2020-01-01'), Book: { title: 'Overdue Book' } }
      ];

      Borrowing.findAll.mockResolvedValue(mockOverdueBooks);

      const result = await borrowingService.getOverdueBooks();

      expect(result).toEqual(mockOverdueBooks);
      expect(Borrowing.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active'
          })
        })
      );
    });
  });
});