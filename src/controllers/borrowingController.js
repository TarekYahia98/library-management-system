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
      
      const exportData = await borrowingService.getFormattedOverdueBooksExport(format);
      
      if (!exportData) {
        return res.status(404).json({
          success: false,
          message: 'No overdue books found for last month'
        });
      }
      
      if (format === 'xlsx') {
        // Export to Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, exportData.sheetName);
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${exportData.filename}.xlsx`);
        return res.send(buffer);
      } else {
        // Export to CSV
        const parser = new Parser();
        const csv = parser.parse(exportData.data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${exportData.filename}.csv`);
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
      
      const exportData = await borrowingService.getFormattedAllBorrowingsExport(format);
      
      if (!exportData) {
        return res.status(404).json({
          success: false,
          message: 'No borrowing records found for last month'
        });
      }
      
      if (format === 'xlsx') {
        // Export to Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, exportData.sheetName);
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${exportData.filename}.xlsx`);
        return res.send(buffer);
      } else {
        // Export to CSV
        const parser = new Parser();
        const csv = parser.parse(exportData.data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${exportData.filename}.csv`);
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
      
      const exportData = await borrowingService.getFormattedCustomReportExport(startDate, endDate, format);
      
      if (!exportData) {
        return res.status(404).json({
          success: false,
          message: 'No borrowing records found for the specified date range'
        });
      }
      
      if (format === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(exportData.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, exportData.sheetName);
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${exportData.filename}.xlsx`);
        return res.send(buffer);
      } else {
        const parser = new Parser();
        const csv = parser.parse(exportData.data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${exportData.filename}.csv`);
        return res.send(csv);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BorrowingController();