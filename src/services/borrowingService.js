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

  async getOverdueBooksByDateRange(startDate, endDate) {
    return await Borrowing.findAll({
      where: {
        status: 'active',
        dueDate: {
          [Op.lt]: new Date(), // Overdue (due date before today)
          [Op.between]: [startDate, endDate] // Within date range
        }
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
      ],
      order: [['dueDate', 'ASC']]
    });
  }

  async getBorrowingsByDateRange(startDate, endDate) {
    return await Borrowing.findAll({
      where: {
        checkoutDate: {
          [Op.between]: [startDate, endDate]
        }
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
      ],
      order: [['checkoutDate', 'DESC']]
    });
  }

  /**
   * Get formatted export data for overdue books from last month
   */
  async getFormattedOverdueBooksExport(format = 'csv') {
    // Calculate last month's date range
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    
    // Get overdue books from last month only
    const overdueBooks = await this.getOverdueBooksByDateRange(
      startOfLastMonth, 
      endOfLastMonth
    );
    
    if (overdueBooks.length === 0) {
      return null;
    }
    
    // Format data for export
    const exportData = overdueBooks.map(book => ({
      'Book Title': book.Book?.title || 'N/A',
      'Author': book.Book?.author || 'N/A',
      'ISBN': book.Book?.isbn || 'N/A',
      'Borrower Name': book.Borrower?.name || 'N/A',
      'Borrower Email': book.Borrower?.email || 'N/A',
      'Checkout Date': new Date(book.checkoutDate).toLocaleDateString(),
      'Due Date': new Date(book.dueDate).toLocaleDateString(),
      'Days Overdue': Math.floor((new Date() - new Date(book.dueDate)) / (1000 * 60 * 60 * 24)),
      'Status': book.status
    }));
    
    return {
      data: exportData,
      filename: `overdue_books_${startOfLastMonth.toISOString().split('T')[0]}_to_${endOfLastMonth.toISOString().split('T')[0]}`,
      sheetName: 'Overdue Books Last Month'
    };
  }

  /**
   * Get formatted export data for all borrowings from last month
   */
  async getFormattedAllBorrowingsExport(format = 'csv') {
    // Calculate last month's date range
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    
    // Get all borrowings from last month
    const borrowings = await this.getBorrowingsByDateRange(
      startOfLastMonth, 
      endOfLastMonth
    );
    
    if (borrowings.length === 0) {
      return null;
    }
    
    // Format data for export
    const exportData = borrowings.map(borrowing => ({
      'Book Title': borrowing.Book?.title || 'N/A',
      'Author': borrowing.Book?.author || 'N/A',
      'ISBN': borrowing.Book?.isbn || 'N/A',
      'Borrower Name': borrowing.Borrower?.name || 'N/A',
      'Borrower Email': borrowing.Borrower?.email || 'N/A',
      'Checkout Date': new Date(borrowing.checkoutDate).toLocaleDateString(),
      'Due Date': new Date(borrowing.dueDate).toLocaleDateString(),
      'Return Date': borrowing.returnDate ? new Date(borrowing.returnDate).toLocaleDateString() : 'Not Returned',
      'Status': borrowing.status,
      'Days Borrowed': borrowing.returnDate ? 
        Math.floor((new Date(borrowing.returnDate) - new Date(borrowing.checkoutDate)) / (1000 * 60 * 60 * 24)) : 
        Math.floor((new Date() - new Date(borrowing.checkoutDate)) / (1000 * 60 * 60 * 24))
    }));
    
    return {
      data: exportData,
      filename: `borrowings_${startOfLastMonth.toISOString().split('T')[0]}_to_${endOfLastMonth.toISOString().split('T')[0]}`,
      sheetName: 'Borrowings Last Month'
    };
  }

  /**
   * Get formatted export data for custom date range report
   */
  async getFormattedCustomReportExport(startDate, endDate, format = 'csv') {
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const borrowings = await this.getBorrowingsByDateRange(start, end);
    
    if (borrowings.length === 0) {
      return null;
    }
    
    // Format data for export
    const exportData = borrowings.map(borrowing => ({
      'Book Title': borrowing.Book?.title || 'N/A',
      'Author': borrowing.Book?.author || 'N/A',
      'ISBN': borrowing.Book?.isbn || 'N/A',
      'Borrower Name': borrowing.Borrower?.name || 'N/A',
      'Borrower Email': borrowing.Borrower?.email || 'N/A',
      'Checkout Date': new Date(borrowing.checkoutDate).toLocaleDateString(),
      'Due Date': new Date(borrowing.dueDate).toLocaleDateString(),
      'Return Date': borrowing.returnDate ? new Date(borrowing.returnDate).toLocaleDateString() : 'Not Returned',
      'Status': borrowing.status
    }));
    
    return {
      data: exportData,
      filename: `custom_report_${startDate}_to_${endDate}`,
      sheetName: 'Custom Report'
    };
  }
}

module.exports = new BorrowingService();