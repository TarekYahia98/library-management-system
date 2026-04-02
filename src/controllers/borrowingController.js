const borrowingService = require('../services/borrowingService');

class BorrowingController {
  async checkoutBook(req, res, next) {
    try {
      const { borrowerId, bookId, daysToReturn } = req.body;
      const borrowing = await borrowingService.checkoutBook(borrowerId, bookId, daysToReturn);
      res.status(201).json({
        success: true,
        data: borrowing,
        message: 'Book checked out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async returnBook(req, res, next) {
    try {
      const borrowing = await borrowingService.returnBook(req.params.id);
      res.status(200).json({
        success: true,
        data: borrowing,
        message: 'Book returned successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getBorrowerBooks(req, res, next) {
    try {
      const books = await borrowingService.getBorrowerBooks(req.params.borrowerId);
      res.status(200).json({
        success: true,
        data: books,
        count: books.length
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getOverdueBooks(req, res, next) {
    try {
      const overdueBooks = await borrowingService.getOverdueBooks();
      res.status(200).json({
        success: true,
        data: overdueBooks,
        count: overdueBooks.length
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BorrowingController();