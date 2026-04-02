const bookService = require('../services/bookService');

class BookController {
  async createBook(req, res, next) {
    try {
      const book = await bookService.createBook(req.body);
      res.status(201).json({
        success: true,
        data: book,
        message: 'Book created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateBook(req, res, next) {
    try {
      const book = await bookService.updateBook(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: book,
        message: 'Book updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteBook(req, res, next) {
    try {
      const result = await bookService.deleteBook(req.params.id);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
  
  async listBooks(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const result = await bookService.listBooks(parseInt(page), parseInt(limit), search);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
  
  async searchBook(req, res, next) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const books = await bookService.searchBook(q);
      res.status(200).json({
        success: true,
        data: books,
        count: books.length
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookController();