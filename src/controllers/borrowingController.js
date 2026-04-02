const borrowingService = require('../services/borrowingService');
const { Parser } = require('json2csv');
const XLSX = require('xlsx');

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

  /**
   * Export all overdue books from last month to CSV or Excel
   */
  async exportOverdueBooksLastMonth(req, res, next) {
    try {
      const format = req.query.format || 'csv';
      
      // Calculate last month's date range
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      
      // Get overdue books from last month only
      const overdueBooks = await borrowingService.getOverdueBooksByDateRange(
        startOfLastMonth, 
        endOfLastMonth
      );
      
      if (overdueBooks.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No overdue books found for last month'
        });
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
      
      if (format === 'xlsx') {
        // Export to Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Overdue Books Last Month');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=overdue_books_${startOfLastMonth.toISOString().split('T')[0]}_to_${endOfLastMonth.toISOString().split('T')[0]}.xlsx`);
        return res.send(buffer);
      } else {
        // Export to CSV
        const parser = new Parser();
        const csv = parser.parse(exportData);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=overdue_books_${startOfLastMonth.toISOString().split('T')[0]}_to_${endOfLastMonth.toISOString().split('T')[0]}.csv`);
        return res.send(csv);
      }
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Export all borrowing processes from last month to CSV or Excel
   */
  async exportAllBorrowingsLastMonth(req, res, next) {
    try {
      const format = req.query.format || 'csv';
      
      // Calculate last month's date range
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      
      // Get all borrowings from last month
      const borrowings = await borrowingService.getBorrowingsByDateRange(
        startOfLastMonth, 
        endOfLastMonth
      );
      
      if (borrowings.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No borrowing records found for last month'
        });
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
      
      if (format === 'xlsx') {
        // Export to Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Borrowings Last Month');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=borrowings_${startOfLastMonth.toISOString().split('T')[0]}_to_${endOfLastMonth.toISOString().split('T')[0]}.xlsx`);
        return res.send(buffer);
      } else {
        // Export to CSV
        const parser = new Parser();
        const csv = parser.parse(exportData);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=borrowings_${startOfLastMonth.toISOString().split('T')[0]}_to_${endOfLastMonth.toISOString().split('T')[0]}.csv`);
        return res.send(csv);
      }
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Export custom date range report
   */
  async exportCustomReport(req, res, next) {
    try {
      const { startDate, endDate, format = 'csv' } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required'
        });
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const borrowings = await borrowingService.getBorrowingsByDateRange(start, end);
      
      if (borrowings.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No borrowing records found for the specified date range'
        });
      }
      
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
      
      if (format === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Custom Report');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=custom_report_${startDate}_to_${endDate}.xlsx`);
        return res.send(buffer);
      } else {
        const parser = new Parser();
        const csv = parser.parse(exportData);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=custom_report_${startDate}_to_${endDate}.csv`);
        return res.send(csv);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BorrowingController();