const { Op } = require('sequelize');
const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const Borrower = require('../models/Borrower');
const { DEFAULT_LOAN_DAYS, MAX_BOOKS_PER_BORROWER } = require('../config/constants');

class BorrowingService {
  async checkoutBook(borrowerId, bookId, daysToReturn = DEFAULT_LOAN_DAYS) {
    const transaction = await Borrowing.sequelize.transaction();
    
    try {
      const book = await Book.findByPk(bookId, { transaction });
      if (!book) {
        throw new Error('Book not found');
      }
      
      if (book.availableQuantity <= 0) {
        throw new Error('No copies available');
      }
      
      const borrower = await Borrower.findByPk(borrowerId, { transaction });
      if (!borrower) {
        throw new Error('Borrower not found');
      }
      
      const activeBorrowings = await Borrowing.count({
        where: {
          borrowerId,
          status: 'active'
        },
        transaction
      });
      
      if (activeBorrowings >= MAX_BOOKS_PER_BORROWER) {
        throw new Error(`Borrower has reached maximum number of books (${MAX_BOOKS_PER_BORROWER})`);
      }
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysToReturn);
      
      const borrowing = await Borrowing.create({
        borrowerId,
        bookId,
        dueDate,
        checkoutDate: new Date(),
        status: 'active'
      }, { transaction });
      
      await book.update({
        availableQuantity: book.availableQuantity - 1
      }, { transaction });
      
      await transaction.commit();
      
      return await Borrowing.findByPk(borrowing.id, {
        include: [
          { model: Book, attributes: ['title', 'author', 'isbn'] },
          { model: Borrower, attributes: ['name', 'email'] }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async returnBook(borrowingId) {
    const transaction = await Borrowing.sequelize.transaction();
    
    try {
      const borrowing = await Borrowing.findByPk(borrowingId, {
        include: [Book],
        transaction
      });
      
      if (!borrowing) {
        throw new Error('Borrowing record not found');
      }
      
      if (borrowing.status === 'returned') {
        throw new Error('Book already returned');
      }
      
      borrowing.returnDate = new Date();
      borrowing.status = 'returned';
      await borrowing.save({ transaction });
      
      await borrowing.Book.update({
        availableQuantity: borrowing.Book.availableQuantity + 1
      }, { transaction });
      
      await transaction.commit();
      return borrowing;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async getBorrowerBooks(borrowerId) {
    return await Borrowing.findAll({
      where: {
        borrowerId,
        status: 'active'
      },
      include: [
        {
          model: Book,
          attributes: ['title', 'author', 'isbn', 'shelfLocation']
        }
      ],
      order: [['dueDate', 'ASC']]
    });
  }
  
  async getOverdueBooks() {
    const now = new Date();
    return await Borrowing.findAll({
      where: {
        status: 'active',
        dueDate: { [Op.lt]: now }
      },
      include: [
        {
          model: Book,
          attributes: ['title', 'author', 'isbn', 'shelfLocation']
        },
        {
          model: Borrower,
          attributes: ['name', 'email']
        }
      ]
    });
  }
}

module.exports = new BorrowingService();